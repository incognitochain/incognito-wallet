import LocalDatabase from '@utils/LocalDatabase';
import types from '@src/redux/types/dex';
import {
  getPDEContributionStatus,
  getPDETradeStatus,
  getPDEWithdrawalStatus,
  getTransactionByHash
} from '@services/wallet/RpcClientService';
import { MESSAGES } from '@screens/Dex/constants';
import {
  DepositHistory,
  TradeHistory,
  WithdrawHistory,
  AddLiquidityHistory,
  RemoveLiquidityHistory
} from '@models/dexHistory';
import { currentMasterKeySelector } from '@src/redux/selectors/masterKey';

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

export const TRADE_STATUS = [
  TRANSFER_STATUS.PENDING,
  TRANSFER_STATUS.SUCCESSFUL,
  TRANSFER_STATUS.REFUNDED,
];

export const ADD_LIQUIDITY_STATUS = [
  TRANSFER_STATUS.PENDING,
  TRANSFER_STATUS.PENDING,
  TRANSFER_STATUS.SUCCESSFUL,
  TRANSFER_STATUS.REFUNDED,
  TRANSFER_STATUS.PART_REFUNFED,
];

export const REMOVE_LIQUIDITY_STATUS = [
  TRANSFER_STATUS.PENDING,
  TRANSFER_STATUS.SUCCESSFUL,
  TRANSFER_STATUS.REJECTED,
];

export const NOT_CHANGE_STATUS = [
  TRANSFER_STATUS.SUCCESSFUL,
  TRANSFER_STATUS.REFUNDED,
  TRANSFER_STATUS.UNSUCCESSFUL,
  TRANSFER_STATUS.INTERRUPTED,
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
  [MESSAGES.ADD_LIQUIDITY]: AddLiquidityHistory,
  [MESSAGES.REMOVE_LIQUIDITY]: RemoveLiquidityHistory,
};

function getDepositStatus(history) {
  return getTransactionByHash(history.txId)
    .then(result => {
      if (result.isInBlock) {
        return TRANSFER_STATUS.SUCCESSFUL;
      } else if (result.isInMempool) {
        return TRANSFER_STATUS.PENDING;
      } else if (result.err) {
        return TRANSFER_STATUS.UNSUCCESSFUL;
      }
    })
    .catch((error) => error.message);
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

function getTradeStatus(history) {
  return getTransactionByHash(history.txId)
    .then(result => {
      if (result.isInMempool) {
        return TRANSFER_STATUS.PENDING;
      } else if (result.err) {
        return TRANSFER_STATUS.UNSUCCESSFUL;
      }

      return getPDETradeStatus(history.txId)
        .then(result => TRADE_STATUS[result.state]);
    })
    .catch((error) => error.message);
}

function getAddLiquidityStatus(history) {
  return getTransactionByHash(history.txId)
    .then(async result => {
      if (history.cancelTx) {
        result = await getTransactionByHash(history.cancelTx);

        if (result.isInMempool) {
          throw new Error(TRANSFER_STATUS.PENDING);
        } else if (result.err) {
          throw new Error(TRANSFER_STATUS.INTERRUPTED);
        } else if (result.isInBlock) {
          throw new Error(TRANSFER_STATUS.CANCELED);
        }
      }

      if (result.isInMempool) {
        return TRANSFER_STATUS.PENDING;
      }

      if (!history.txId2 && result.isInBlock) {
        return TRANSFER_STATUS.INTERRUPTED;
      }

      if (history.txId2) {
        result = await getTransactionByHash(history.txId2);
      }

      if (result.isInBlock) {
        const res = await getPDEContributionStatus(history.pairId);
        const status = ADD_LIQUIDITY_STATUS[res.Status];
        if (status === TRANSFER_STATUS.PART_REFUNFED) {
          return res;
        }

        return status;
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

function getRemoveLiquidityStatus(history) {
  return getTransactionByHash(history.txId)
    .then(async result => {
      if (result.isInMempool) {
        return TRANSFER_STATUS.PENDING;
      } else if (result.err) {
        return TRANSFER_STATUS.UNSUCCESSFUL;
      }

      const pdeStatus = await getPDEWithdrawalStatus(history.txId);
      return REMOVE_LIQUIDITY_STATUS[pdeStatus.state];
    })
    .catch((error) => error.message);
}

const getStatusByType = {
  [MESSAGES.TRADE]: getTradeStatus,
  [MESSAGES.DEPOSIT]: getDepositStatus,
  [MESSAGES.WITHDRAW]: getWithdrawStatus,
  [MESSAGES.ADD_LIQUIDITY]: getAddLiquidityStatus,
  [MESSAGES.REMOVE_LIQUIDITY]: getRemoveLiquidityStatus,
};

async function getStatus(history) {
  return getStatusByType[history.type](history);
}

export const getHistoriesSuccess = (histories, walletName) => ({
  type: types.GET_HISTORIES,
  payload: histories,
  extra: walletName,
});

export const getHistories = () => async (dispatch, getState) => {
  const state = getState();
  const masterKey = currentMasterKeySelector(state);
  const histories = await LocalDatabase.getDexHistory(masterKey.getStorageName());
  const formattedHistories = histories.map(item => {
    const history = HISTORY_TYPES[item.type].load(item);

    if (RETRY_STATUS.includes(history.status) && history.errorTried < MAX_ERROR_TRIED) {
      history.status = undefined;
    } else {
      history.status = NOT_CHANGE_STATUS.includes(item.status) ? item.status : undefined;
    }

    history.errorTried = history.errorTried || 0;

    return history;
  });

  dispatch(getHistoriesSuccess(formattedHistories, masterKey.getStorageName()));

  return formattedHistories;
};

export const getHistoryStatusSuccess = (history) => ({
  type: types.GET_HISTORY_STATUS,
  payload: history,
});

export const getHistoryStatus = (history) => async (dispatch) => {
  const res = await getStatus(history);

  if (typeof res === 'string') {
    const status = res;
    if (status === TRANSFER_STATUS.UNSUCCESSFUL) {
      history.errorTried = history.errorTried > 0 ? ++history.errorTried : 1;
    }

    history.updatedAt = Math.floor(new Date().getTime() / 1000);
    history.status = status;
  } else if (typeof res === 'object') {
    history.token1.ReturnedAmount = res.TokenID1Str === history.token1.TokenID ? res.Returned1Amount : res.Returned2Amount;
    history.token2.ReturnedAmount = res.TokenID2Str === history.token1.TokenID ? res.Returned1Amount : res.Returned2Amount;
    history.status = TRANSFER_STATUS.SUCCESSFUL;
  }

  dispatch(getHistoryStatusSuccess(history));
  return history;
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
