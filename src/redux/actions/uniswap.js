import LocalDatabase from '@utils/LocalDatabase';
import types from '@src/redux/types/uniswap';
import {MESSAGES} from '@screens/Uniswap/constants';
import {DepositHistory, TradeHistory, WithdrawHistory, WithdrawSCHistory} from '@models/uniswapHistory';
import {getRequest} from '@services/trading';
import {getTransactionByHash} from '@services/wallet/RpcClientService';

export const TRANSFER_STATUS = {
  PROCESSING: 'processing',
  PENDING: 'pending',
  SUCCESSFUL: 'successful',
  UNSUCCESSFUL: 'unsuccessful',
  INTERRUPTED: 'tap to try again',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PART_REFUNFED: 'part-refunded',
  REJECTED: 'unsuccessful',
  CANCELED: 'canceled',
};

export const DEPOSIT_STATUS = {
  1: TRANSFER_STATUS.PENDING,
  2: TRANSFER_STATUS.PENDING,
  3: TRANSFER_STATUS.FAILED,
  4: TRANSFER_STATUS.SUCCESSFUL,
  5: TRANSFER_STATUS.FAILED,
  6: TRANSFER_STATUS.FAILED,
};

export const TRADE_STATUS = {
  7: TRANSFER_STATUS.PENDING,
  8: TRANSFER_STATUS.PENDING,
  9: TRANSFER_STATUS.SUCCESSFUL,
  10: TRANSFER_STATUS.FAILED
};

export const WITHDRAW_STATUS = {
  12: TRANSFER_STATUS.PENDING,
  13: TRANSFER_STATUS.PENDING,
  14: TRANSFER_STATUS.FAILED,
  15: TRANSFER_STATUS.FAILED,
  16: TRANSFER_STATUS.SUCCESSFUL,
};

export const NOT_CHANGE_STATUS = [
  TRANSFER_STATUS.SUCCESSFUL,
  TRANSFER_STATUS.REFUNDED,
  TRANSFER_STATUS.REJECTED,
  TRANSFER_STATUS.CANCELED,
];

export const RETRY_STATUS = [
  TRANSFER_STATUS.UNSUCCESSFUL,
  TRANSFER_STATUS.INTERRUPTED
];

export const MAX_ERROR_TRIED = 10;

const HISTORY_TYPES = {
  [MESSAGES.TRADE]: TradeHistory,
  [MESSAGES.DEPOSIT]: DepositHistory,
  [MESSAGES.WITHDRAW]: WithdrawHistory,
  [MESSAGES.WITHDRAW_SC]: WithdrawSCHistory,
};

async function getDepositStatus(history) {
  try {
    if (
      (history.txId && DepositHistory.currentDeposit?.txId === history.txId) ||
      (history.burnTxId && DepositHistory.currentDeposit?.burnTxId === history.burnTxId)
    ) {
      return TRANSFER_STATUS.PENDING;
    }

    if (history.dbId) {
      const {status: statusCode} = await getRequest(history.dbId);
      return DEPOSIT_STATUS[statusCode];
    }

    const result = await getTransactionByHash(history.burnTxId || history.txId);
    let status;

    if (result.isInBlock) {
      status = TRANSFER_STATUS.SUCCESSFUL;
    } else if (result.isInMempool) {
      status = TRANSFER_STATUS.PENDING;
    } else if (result.err) {
      status = TRANSFER_STATUS.UNSUCCESSFUL;
    }

    if (status === TRANSFER_STATUS.SUCCESSFUL && (!history.burnTxId || !history.dbId)) {
      return TRANSFER_STATUS.INTERRUPTED;
    }

    return status;
  } catch (error) {
    return error.message;
  }
}

function getWithdrawStatus(history) {
  return getTransactionByHash(history.txId)
    .then(async result => {
      if (WithdrawHistory.currentWithdraw && history.txId === WithdrawHistory.currentWithdraw.txId) {
        return TRANSFER_STATUS.PROCESSING;
      }

      if (!history.txId2 && (result.isInBlock || result.isInMempool)) {
        return TRANSFER_STATUS.INTERRUPTED;
      }

      if (history.txId2) {
        result = await getTransactionByHash(history.txId2);
      }

      if (result.isInBlock) {
        return TRANSFER_STATUS.SUCCESSFUL;
      } else if (result.isInMempool) {
        return TRANSFER_STATUS.PENDING;
      } else if (result.err) {

        if (history.txId2) {
          return TRANSFER_STATUS.INTERRUPTED;
        }

        return TRANSFER_STATUS.UNSUCCESSFUL;
      }
    })
    .catch((error) => error.message);
}

function getWithdrawSCStatus(history) {
  return getRequest(history.dbId)
    .then(item => WITHDRAW_STATUS[item.status])
    .catch((error) => error.message);
}

function getTradeStatus(history) {
  return getRequest(history.dbId)
    .then(item => TRADE_STATUS[item.status])
    .catch((error) => error.message);
}

const getStatusByType = {
  [MESSAGES.TRADE]: getTradeStatus,
  [MESSAGES.DEPOSIT]: getDepositStatus,
  [MESSAGES.WITHDRAW]: getWithdrawStatus,
  [MESSAGES.WITHDRAW_SC]: getWithdrawSCStatus,
};

async function getStatus(history) {
  return getStatusByType[history.type](history);
}

export const getHistoriesSuccess = (histories) => ({
  type: types.GET_HISTORIES,
  payload: histories,
});

export const getHistories = () => async (dispatch) => {
  const histories = await LocalDatabase.getUniswapHistory();
  const formattedHistories = histories.map(item => HISTORY_TYPES[item.type].load(item));

  (histories || []).forEach(item => {
    if (!item.status || (!NOT_CHANGE_STATUS.includes(item.status)) ||
      (RETRY_STATUS.includes(item.status) && item.errorTried < MAX_ERROR_TRIED)) {
      dispatch(getHistoryStatus(item));
    }
  });

  dispatch(getHistoriesSuccess(formattedHistories));
  return formattedHistories;
};

export const getHistoryStatusSuccess = (history) => ({
  type: types.GET_HISTORY_STATUS,
  payload: history,
});

export const getHistoryStatus = (history) => async (dispatch) => {
  const status = await getStatus(history);

  if (status === TRANSFER_STATUS.UNSUCCESSFUL) {
    history.errorTried = history.errorTried > 0 ? ++history.errorTried : 1;
  }

  history.updatedAt = Math.floor(new Date().getTime() / 1000);
  history.status = status;

  if (history.type === MESSAGES.TRADE || history.type === MESSAGES.WITHDRAW_SC) {
    const request = await getRequest(history.dbId);
    history.txId = request.txId;
  }

  dispatch(getHistoryStatusSuccess(history));
};

export const addHistorySuccess = (history) => ({
  type: types.ADD_HISTORY,
  payload: history,
});

export const addHistory = (history) => async (dispatch) => {
  dispatch(addHistorySuccess(history));
};

export const updateHistorySuccess = (history) => ({
  type: types.UPDATE_HISTORY,
  payload: history,
});

export const updateHistory = (history) => async (dispatch) => {
  dispatch(updateHistorySuccess(history));
};

export const deleteHistorySuccess = (history) => ({
  type: types.DELETE_HISTORY,
  payload: history,
});

export const deleteHistory = (history) => async(dispatch) => {
  dispatch(deleteHistorySuccess(history));
};

export const updatePairs = (pairs) => async(dispatch) => {
  dispatch({
    type: types.UPDATE_PAIRS,
    payload: pairs,
  });
};
