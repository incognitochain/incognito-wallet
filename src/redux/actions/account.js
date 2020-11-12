/* eslint-disable import/no-cycle */
import { differenceBy } from 'lodash';
import type from '@src/redux/types/account';
import TokenModel from '@src/models/token';
import walletType from '@src/redux/types/wallet';
import accountService from '@src/services/wallet/accountService';
import { getPassphrase } from '@src/services/wallet/passwordService';
import { getUserUnfollowTokenIDs } from '@src/services/wallet/tokenService';
import convert from '@src/utils/convert';
import { reloadAccountList } from '@src/redux/actions/wallet';
import AccountModel from '@src/models/account';
import { actionLogEvent } from '@src/screens/Performance';
import {
  currentMasterKeySelector,
  masterlessKeyChainSelector,
  noMasterLessSelector
} from '@src/redux/selectors/masterKey';
import { switchMasterKey, updateMasterKey } from '@src/redux/actions/masterKey';
import { CustomError, ErrorCode } from '@services/exception';
import { storeWalletAccountIdsOnAPI } from '@services/wallet/WalletService';
import { tokenSeleclor, accountSeleclor } from '../selectors';
import { getBalance as getTokenBalance, setListToken } from './token';

/**
 *  return basic account object from its name like its KEY, not including account methods (please use accountWallet instead)
 *
 * @param {object} state redux state
 * @param {string} accountName name of account you wanna get
 */
const getBasicAccountObjectByName = (state) => (accountName) => {
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

export const removeAccount = (account) => async (dispatch, getState) => {
  try {
    const state = getState();
    const wallet = state?.wallet;
    if (!account) {
      new Error('Account is required');
    }
    if (!wallet) {
      throw new Error(
        'Wallet is not existed, can not remove account right now',
      );
    }

    const { PrivateKey } = account;

    const passphrase = await getPassphrase();

    const masterKey = currentMasterKeySelector(state);

    const walletAccountIndex = wallet.getAccountIndexByName(account.name);
    const walletAccount = wallet.MasterAccount.child[walletAccountIndex];
    const accountInfo = await walletAccount.getDeserializeInformation();
    if (!masterKey.deletedAccountIds) {
      masterKey.deletedAccountIds = [];
    }

    masterKey.deletedAccountIds.push(accountInfo.ID);
    dispatch(updateMasterKey(masterKey));

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

export const getBalanceStart = (accountName) => ({
  type: type.GET_BALANCE,
  data: accountName,
});

export const getBalanceFinish = (accountName) => ({
  type: type.GET_BALANCE_FINISH,
  data: accountName,
});

export const setDefaultAccount = (account) => {
  accountService.saveDefaultAccountToStorage(account?.name);
  return {
    type: type.SET_DEFAULT_ACCOUNT,
    data: account,
  };
};

export const getBalance = (account) => async (dispatch, getState) => {
  let balance = 0;
  try {
    if (!account) throw new Error('Account object is required');

    await dispatch(
      actionLogEvent({
        desc: `Getting balance account ${account?.name}`,
      }),
    );

    dispatch(getBalanceStart(account?.name));

    const wallet = getState()?.wallet;

    if (!wallet) {
      throw new Error('Wallet is not exist');
    }

    balance = await accountService.getBalance(account, wallet);

    await dispatch(
      actionLogEvent({
        desc: `Balance account ${account?.name} is: ${balance}`,
      }),
    );

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

    await dispatch(
      actionLogEvent({
        desc: `Finish balance account ${account?.name}`,
      }),
    );
  }

  return balance ?? 0;
};

export const reloadBalance = () => async (dispatch, getState) => {
  const state = getState();
  const account = accountSeleclor.defaultAccountSelector(state);
  await dispatch(getBalance(account));
};

export const loadAllPTokenHasBalance = (account) => async (
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
  const allTokens = allTokenData?.map((tokenData) =>
    allIncognitoTokens?.find((t) => t?.id === tokenData?.id),
  );

  const newTokens = differenceBy(allTokens, followedToken, 'id');

  // if token id has been existed in USER UNFOLLOWING LIST, ignore it!
  const userUnfollowedList = await getUserUnfollowTokenIDs();
  const shouldAddTokens = newTokens?.filter(
    (token) => !userUnfollowedList?.includes(token.id),
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
  { shouldLoadBalance = true } = {},
) => async (dispatch, getState) => {
  try {
    const wallet = getState()?.wallet;

    if (!wallet) {
      throw new Error('Wallet is not exist');
    }

    const tokens = accountService.getFollowingTokens(account, wallet);
    shouldLoadBalance &&
      tokens.forEach((token) => getTokenBalance(token)(dispatch, getState));

    dispatch(setListToken(tokens));

    return tokens;
  } catch (e) {
    throw e;
  }
};

export const followDefaultTokens = (account, pTokenList) => async (
  dispatch,
  getState,
) => {
  try {
    if (!account) {
      throw new Error('Account object is required');
    }
    const state = getState();
    const wallet = state?.wallet;
    const pTokens = pTokenList
      ? pTokenList
      : tokenSeleclor.pTokensSelector(state);

    if (!wallet) {
      throw new Error('Wallet is not exist');
    }
    const defaultTokens = [];
    pTokens?.forEach((token) => {
      if (token.default) {
        defaultTokens.push(token.convertToToken());
      }
    });
    if (defaultTokens.length > 0) {
      await accountService.addFollowingTokens(defaultTokens, account, wallet);
    }
    // update wallet object to store
    await dispatch({
      type: walletType.SET,
      data: wallet,
    });
    return defaultTokens;
  } catch (e) {
    throw e;
  }
};

export const switchAccount = (accountName) => async (dispatch, getState) => {
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
    await new Promise.all([
      dispatch(setDefaultAccount(account)),
      dispatch(getBalance(account)),
      dispatch(
        reloadAccountFollowingToken(account, { shouldLoadBalance: true }),
      ),
    ]);
    return accountSeleclor.defaultAccount(state);
  } catch (e) {
    throw e;
  }
};

export const actionSwitchAccountFetching = () => ({
  type: type.ACTION_SWITCH_ACCOUNT_FETCHING,
});

export const actionSwitchAccountFetched = () => ({
  type: type.ACTION_SWITCH_ACCOUNT_FETCHED,
});

export const actionSwitchAccountFetchFail = () => ({
  type: type.ACTION_SWITCH_ACCOUNT_FETCH_FAIL,
});

export const actionSwitchAccount = (
  accountName,
  shouldLoadBalance = true,
) => async (dispatch, getState) => {
  try {
    const state = getState();
    const account = accountSeleclor.getAccountByName(state)(accountName);
    const defaultAccount = accountSeleclor.defaultAccount(state);
    if (defaultAccount?.name !== account?.name) {
      await dispatch(setDefaultAccount(account));
    }
    dispatch(actionReloadFollowingToken(shouldLoadBalance));
    return account;
  } catch (error) {
    throw Error(error);
  }
};

export const actionReloadFollowingToken = (shouldLoadBalance = true) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const wallet = state.wallet;
    const account = accountSeleclor.defaultAccountSelector(state);
    const followed = await accountService.getFollowingTokens(account, wallet);
    dispatch(setListToken(followed));
    if (shouldLoadBalance) {
      dispatch(getBalance(account));
      [...followed].map((token) => dispatch(getTokenBalance(token)));
    }
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
      accounts.map(async (account) => await dispatch(getBalance(account))),
    );
  } catch (error) {
    throw Error(error);
  }
};

