import {
  ACTION_CLEAR_HISTORY_DETAIL,
  ACTION_REFRESH_FAIL,
  ACTION_REFRESHED,
  ACTION_REFRESHING,
  ACTION_UPDATE_HISTORY_DETAIL
} from '@screens/Wallet/features/TxHistoryDetail/TxHistoryDetail.constant';
import { apiRefreshHistory } from '@screens/Wallet/features/TxHistoryDetail/TxHistoryDetail.services';
import {
  combineHistoryApi,
  combineHistoryDetail
} from '@screens/Wallet/features/TxHistoryDetail/TxHistoruDetail.builder';
import Toast from '@components/core/Toast';
import { ExHandler } from '@services/exception';
import { accountSelector } from '@src/redux/selectors';

export const actionRefreshing = () => ({
  type: ACTION_REFRESHING,
});

export const actionRefreshed = payload => ({
  type: ACTION_REFRESHED,
  payload,
});

export const actionRefreshFail = () => ({
  type: ACTION_REFRESH_FAIL,
});

export const actionRefreshHistoryDetail = ({ txID, currencyType, decentralized, isShieldAddressDecentralized }) => async (dispatch, getState) => {
  let data = null;
  const state = getState();
  const { isRefreshing } = state.txHistoryDetail;
  if (isRefreshing) return;
  try {
    const signPublicKeyEncode = accountSelector.signPublicKeyEncodeSelector(state);
    await dispatch(actionRefreshing());
    data = await apiRefreshHistory({ txID, currencyType, signPublicKeyEncode, decentralized, isShieldAddressDecentralized });
  } catch (error) {
    await dispatch(actionRefreshFail());
    Toast.showError(new ExHandler(error).getMessage());
  } finally {
    if (data) {
      const historyDetail = combineHistoryApi(state, data);
      await dispatch(actionRefreshed({ historyDetail }));
    }
  }
};


/*
* GET HISTORY DETAIL WHEN OPEN SCREEN txHistoryDetail
* */
export const actionUpdateHistoryDetail = (payload) => ({
  type: ACTION_UPDATE_HISTORY_DETAIL,
  payload
});

export const actionClearHistoryDetail = () => ({
  type: ACTION_CLEAR_HISTORY_DETAIL,
});

export const updateHistoryDetail = (historyId) => async (dispatch, getState) => {
  let historyDetail = null;
  try {
    const state    = getState();
    historyDetail  = combineHistoryDetail(state, historyId);
  } catch (error) {
    Toast.showError(new ExHandler(error).getMessage());
  } finally {
    dispatch(actionUpdateHistoryDetail({ historyDetail }));
  }
};

export const clearHistoryDetail = () => (dispatch) => {
  try {
    dispatch(actionClearHistoryDetail());
  } catch (error) {
    Toast.showError(new ExHandler(error).getMessage());
  }
};
