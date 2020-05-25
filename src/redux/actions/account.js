import {differenceBy} from 'lodash';
import type from '@src/redux/types/account';
import TokenModel from '@src/models/token';
import walletType from '@src/redux/types/wallet';
import accountService from '@src/services/wallet/accountService';
import {getPassphrase} from '@src/services/wallet/passwordService';
import {getUserUnfollowTokenIDs} from '@src/services/wallet/tokenService';
import convert from '@src/utils/convert';
import {tokenSeleclor, accountSeleclor} from '../selectors';
// eslint-disable-next-line import/no-cycle
import {getBalance as getTokenBalance, setListToken} from './token';

/**
 *  return basic account object from its name like its KEY, not including account methods (please use accountWallet instead)
 *
 * @param {object} state redux state
 * @param {string} accountName name of account you wanna get
 */
const getBasicAccountObjectByName = state => accountName => {
  return accountSeleclor.getAccountByName(state)(accountName);
};

export const setAccount = (
  account = throw new Error('Account object is required'),
) => ({
  type: type.SET,
  data: account,
});

export const setListAccount = (
  accounts = throw new Error('Account array is required'),
) => {
  if (accounts && accounts.constructor !== Array) {
    throw new TypeError('Accounts must be an array');
  }

  return {
    type: type.SET_LIST,
    data: accounts,
  };
};

export const removeAccount = (
  account = throw new Error('Account is required'),
) => async (dispatch, getState) => {
  try {
    const wallet = getState()?.wallet;

    if (!wallet) {
      throw new Error(
        'Wallet is not existed, can not remove account right now',
      );
    }

    const {PrivateKey} = account;

    const passphrase = await getPassphrase();
    await accountService.removeAccount(PrivateKey, passphrase, wallet);

    dispatch({
      type: type.REMOVE_BY_PRIVATE_KEY,
      data: PrivateKey,
    });

    return true;
  } catch (e) {
    throw e;
  }
};

export const getBalanceStart = accountName => ({
  type: type.GET_BALANCE,
  data: accountName,
});

export const getBalanceFinish = accountName => ({
  type: type.GET_BALANCE_FINISH,
  data: accountName,
});

export const setDefaultAccount = account => {
  accountService.saveDefaultAccountToStorage(account?.name);
  return {
    type: type.SET_DEFAULT_ACCOUNT,
    data: account,
  };
};

export const getBalance = account => async (dispatch, getState) => {
  let balance = 0;
  try {
    if (!account) throw new Error('Account object is required');

    dispatch(getBalanceStart(account?.name));

    const wallet = getState()?.wallet;

    if (!wallet) {
      throw new Error('Wallet is not exist');
    }

    balance = await accountService.getBalance(account, wallet);
    const accountMerge = {
      ...account,
      value: balance,
    };
    // console.log(TAG,'getBalance = accountMerge = ',accountMerge);
    dispatch(setAccount(accountMerge));
  } catch (e) {
    account &&
      dispatch(
        setAccount({
          ...account,
          value: null,
        }),
      );
    throw e;
  } finally {
    dispatch(getBalanceFinish(account?.name));
  }

  return balance ?? 0;
};

export const loadAllPTokenHasBalance = account => async (
  dispatch,
  getState,
) => {
  if (!account) {
    throw new Error('Account is required');
  }

  const state = getState();
  const wallet = state?.wallet;

  if (!wallet) {
    throw new Error('Wallet is not existed');
  }

  const allTokenData = await accountService.getListTokenHasBalance(
    account,
    wallet,
  );
  const followedToken = tokenSeleclor.followed(state);
  const allIncognitoTokens = tokenSeleclor.internalTokens(state);

  // get data of tokens that have balance
  const allTokens = allTokenData?.map(tokenData =>
    allIncognitoTokens?.find(t => t?.id === tokenData?.id),
  );

  const newTokens = differenceBy(allTokens, followedToken, 'id');

  // if token id has been existed in USER UNFOLLOWING LIST, ignore it!
  const userUnfollowedList = await getUserUnfollowTokenIDs();
  const shouldAddTokens = newTokens?.filter(
    token => !userUnfollowedList?.includes(token.id),
  );

  if (shouldAddTokens?.length > 0) {
    await accountService.addFollowingTokens(
      shouldAddTokens.map(TokenModel.toJson),
      account,
      wallet,
    );

    // update wallet object to store
    dispatch({
      type: walletType.SET,
      data: wallet,
    });
  }

  return allTokens;
};

