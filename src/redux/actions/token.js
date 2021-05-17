/* eslint-disable import/no-cycle */
import type from '@src/redux/types/token';
import {
  accountSelector,
  selectedPrivacySelector,
  tokenSelector,
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
  getTypeHistoryReceive,
  handleFilterHistoryReceiveByTokenId,
  mergeReceiveAndLocalHistory,
} from '@src/redux/utils/token';
import internalTokenModel from '@models/token';
import { getReceiveHistoryByRPC } from '@src/services/wallet/RpcClientService';
import { actionLogEvent } from '@src/screens/Performance';
import { ConfirmedTx } from '@src/services/wallet/WalletService';
import { CONSTANT_COMMONS } from '@src/constants';
import { uniqBy } from 'lodash';
import { receiveHistorySelector } from '@src/redux/selectors/token';
import { MAX_LIMIT_RECEIVE_HISTORY_ITEM } from '@src/redux/reducers/token';
import { PRV_ID } from '@screens/DexV2/constants';
import { devSelector } from '@src/screens/Dev';
import { setWallet } from './wallet';

export const setToken = (
  token = throw new Error('Token object is required'),
) => ({
  type: type.SET,
  data: token,
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
    const state = getState();
    const wallet = state?.wallet;
    const isDev = devSelector(state);
    const account = accountSelector.defaultAccount(getState());
    if (!wallet) {
      throw new Error('Wallet is not exist');
    }
    if (!account) {
      throw new Error('Account is not exist');
    }
    const balance = await accountService.getBalance(account, wallet, token.id);
    if (isDev) {
      const { coinsStorage } = await accountService.getStorageAccountByTokenId(
        account,
        wallet,
        token?.id,
      );
      if (coinsStorage) {
        await dispatch(
          actionLogEvent({
            desc: coinsStorage,
          }),
        );
      }
    }
    dispatch(
      setToken({
        ...token,
        amount: balance,
        loading: false,
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
  if (!tokenId || tokenId === PRV_ID) {
    return;
  }
  try {
    const account = accountSelector.defaultAccount(state);
    const { pTokens, internalTokens } = state.token;
    const foundPToken = pTokens?.find((pToken) => pToken.tokenId === tokenId);
    const foundInternalToken =
      !foundPToken && internalTokens?.find((token) => token.id === tokenId);
    const token =
      (foundInternalToken && internalTokenModel.toJson(foundInternalToken)) ||
      foundPToken?.convertToToken();
    if (!token) throw Error('Can not follow empty coin');
    wallet = await accountService.addFollowingTokens([token], account, wallet);
    dispatch(setWallet(wallet));

    const followed = await accountService.getFollowingTokens(account, wallet);
    dispatch(setListToken(followed));
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
  if (!tokenId) {
    return;
  }
  try {
    const account = accountSelector.defaultAccount(state);
    wallet = await accountService.removeFollowingToken(
      tokenId,
      account,
      wallet,
    );
    dispatch(setWallet(wallet));
    const followed = await accountService.getFollowingTokens(account, wallet);
    dispatch(setListToken(followed));
  } catch (error) {
    dispatch(actionAddFollowTokenFail(tokenId));
    throw Error(error);
  }
};

export const actionFreeHistory = () => ({
  type: type.ACTION_FREE_HISTORY,
});

export const actionFetchingHistory = (payload) => ({
  type: type.ACTION_FETCHING_HISTORY,
  payload,
});

export const actionFetchedHistory = (payload) => ({
  type: type.ACTION_FETCHED_HISTORY,
  payload,
});

export const actionFetchFailHistory = () => ({
  type: type.ACTION_FETCH_FAIL_HISTORY,
});

export const actionFetchHistoryToken = (refreshing = false) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const selectedPrivacy = selectedPrivacySelector.selectedPrivacy(state);
    const token = selectedPrivacySelector.selectedPrivacyByFollowedSelector(
      state,
    );
    const { isFetching } = tokenSelector.historyTokenSelector(state);
    if (isFetching || !token?.id || !selectedPrivacy?.tokenId) {
      return;
    }
    await dispatch(actionFetchingHistory({ refreshing }));
    let histories = [];
    if (selectedPrivacy?.isToken) {
      let task = [
        dispatch(loadTokenHistory()),
        dispatch(getHistoryFromApi()),
        dispatch(actionFetchReceiveHistory(refreshing)),
      ];
      const [
        historiesToken,
        historiesTokenFromApi,
        receiveHistory,
      ] = await Promise.all(task);
      const mergeHistories = mergeReceiveAndLocalHistory({
        localHistory: historiesToken,
        receiveHistory,
      });
      histories = combineHistory({
        histories: mergeHistories,
        historiesFromApi: historiesTokenFromApi,
        symbol: selectedPrivacy?.symbol,
        externalSymbol: selectedPrivacy?.externalSymbol,
        decimals: selectedPrivacy?.decimals,
        pDecimals: selectedPrivacy?.pDecimals,
      });
    }
    await dispatch(actionFetchedHistory(histories));
  } catch (error) {
    await dispatch(actionFetchFailHistory());
    throw error;
  }
};

export const actionFetchHistoryMainCrypto = (refreshing = false) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const selectedPrivacy = selectedPrivacySelector.selectedPrivacy(state);
    const { isFetching } = tokenSelector.historyTokenSelector(state);
    if (
      isFetching ||
      !selectedPrivacy?.tokenId ||
      !selectedPrivacy.isMainCrypto
    ) {
      return;
    }
    await dispatch(actionFetchingHistory({ refreshing }));
    let histories = [];
    const [accountHistory, receiveHistory] = await new Promise.all([
      dispatch(loadAccountHistory()),
      dispatch(actionFetchReceiveHistory(refreshing)),
    ]);
    const mergeHistories = mergeReceiveAndLocalHistory({
      localHistory: accountHistory,
      receiveHistory,
    });
    histories = normalizeData(
      mergeHistories,
      selectedPrivacy?.decimals,
      selectedPrivacy?.pDecimals,
    );
    await dispatch(actionFetchedHistory(histories));
  } catch (error) {
    await dispatch(actionFetchFailHistory());
    throw error;
  }
};

export const actionToggleUnVerifiedToken = () => ({
  type: type.ACTION_TOGGLE_UNVERIFIED_TOKEN,
});

//

export const actionFetchingReceiveHistory = (payload) => ({
  type: type.ACTION_FETCHING_RECEIVE_HISTORY,
  payload,
});

export const actionFetchedReceiveHistory = (payload) => ({
  type: type.ACTION_FETCHED_RECEIVE_HISTORY,
  payload,
});

export const actionFetchFailReceiveHistory = () => ({
  type: type.ACTION_FETCH_FAIL_RECEIVE_HISTORY,
});

export const actionFreeReceiveHistory = () => ({
  type: type.ACTION_FREE_RECEIVE_HISTORY,
});

export const actionFetchReceiveHistory = (refreshing = false) => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const wallet = state?.wallet;
  const selectedPrivacy = selectedPrivacySelector.selectedPrivacy(state);
  let data = [];
  const receiveHistory = receiveHistorySelector(state);
  const { isFetching, oversize, page, limit, data: oldData } = receiveHistory;
  if (isFetching || (oversize && !refreshing) || !selectedPrivacy?.tokenId) {
    return [...oldData];
  }
  try {
    await dispatch(actionFetchingReceiveHistory({ refreshing }));
    const curPage = refreshing ? 0 : page;
    const curSkip = refreshing ? 0 : curPage * limit;
    const nextPage = curPage + 1;
    const curLimit =
      refreshing && page > 0 ? MAX_LIMIT_RECEIVE_HISTORY_ITEM : limit;
    const account = accountSelector?.defaultAccountSelector(state);
    // const key = `${selectedPrivacy?.tokenId}-${account?.readonlyKey}-${account?.paymentAddress}-${curLimit}-${curSkip}-RECEIVE-HISTORY`;
    const histories = await getReceiveHistoryByRPC({
      PaymentAddress: account?.paymentAddress,
      ReadonlyKey: account?.readonlyKey,
      Limit: curLimit,
      Skip: curSkip,
      TokenID: selectedPrivacy?.tokenId,
    });
    const historiesFilterByTokenId = handleFilterHistoryReceiveByTokenId({
      tokenId: selectedPrivacy?.tokenId,
      histories,
    });
    const spentCoins = await accountService.getListAccountSpentCoins(
      account,
      wallet,
      selectedPrivacy?.tokenId,
    );
    data = await new Promise.all([
      ...historiesFilterByTokenId?.map(async (history) => {
        const txID = history?.txID;
        let type = getTypeHistoryReceive({
          spentCoins,
          serialNumbers: history?.serialNumbers,
        });
        const h = {
          ...history,
          id: txID,
          incognitoTxID: txID,
          type,
          pDecimals: selectedPrivacy?.pDecimals,
          decimals: selectedPrivacy?.decimals,
          symbol: selectedPrivacy?.externalSymbol || selectedPrivacy?.symbol,
          status: ConfirmedTx,
          isHistoryReceived: true,
        };
        return h;
      }),
    ]);
    data = refreshing ? [...data, ...oldData] : [...oldData, ...data];
    data = uniqBy(data, (item) => item?.id) || [];
    data = data
      .filter(
        (history) => history?.type === CONSTANT_COMMONS.HISTORY.TYPE.RECEIVE,
      )
      .filter((history) => !!history?.amount);
    const oversize = histories?.length !== 0 && histories?.length < curLimit;
    const notEnoughData = data?.length < oldData?.length + 5;
    let payload = {
      nextPage,
      data,
      oversize,
      refreshing,
      notEnoughData,
    };
    await dispatch(actionFetchedReceiveHistory(payload));
  } catch (error) {
    data = [];
    await dispatch(actionFetchFailReceiveHistory());
  }
  return data;
};
