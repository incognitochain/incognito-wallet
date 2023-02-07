/* eslint-disable no-unreachable */
/* eslint-disable import/no-cycle */
import type from '@src/redux/types/token';
import { walletSelector } from '@src/redux/selectors/wallet';
import {
  accountSelector,
  selectedPrivacySelector,
  tokenSelector,
} from '@src/redux/selectors';
import { getTokenList, getTokensInfo } from '@src/services/api/token';
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
import { ConfirmedTx } from '@src/services/wallet/WalletService';
import { CONSTANT_COMMONS } from '@src/constants';
import { uniqBy } from 'lodash';
import { receiveHistorySelector } from '@src/redux/selectors/token';
import { MAX_LIMIT_RECEIVE_HISTORY_ITEM } from '@src/redux/reducers/token';
import { PRV_ID } from '@screens/DexV2/constants';
import { Validator, PrivacyVersion ,ACCOUNT_CONSTANT} from 'incognito-chain-web-js/build/wallet';
import { EXPIRED_TIME } from '@services/cache';
import Util from '@utils/Util';
import BigNumber from 'bignumber.js';
import { actionToggleModal } from '@src/components/Modal';
import {
  FollowAction,
  FollowSelector,
} from '@screens/Wallet/features/FollowList';
import { batch } from 'react-redux';
import orderBy from 'lodash/orderBy';
import uniq from 'lodash/uniq';

export const addPToken = (
  pToken = throw new Error('pToken object is required'),
) => ({
  type: type.ADD_PTOKEN,
  data: pToken,
});

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

export const getBalance = (tokenId) => async (dispatch, getState) => {
  new Validator('getTokenBalance-tokenId', tokenId).required().string();
  const state = getState();
  const wallet = walletSelector(state);
  const account = accountSelector.defaultAccountSelector(state);
  let balance = 0;
  try {
    await dispatch(getBalanceStart(tokenId));
    // await dispatch(actionAddFollowToken(tokenId));
    balance = await accountService.getBalance({
      account,
      wallet,
      tokenID: tokenId,
      version: PrivacyVersion.ver2,
    });
    const token = {
      id: tokenId,
      amount: balance,
      loading: false,
    };
    batch(() => {
      dispatch(setToken(token));
      dispatch(
        FollowAction.actionFetchedTokenBalance({
          token,
          OTAKey: account.OTAKey,
        }),
      );
    });
  } catch (e) {
    dispatch(
      setToken({
        id: tokenId,
        amount: 0,
      }),
    );
    throw e;
  } finally {
    dispatch(getBalanceFinish(tokenId));
  }
  return balance ?? 0;
};

let LAST_TIME_GET_TOKEN = null;
let IS_LOADING_PTOKEN = false;
const TIME_EXPIRED_LOAD_PTOKEN = 60 * 10000;

export const getPTokenList =
  ({ expiredTime = TIME_EXPIRED_LOAD_PTOKEN } = {}) =>
  async (dispatch, getState) => {
    const now = new Date().getTime();
    const inValidTime =
      LAST_TIME_GET_TOKEN !== null &&
      now - LAST_TIME_GET_TOKEN <= TIME_EXPIRED_LOAD_PTOKEN;
    if (inValidTime || IS_LOADING_PTOKEN) {
      return;
    }
    try {
      IS_LOADING_PTOKEN = true;
      LAST_TIME_GET_TOKEN = now;
      const state = getState();
      const accountWallet = accountSelector.defaultAccountWalletSelector(state);
      const keyInfo =
        (await accountWallet.getKeyInfo({ version: PrivacyVersion.ver2 })) ||
        {};
      const coinsIndex = Object.keys(keyInfo.coinindex || {}) || [];
      const followTokens = await accountWallet.getListFollowingTokens();
      const advanceTokens = uniq([...coinsIndex, ...followTokens]);
      const [tokensAdvance, pTokens] = await Promise.all([
        await getTokensInfo(advanceTokens),
        await getTokenList({ expiredTime }),
      ]);

      const tokens = orderBy(
        uniqBy([...(tokensAdvance || []), ...pTokens], 'tokenId') || [],
        ['isPUnifiedToken', 'verified'],
        ['desc', 'desc'],
      );
      IS_LOADING_PTOKEN = false;
      await dispatch(setListPToken(tokens));
      return tokens;
    } catch (e) {
      LAST_TIME_GET_TOKEN = null;
      IS_LOADING_PTOKEN = false;
      throw e;
    }
  };

export const getPTokenListNoCache =
  ({ expiredTime = TIME_EXPIRED_LOAD_PTOKEN } = {}) =>
  async (dispatch, getState) => {
    const now = new Date().getTime();
    try {
      IS_LOADING_PTOKEN = true;
      LAST_TIME_GET_TOKEN = now;
      const state = getState();
      const accountWallet = accountSelector.defaultAccountWalletSelector(state);
      const keyInfo =
        (await accountWallet.getKeyInfo({ version: PrivacyVersion.ver2 })) ||
        {};
      const coinsIndex = Object.keys(keyInfo.coinindex || {}) || [];
      const followTokens = await accountWallet.getListFollowingTokens();
      const advanceTokens = uniq([...coinsIndex, ...followTokens]);
      const [tokensAdvance, pTokens] = await Promise.all([
        await getTokensInfo(advanceTokens),
        await getTokenList({ expiredTime }),
      ]);

      const tokens = orderBy(
        uniqBy([...(tokensAdvance || []), ...pTokens], 'tokenId') || [],
        ['isPUnifiedToken', 'verified'],
        ['desc', 'desc'],
      );
      IS_LOADING_PTOKEN = false;
      await dispatch(setListPToken(tokens));
      return tokens;
    } catch (e) {
      LAST_TIME_GET_TOKEN = null;
      IS_LOADING_PTOKEN = false;
      throw e;
    }
  };