export const reloadAccountFollowingToken = (
  account = throw new Error('Account object is required'),
  {shouldLoadBalance = true} = {},
) => async (dispatch, getState) => {
  try {
    const wallet = getState()?.wallet;

    if (!wallet) {
      throw new Error('Wallet is not exist');
    }

    const tokens = accountService.getFollowingTokens(account, wallet);

    shouldLoadBalance &&
      tokens.forEach(token => getTokenBalance(token)(dispatch, getState));

    dispatch(setListToken(tokens));

    return tokens;
  } catch (e) {
    throw e;
  }
};

export const followDefaultTokens = (
  account = throw new Error('Account object is required'),
  pTokenList,
) => async (dispatch, getState) => {
  try {
    const state = getState();
    const wallet = state?.wallet;
    const pTokens = pTokenList || tokenSeleclor.pTokens(state);

    if (!wallet) {
      throw new Error('Wallet is not exist');
    }

    const defaultTokens = [];
    pTokens?.forEach(token => {
      if (token.default) {
        defaultTokens.push(token.convertToToken());
      }
    });

    if (defaultTokens?.length > 0) {
      await accountService.addFollowingTokens(defaultTokens, account, wallet);
    }

    // update wallet object to store
    dispatch({
      type: walletType.SET,
      data: wallet,
    });

    return defaultTokens;
  } catch (e) {
    throw e;
  }
};

export const switchAccount = accountName => async (dispatch, getState) => {
  try {
    if (!accountName) throw new Error('accountName is required');

    const state = getState();
    const wallet = state?.wallet;

    if (!wallet) {
      throw new Error('Wallet is not exist');
    }

    const account = getBasicAccountObjectByName(state)(accountName);
    const defaultAccount = accountSeleclor.defaultAccount(state);

    if (defaultAccount?.name === account?.name) {
      return;
    }

    dispatch(setDefaultAccount(account));
    await getBalance(account)(dispatch, getState).catch(() => null);
    await reloadAccountFollowingToken(account)(dispatch, getState).catch(
      () => null,
    );

    return accountSeleclor.defaultAccount(state);
  } catch (e) {
    throw e;
  }
};

export const actionSwitchAccount = accountName => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const account = accountSeleclor.getAccountByName(state)(accountName);
    const defaultAccount = accountSeleclor.defaultAccount(state);
    if (defaultAccount?.name !== account?.name) {
      await dispatch(setDefaultAccount(account));
    }
    return account;
  } catch (error) {
    throw Error(error);
  }
};

export const actionReloadFollowingToken = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const wallet = state.wallet;
    const account = accountSeleclor.defaultAccount(state);
    const followed = await accountService.getFollowingTokens(account, wallet);
    await dispatch(getBalance(account));
    await new Promise.all(
      [...followed].map(async token => await dispatch(getTokenBalance(token))),
    );
    await dispatch(setListToken(followed));
    return followed;
  } catch (error) {
    throw Error(error);
  }
};

export const actionSendNativeToken = ({
  account,
  amount,
  fee,
  toAddress,
  pDecimals,
}) => async (dispatch, getState) => {
  try {
    const state = getState();
    const wallet = state?.wallet;
    const originalAmount = convert.toOriginalAmount(
      convert.toNumber(amount),
      pDecimals,
    );
    const originalFee = convert.toNumber(fee);
    const paymentInfos = [
      {
        paymentAddressStr: toAddress,
        amount: originalAmount,
      },
    ];
    const res = await accountService.createAndSendNativeToken(
      paymentInfos,
      originalFee,
      true,
      account,
      wallet,
      '',
    );
    if (res.txId) {
      return res;
    }
  } catch (error) {
    throw error;
  }
};

export const actionLoadAllBalance = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const accounts = accountSeleclor.listAccount(state);
    await new Promise.all(
      accounts.map(async account => await dispatch(getBalance(account))),
    );
  } catch (error) {
    throw Error(error);
  }
};