export const actionFetchingCreateAccount = () => ({
  type: type.ACTION_FETCHING_CREATE_ACCOUNT,
});

export const actionFetchedCreateAccount = () => ({
  type: type.ACTION_FETCHED_CREATE_ACCOUNT,
});

export const actionFetchFailCreateAccount = () => ({
  type: type.ACTION_FETCH_FAIL_CREATE_ACCOUNT,
});

export const actionFetchCreateAccount = ({ accountName }) => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const create = accountSeleclor.createAccountSelector(state);
  const wallet = state?.wallet;
  if (!!create || !accountName || !wallet) {
    return;
  }
  try {
    await dispatch(actionFetchingCreateAccount());
    const account = await accountService.createAccount(accountName, wallet);
    const serializedAccount = new AccountModel(
      accountService.toSerializedAccountObj(account),
    );
    await dispatch(reloadAccountList());
    await dispatch(followDefaultTokens(serializedAccount));
    await dispatch(actionFetchedCreateAccount());
    await dispatch(actionSwitchAccount(serializedAccount?.name, true));
    await storeWalletAccountIdsOnAPI(wallet);
    return serializedAccount;
  } catch (error) {
    await dispatch(actionFetchFailCreateAccount());
    throw error;
  }
};

export const actionFetchingImportAccount = () => ({
  type: type.ACTION_FETCHING_IMPORT_ACCOUNT,
});

export const actionFetchedImportAccount = () => ({
  type: type.ACTION_FETCHED_IMPORT_ACCOUNT,
});

export const actionFetchFailImportAccount = () => ({
  type: type.ACTION_FETCH_FAIL_IMPORT_ACCOUNT,
});

export const actionFetchImportAccount = ({ accountName, privateKey }) => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const importAccount = accountSeleclor.importAccountSelector(state);
  const masterless = masterlessKeyChainSelector(state);
  const masterKeys = noMasterLessSelector(state);

  let selectedMasterKey = masterless;

  if (!!importAccount || !accountName || !privateKey) {
    return;
  }
  try {
    await dispatch(actionFetchingImportAccount());
    const passphrase = await getPassphrase();

    const isValid = accountService.validatePrivateKey(privateKey);

    if (!isValid) {
      throw new CustomError(ErrorCode.web_js_import_invalid_key_2);
    }

    console.debug('MASTER KEYs', masterKeys);

    for (const masterKey of masterKeys) {
      console.debug('MASTER KEY', masterKey.name);
      try {
        const isCreated = await masterKey.wallet.hasCreatedAccount(privateKey);
        if (isCreated) {
          selectedMasterKey = masterKey;
          break;
        }
      } catch (e) {
        console.debug('CHECK CREATED ERROR', e);
      }
    }

    const wallet = await selectedMasterKey.wallet;

    const isImported = await accountService.importAccount(
      privateKey,
      accountName,
      passphrase,
      wallet,
    );
    if (isImported) {
      await dispatch(switchMasterKey(selectedMasterKey.name));
      await dispatch(actionFetchedImportAccount());
      const accountList = await dispatch(reloadAccountList());
      const account = accountList.find(
        (acc) => acc?.name === accountName || acc?.AccountName === accountName,
      );
      if (account) {
        await dispatch(followDefaultTokens(account));
        await dispatch(actionSwitchAccount(account?.name, true));
      }

      if (selectedMasterKey !== masterless) {
        await storeWalletAccountIdsOnAPI(wallet);
      }
    }
    return isImported;
  } catch (error) {
    await dispatch(actionFetchFailImportAccount());
    throw error;
  }
};
