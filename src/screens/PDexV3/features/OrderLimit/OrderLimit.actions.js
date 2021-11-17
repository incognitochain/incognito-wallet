/* eslint-disable import/no-cycle */
import { PrivacyVersion } from 'incognito-chain-web-js/build/wallet';
import { activedTabSelector } from '@src/components/core/Tabs/Tabs.selector';
import { PRV } from '@src/constants/common';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { getBalance } from '@src/redux/actions/token';
import { ExHandler } from '@src/services/exception';
import {
  actionFetchPools,
  defaultPoolSelector,
  listPoolsIDsSelector,
} from '@screens/PDexV3/features/Pools';
import { actionSetNFTTokenData } from '@src/redux/actions/account';
import isEmpty from 'lodash/isEmpty';
import { change, focus } from 'redux-form';
import { actionGetPDexV3Inst } from '@screens/PDexV3';
import { batch } from 'react-redux';
import { actionSetDefaultPair } from '@screens/PDexV3/features/Swap';
import {
  ROOT_TAB_TRADE,
  TAB_BUY_LIMIT_ID,
  TAB_SELL_LIMIT_ID,
} from '@screens/PDexV3/features/Trade/Trade.constant';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_SET_POOL_ID,
  ACTION_SET_INITIING,
  ACTION_SET_FEE_TOKEN,
  ACTION_SET_SELL_TOKEN,
  ACTION_SET_BUY_TOKEN,
  ACTION_RESET,
  formConfigs,
  ACTION_SET_PERCENT,
  ACTION_FETCHED_OPEN_ORDERS,
  ACTION_WITHDRAWING_ORDER,
  ACTION_FETCHED_WITHDRAWING_ORDER_TXS,
  ACTION_FETCHING_ORDERS_HISTORY,
  ACTION_FETCH_ORDERING,
  ACTION_FETCHED_ORDERS_HISTORY,
  ACTION_FETCH_FAIL_ORDERS_HISTORY,
  ACTION_FETCHING_ORDER_DETAIL,
  ACTION_FETCHED_ORDER_DETAIL,
  ACTION_RESET_ORDERS_HISTORY,
} from './OrderLimit.constant';
import {
  poolSelectedDataSelector,
  orderLimitDataSelector,
  orderDetailSelector,
  rateDataSelector,
  sellInputAmountSelector,
  buyInputAmountSelector,
} from './OrderLimit.selector';

export const actionResetOrdersHistory = () => ({
  type: ACTION_RESET_ORDERS_HISTORY,
});

export const actionSetPercent = (payload) => ({
  type: ACTION_SET_PERCENT,
  payload,
});

export const actionFetching = () => ({
  type: ACTION_FETCHING,
});

export const actionFetched = () => ({
  type: ACTION_FETCHED,
});

export const actionFetchFail = () => ({
  type: ACTION_FETCH_FAIL,
});

export const actionReset = (payload) => ({
  type: ACTION_RESET,
  payload,
});

export const actionSetFeeToken = (payload) => ({
  type: ACTION_SET_FEE_TOKEN,
  payload,
});

export const actionIniting = (payload) => ({
  type: ACTION_SET_INITIING,
  payload,
});

export const actionSetSellTokenFetched = (payload) => ({
  type: ACTION_SET_SELL_TOKEN,
  payload,
});

export const actionSetBuyTokenFetched = (payload) => ({
  type: ACTION_SET_BUY_TOKEN,
  payload,
});

export const actionSetPoolSelected = (payload) => async (
  dispatch,
  getState,
) => {
  batch(async () => {
    await dispatch({
      type: ACTION_SET_POOL_ID,
      payload,
    });
    dispatch(actionSetDefaultPool());
  });
};

