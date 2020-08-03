/* eslint-disable import/no-cycle */
import type from '@src/redux/types/token';
import {
  accountSeleclor,
  selectedPrivacySeleclor,
  tokenSeleclor,
} from '@src/redux/selectors';
import { getTokenList } from '@src/services/api/token';
import tokenService from '@src/services/wallet/tokenService';
import accountService from '@src/services/wallet/accountService';
import {
  combineHistory,
  loadTokenHistory,
  getHistoryFromApi,
  loadAccountHistory,
  normalizeData,
} from '@src/redux/utils/token';
import { getBalance as getAccountBalance } from '@src/redux/actions/account';
import internalTokenModel from '@models/token';
import Util from '@src/utils/Util';
import { setWallet } from './wallet';
import {
  followingTokenSelector,
  isTokenFollowedSelector,
} from '../selectors/token';

export const setToken = (
  token = throw new Error('Token object is required'),
) => ({
  type: type.SET,
  data: token,
});

export const removeTokenById = (
  tokenId = throw new Error('Token id is required'),
) => ({
  type: type.REMOVE_BY_ID,
  data: tokenId,
});

/**
 * Replace with new list
 */
export const setListToken = (
  tokens = throw new Error('Token list is required'),
) => {
  if (tokens && tokens.constructor !== Array) {
    throw new TypeError('Tokens must be an array');
  }

  return {
    type: type.SET_LIST,
    data: tokens,
  };
};

/**
 * Replace with new list
 */
export const setListPToken = (
  tokens = throw new Error('Token list is required'),
) => {
  if (tokens && tokens.constructor !== Array) {
    throw new TypeError('Tokens must be an array');
  }

  return {
    type: type.SET_PTOKEN_LIST,
    data: tokens,
  };
};

export const setListInternalToken = (
  tokens = throw new Error('Token list is required'),
) => {
  if (tokens && tokens.constructor !== Array) {
    throw new TypeError('Tokens must be an array');
  }

  return {
    type: type.SET_INTERNAL_LIST,
    data: tokens,
  };
};

export const setBulkToken = (
  tokens = throw new Error('Token array is required'),
) => {
  if (tokens && tokens.constructor !== Array) {
    throw new TypeError('Tokens must be an array');
  }

  return {
    type: type.SET_BULK,
    data: tokens,
  };
};

export const getBalanceStart = (tokenSymbol) => ({
  type: type.GET_BALANCE,
  data: tokenSymbol,
});

export const getBalanceFinish = (tokenSymbol) => ({
  type: type.GET_BALANCE_FINISH,
  data: tokenSymbol,
});

export const getBalance = (token) => async (dispatch, getState) => {
  if (!token) {
    throw new Error('Token object is required');
  }
  try {
    await dispatch(getBalanceStart(token?.id));
    const wallet = getState()?.wallet;
    const account = accountSeleclor.defaultAccount(getState());
    if (!wallet) {
      throw new Error('Wallet is not exist');
    }
    if (!account) {
      throw new Error('Account is not exist');
    }
    const balance = await accountService.getBalance(account, wallet, token.id);
    dispatch(
      setToken({
        ...token,
        amount: balance,
      }),
    );
    return balance;
  } catch (e) {
    dispatch(
      setToken({
        ...token,
        amount: null,
      }),
    );
    throw e;
  } finally {
    dispatch(getBalanceFinish(token?.id));
  }
};

export const getPTokenList = () => async (dispatch) => {
  try {
    const tokens = await getTokenList();

    dispatch(setListPToken(tokens));

    return tokens;
  } catch (e) {
    throw e;
  }
};

export const getInternalTokenList = () => async (dispatch) => {
  try {
    const tokens = await tokenService.getPrivacyTokens();

    dispatch(setListInternalToken(tokens));

    return tokens;
  } catch (e) {
    throw e;
  }
};

export const actionAddFollowTokenFetching = (payload) => ({
  type: type.ADD_FOLLOW_TOKEN_FETCHING,
  payload,
});

export const actionAddFollowTokenFail = (payload) => ({
  type: type.ADD_FOLLOW_TOKEN_FAIL,
  payload,
});

export const actionAddFollowTokenSuccess = (payload) => ({
  type: type.ADD_FOLLOW_TOKEN_SUCCESS,
  payload,
});