export const getInternalTokenList =
  ({ expiredTime = EXPIRED_TIME } = {}) =>
  async (dispatch) => {
    try {
      const tokens =
        (await tokenService.getPrivacyTokens({ expiredTime })) || [];
      await dispatch(setListInternalToken(tokens));
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

export const actionAddFollowToken = (tokenID) => async (dispatch, getState) => {
  try {
    const state = getState();
    const followTokens = FollowSelector.followTokensWalletSelector(state) || [];

    // Check if token already exists in the list followed
    const tokenFollowed = followTokens.some((token) => token.id === tokenID);
    if (tokenFollowed) {
      return;
    }

    const newFollowTokens = followTokens.concat([
      {
        id: tokenID,
        amount: 0,
        loading: false,
      },
    ]);
    const account = accountSelector.defaultAccountSelector(state);
    const wallet = walletSelector(state);
    setTimeout(() => {
      const OTAKey = account.OTAKey;
      dispatch(
        FollowAction.actionUpdateTokenList({
          newTokens: newFollowTokens,
          OTAKey,
        }),
      );
    }, 200);
    accountService.addFollowingTokens([{ tokenID }], account, wallet);
    // dispatch(setWallet(wallet));
  } catch (error) {
    dispatch(actionAddFollowTokenFail(tokenID));
    throw error;
  }
};

export const actionAddFollowTokenAfterMint =
  (tokenId) =>
  async (
    dispatch,
    // getState,
  ) => {
    try {
      // const state = getState();
      // let wallet = state.wallet;
      if (!tokenId || tokenId === PRV_ID) {
        return;
      }
      await Util.sleep();
      dispatch(actionAddFollowToken(tokenId));
      // const tasks = [
      //   await dispatch(getPTokenList({ expiredTime: 0 })),
      //   // await dispatch(getInternalTokenList({ expiredTime: 0 })),
      // ];
      // const account = accountSelector.defaultAccount(state);
      // const [pTokens, internalTokens] = await Promise.all(tasks);
      // const foundPToken = pTokens?.find((pToken) => pToken.tokenId === tokenId);
      // const foundInternalToken =
      //   !foundPToken && internalTokens?.find((token) => token.id === tokenId);
      // const token =
      //   (foundInternalToken && internalTokenModel.toJson(foundInternalToken)) ||
      //   foundPToken?.convertToToken();
      // if (token) {
      // }
    } catch (error) {
      throw error;
    }
  };

export const actionRemoveFollowToken =
  (tokenId) => async (dispatch, getState) => {
    const state = getState();
    if (!tokenId) {
      return;
    }
    try {
      const account = accountSelector.defaultAccountSelector(state);
      const OTAKey = account.OTAKey;
      const wallet = walletSelector(state);

      setTimeout(() => {
        const followTokens =
          FollowSelector.followTokensWalletSelector(state) || [];
        const newFollowTokens = followTokens.filter(({ id }) => id !== tokenId);
        dispatch(
          FollowAction.actionUpdateTokenList({
            newTokens: newFollowTokens,
            OTAKey,
          }),
        );
      }, 200);

      accountService.removeFollowingToken(tokenId, account, wallet);
      // dispatch(setWallet(wallet));
    } catch (error) {
      dispatch(actionAddFollowTokenFail(tokenId));
      throw error;
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

export const actionFetchHistoryToken =
  (refreshing = false) =>
  async (dispatch, getState) => {
    try {
      const state = getState();
      const selectedPrivacy = selectedPrivacySelector.selectedPrivacy(state);
      const token =
        selectedPrivacySelector.selectedPrivacyByFollowedSelector(state);
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
        const [historiesToken, historiesTokenFromApi, receiveHistory] =
          await Promise.all(task);
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

export const actionFetchHistoryMainCrypto =
  (refreshing = false) =>
  async (dispatch, getState) => {
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

export const actionFetchReceiveHistory =
  (refreshing = false) =>
  async (dispatch, getState) => {
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

export const actionCheckNeedFaucetPRV =
  (data, prvBalance = 0) =>
  async (dispatch) => {
    let needFaucet = false;
    try {
      if (!prvBalance || new BigNumber(prvBalance).isLessThan(100)) {
        needFaucet = true;
        await dispatch(
          actionToggleModal({
            shouldCloseModalWhenTapOverlay: true,
            visible: true,
            data,
          }),
        );
      }
    } catch (error) {
      throw error;
    }
    return needFaucet;
  };

export const actionFaucetPRV = (data) =>
  async (dispatch) => {
    try {
        await dispatch(
          actionToggleModal({
            shouldCloseModalWhenTapOverlay: true,
            visible: true,
            data,
          }),
        );
    } catch (error) {
      throw error;
    }
};