export const actionSetSellToken = (selltokenId, refresh) => async (
  dispatch,
) => {
  try {
    if (!selltokenId) {
      return;
    }
    batch(() => {
      dispatch(actionSetSellTokenFetched(selltokenId));
      if (refresh) {
        dispatch(getBalance(selltokenId));
      }
    });
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

export const actionSetBuyToken = (buytokenId, refresh) => async (dispatch) => {
  try {
    if (!buytokenId) {
      return;
    }
    batch(() => {
      dispatch(actionSetBuyTokenFetched(buytokenId));
      if (refresh) {
        dispatch(getBalance(buytokenId));
      }
    });
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

export const actionSetInputToken = ({ selltoken, buytoken, refresh }) => async (
  dispatch,
  getState,
) => {
  if (!selltoken || !buytoken) {
    return;
  }
  try {
    batch(() => {
      dispatch(actionSetSellToken(selltoken, refresh));
      dispatch(actionSetBuyToken(buytoken, refresh));
      if (selltoken !== PRV.id && buytoken !== PRV.id && refresh) {
        dispatch(getBalance(PRV.id));
      }
    });
  } catch (error) {
    throw error;
  }
};
export const actionSetDefaultPool = () => async (dispatch, getState) => {
  try {
    const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
    const state = getState();
    const pool = poolSelectedDataSelector(state);
    if (!pool) {
      return;
    }
    const { token1, token2 } = pool;
    pDexV3Inst.setDefaultPool(pool?.poolId);
    const defaultPair = {
      selltoken: token1?.tokenId,
      buytoken: token2?.tokenId,
    };
    dispatch(actionSetDefaultPair(defaultPair));
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

export const actionInit = (refresh = true) => async (dispatch, getState) => {
  try {
    batch(() => {
      dispatch(actionFetching());
      dispatch(actionSetPercent(0));
    });
    let state = getState();
    const pools = listPoolsIDsSelector(state);
    const poolSelected = poolSelectedDataSelector(state);
    if (!poolSelected?.poolId) {
      const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
      let defaultPoolId;
      try {
        defaultPoolId = await pDexV3Inst.getDefaultPool();
      } catch {
        //
      }
      const isValidPool =
        pools?.findIndex((poolId) => poolId === defaultPoolId) > -1;
      if (!defaultPoolId || !isValidPool) {
        defaultPoolId = defaultPoolSelector(state);
        await dispatch(actionSetDefaultPool());
      }
      await dispatch(actionSetPoolSelected(defaultPoolId));
    }
    state = getState();
    const pool = poolSelectedDataSelector(state);
    if (isEmpty(pool)) {
      return;
    }
    batch(() => {
      if (refresh) {
        dispatch(actionFetchPools());
        dispatch(actionSetNFTTokenData());
        dispatch(actionFetchOrdersHistory());
      }
    });
    const activedTab = activedTabSelector(state)(ROOT_TAB_TRADE);
    const token1: SelectedPrivacy = pool?.token1;
    const token2: SelectedPrivacy = pool?.token2;
    let selltokenId, buytokenId;
    switch (activedTab) {
    case TAB_BUY_LIMIT_ID: {
      buytokenId = token1.tokenId;
      selltokenId = token2.tokenId;
      break;
    }
    case TAB_SELL_LIMIT_ID: {
      selltokenId = token1.tokenId;
      buytokenId = token2.tokenId;
      break;
    }
    default:
      break;
    }
    batch(() => {
      dispatch(
        actionSetInputToken({
          selltoken: selltokenId,
          buytoken: buytokenId,
          refresh,
        }),
      );
      state = getState();
      const { rate } = rateDataSelector(state);
      dispatch(change(formConfigs.formName, formConfigs.rate, rate));
      dispatch(focus(formConfigs.formName, formConfigs.rate));
    });
  } catch (error) {
    new ExHandler(error).showErrorToast;
  } finally {
    dispatch(actionFetched());
  }
};

export const actionFetchedOpenOrders = (payload) => ({
  type: ACTION_FETCHED_OPEN_ORDERS,
  payload,
});

export const actionFetchedWithdrawingOrderTxs = (payload) => ({
  type: ACTION_FETCHED_WITHDRAWING_ORDER_TXS,
  payload,
});

export const actionFetchWithdrawOrderTxs = () => async (dispatch, getState) => {
  let withdrawTxs = [];
  try {
    const state = getState();
    const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
    const pool = poolSelectedDataSelector(state);
    if (!pool?.poolId) {
      return [];
    }
    const poolid = pool?.poolId;
    withdrawTxs = await pDexV3Inst.getWithdrawOrderTxs({
      poolid,
    });
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    await dispatch(actionFetchedWithdrawingOrderTxs(withdrawTxs));
  }
};

export const actionFetchingOrdersHistory = () => ({
  type: ACTION_FETCHING_ORDERS_HISTORY,
});

export const actionFetchedOrdersHistory = (payload) => ({
  type: ACTION_FETCHED_ORDERS_HISTORY,
  payload,
});

export const actionFetchFailOrderHistory = () => ({
  type: ACTION_FETCH_FAIL_ORDERS_HISTORY,
});

export const actionFetchOrdersHistory = () => async (dispatch, getState) => {
  try {
    await dispatch(actionFetchingOrdersHistory());
    const state = getState();
    const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
    const pool = poolSelectedDataSelector(state);
    if (!pool) {
      return;
    }
    dispatch(actionFetchWithdrawOrderTxs());
    const orders =
      (await pDexV3Inst.getOrderLimitHistory({
        poolid: pool?.poolId,
        version: PrivacyVersion.ver2,
        token1ID: pool?.token1Id,
        token2ID: pool?.token2Id,
      })) || [];
    await dispatch(actionFetchedOrdersHistory(orders));
  } catch (error) {
    await dispatch(actionFetchFailOrderHistory());
    new ExHandler(error).showErrorToast();
  }
};

export const actionWithdrawingOrder = (payload) => ({
  type: ACTION_WITHDRAWING_ORDER,
  payload,
});

export const actionWithdrawOrder = ({ requestTx, txType, nftid }) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
    const pool = poolSelectedDataSelector(state);
    const { sellTokenId, buyTokenId } = orderLimitDataSelector(state);
    if (!requestTx || !pool?.poolId) {
      return;
    }
    await dispatch(actionWithdrawingOrder(requestTx));
    const poolid = pool?.poolId;
    const data = {
      withdrawTokenIDs: [sellTokenId, buyTokenId],
      poolPairID: poolid,
      orderID: requestTx,
      amount: '0',
      version: PrivacyVersion.ver2,
      txType,
      nftID: nftid,
    };
    await pDexV3Inst.createAndSendWithdrawOrderRequestTx({ extra: data });
    await dispatch(actionFetchWithdrawOrderTxs());
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    await dispatch(actionWithdrawingOrder(requestTx));
  }
};

export const actionFetchingBookOrder = (payload) => ({
  type: ACTION_FETCH_ORDERING,
  payload,
});

export const actionBookOrder = () => async (dispatch, getState) => {
  await dispatch(actionFetchingBookOrder(true));
  try {
    const state = getState();
    const { disabledBtn, activedTab, totalAmountData } = orderLimitDataSelector(
      state,
    );
    if (disabledBtn) {
      return;
    }
    const { totalAmountToken, totalOriginalAmount } = totalAmountData;
    const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
    const { poolId: poolPairID } = poolSelectedDataSelector(state);
    let extra;
    switch (activedTab) {
    case TAB_BUY_LIMIT_ID: {
      const {
        originalAmount: minAcceptableAmount,
        tokenData,
      } = buyInputAmountSelector(state);
      const sellToken: SelectedPrivacy = totalAmountToken;
      const buyToken: SelectedPrivacy = tokenData;
      const tokenIDToSell = sellToken?.tokenId;
      const sellAmount = totalOriginalAmount;
      const tokenIDToBuy = buyToken?.tokenId;
      extra = {
        tokenIDToSell,
        poolPairID,
        sellAmount: String(sellAmount),
        version: PrivacyVersion.ver2,
        minAcceptableAmount: String(minAcceptableAmount),
        tokenIDToBuy,
      };
      break;
    }
    case TAB_SELL_LIMIT_ID: {
      const {
        originalAmount: sellAmount,
        tokenData,
      } = sellInputAmountSelector(state);
      const sellToken: SelectedPrivacy = tokenData;
      const buyToken: SelectedPrivacy = totalAmountToken;
      const tokenIDToSell = sellToken?.tokenId;
      const minAcceptableAmount = totalOriginalAmount;
      const tokenIDToBuy = buyToken?.tokenId;
      extra = {
        tokenIDToSell,
        poolPairID,
        sellAmount: String(sellAmount),
        version: PrivacyVersion.ver2,
        minAcceptableAmount: String(minAcceptableAmount),
        tokenIDToBuy,
      };
      break;
    }
    default:
      break;
    }
    const tx = await pDexV3Inst.createAndSendOrderRequestTx({ extra });
    return tx;
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    await dispatch(actionFetchingBookOrder(false));
  }
};

export const actionFetchingOrderDetail = () => ({
  type: ACTION_FETCHING_ORDER_DETAIL,
});

export const actionFetchedOrderDetail = (payload) => ({
  type: ACTION_FETCHED_ORDER_DETAIL,
  payload,
});

export const actionFetchDataOrderDetail = () => async (dispatch, getState) => {
  let _order = {};
  const state = getState();
  const { order } = orderDetailSelector(state);
  const pool = poolSelectedDataSelector(state);
  if (!order?.requestTx || !pool) {
    return;
  }
  try {
    const { requestTx, fromStorage } = order;
    const { poolId, token1Id, token2Id } = pool;
    await dispatch(actionFetchingOrderDetail());
    const pDexV3 = await dispatch(actionGetPDexV3Inst());
    const params = {
      requestTx,
      poolid: poolId,
      token1ID: token1Id,
      token2ID: token2Id,
      fromStorage: !!fromStorage,
      version: PrivacyVersion.ver2,
    };
    _order = await pDexV3.getOrderLimitDetail(params);
  } catch (error) {
    _order = { ...order };
    new ExHandler(error).showErrorToast();
  } finally {
    _order = _order || order;
    dispatch(actionFetchWithdrawOrderTxs());
    dispatch(actionSetNFTTokenData());
    await dispatch(actionFetchedOrderDetail(_order));
  }
};