export const actionAddFollowToken = (tokenId) => async (dispatch, getState) => {
  const state = getState();
  let wallet = state.wallet;
  try {
    const isTokenFollowed = isTokenFollowedSelector(state)(tokenId);
    const isFetchingFollowToken = followingTokenSelector(state)(tokenId);
    if (!!isFetchingFollowToken || !!isTokenFollowed) {
      return;
    }
    const account = accountSeleclor.defaultAccount(state);
    const { pTokens, internalTokens } = state.token;
    const foundPToken = pTokens?.find((pToken) => pToken.tokenId === tokenId);
    const foundInternalToken =
      !foundPToken && internalTokens?.find((token) => token.id === tokenId);
    const token =
      (foundInternalToken && internalTokenModel.toJson(foundInternalToken)) ||
      foundPToken?.convertToToken();
    if (!token) throw Error('Can not follow empty coin');
    dispatch(actionAddFollowTokenFetching(tokenId));
    await Util.delay(0);
    wallet = await accountService.addFollowingTokens([token], account, wallet);
    dispatch(setWallet(wallet));
    dispatch(actionAddFollowTokenSuccess(tokenId));
  } catch (error) {
    dispatch(actionAddFollowTokenFail(tokenId));
    throw Error(error);
  }
};

export const actionRemoveFollowToken = (tokenId) => async (
  dispatch,
  getState,
) => {
  const state = getState();
  let wallet = state.wallet;
  try {
    const isFetchingFollowToken = followingTokenSelector(state)(tokenId);
    const isTokenFollowed = isTokenFollowedSelector(state)(tokenId);
    if (!!isFetchingFollowToken || !isTokenFollowed) {
      return;
    }
    const account = accountSeleclor.defaultAccount(state);
    dispatch(actionAddFollowTokenFetching(tokenId));
    await Util.delay(0);
    wallet = await accountService.removeFollowingToken(
      tokenId,
      account,
      wallet,
    );
    dispatch(setWallet(wallet));
    dispatch(actionAddFollowTokenSuccess(tokenId));
  } catch (error) {
    dispatch(actionAddFollowTokenFail(tokenId));
    throw Error(error);
  }
};

export const actionInitHistory = () => ({
  type: type.ACTION_INIT_HISTORY,
});

export const actionFetchingHistory = () => ({
  type: type.ACTION_FETCHING_HISTORY,
});

export const actionFetchedHistory = (payload) => ({
  type: type.ACTION_FETCHED_HISTORY,
  payload,
});

export const actionFetchFailHistory = () => ({
  type: type.ACTION_FETCH_FAIL_HISTORY,
});

export const actionFetchHistoryToken = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const selectedPrivacy = selectedPrivacySeleclor.selectedPrivacy(state);
    const token = selectedPrivacySeleclor.selectedPrivacyByFollowedSelector(
      state,
    );
    const { isFetching } = tokenSeleclor.historyTokenSelector(state);
    if (isFetching || !token?.id || !selectedPrivacy?.tokenId) {
      return;
    }
    await dispatch(actionFetchingHistory());
    let histories = [];
    if (selectedPrivacy?.isToken) {
      let task = [dispatch(loadTokenHistory()), dispatch(getHistoryFromApi())];
      if (token) {
        task = [...task, dispatch(getBalance(token))];
      }
      const [historiesDt, historiesDtFromApi] = await Promise.all(task);
      histories = combineHistory(
        historiesDt,
        historiesDtFromApi,
        selectedPrivacy?.symbol,
        selectedPrivacy?.externalSymbol,
        selectedPrivacy?.decimals,
        selectedPrivacy?.pDecimals,
      );
    }
    await dispatch(actionFetchedHistory(histories));
  } catch (error) {
    await dispatch(actionFetchFailHistory());
  }
};

export const actionFetchHistoryMainCrypto = () => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const selectedPrivacy = selectedPrivacySeleclor.selectedPrivacy(state);
    const account = accountSeleclor.defaultAccountSelector(state);
    const { isFetching } = tokenSeleclor.historyTokenSelector(state);
    if (isFetching || !selectedPrivacy?.tokenId) {
      return;
    }
    await dispatch(actionFetchingHistory());
    let histories = [];
    if (selectedPrivacy?.isMainCrypto) {
      const [accountHistory] = await new Promise.all([
        dispatch(loadAccountHistory()),
        dispatch(getAccountBalance(account)),
      ]);
      histories = normalizeData(
        accountHistory,
        selectedPrivacy?.decimals,
        selectedPrivacy?.pDecimals,
      );
    }
    await dispatch(actionFetchedHistory(histories));
  } catch (error) {
    await dispatch(actionFetchFailHistory());
  }
};
