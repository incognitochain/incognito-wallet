import {
  ACCOUNT_CONSTANT,
  Validator,
  PrivacyVersion,
} from 'incognito-chain-web-js/build/wallet';
import { selectedPrivacySelector } from '@src/redux/selectors';
import {
  historyDetailSelector,
  historySelector,
  mappingTxPTokenSelector,
  mappingTxReceiverSelector,
  mappingTxTransactorSelector,
  mappingTxPortalSelector,
} from '@src/redux/selectors/history';
import { selectedPrivacy } from '@src/redux/selectors/selectedPrivacy';
import { getDefaultAccountWalletSelector } from '@src/redux/selectors/shared';

export const ACTION_FETCHING = '[history] Fetching data';
export const ACTION_FETCHED = '[history] Fetched data';
export const ACTION_FETCH_FAIL = '[history] Fetch fail data';
export const ACTION_FREE = '[history] Free data';
export const ACTION_SET_SELECTED_TX = '[history] Set selected tx';
export const ACTION_FETCHING_TX = '[history] Fetching tx';
export const ACTION_FETCHED_TX = '[history] Fetched tx';

export const actionSetSelectedTx = (payload) => ({
  type: ACTION_SET_SELECTED_TX,
  payload,
});

export const actionFree = () => ({
  type: ACTION_FREE,
});

export const actionFetching = () => ({
  type: ACTION_FETCHING,
});

export const actionFetched = (payload) => ({
  type: ACTION_FETCHED,
  payload,
});

export const actionFetchFail = () => ({
  type: ACTION_FETCH_FAIL,
});

export const actionFetch = ({
  tokenID,
  version = PrivacyVersion.ver2,
} = {}) => async (dispatch, getState) => {
  try {
    const state = getState();
    const history = historySelector(state);
    const { isFetching } = history;
    if (isFetching) {
      return;
    }
    const selectedPrivacy = selectedPrivacySelector.selectedPrivacy(state);
    const accountWallet = getDefaultAccountWalletSelector(state);
    await dispatch(actionFetching());
    const _tokenID = tokenID || selectedPrivacy.tokenId;
    new Validator('tokenID', _tokenID).required().string();
    const data = await accountWallet.getTxsHistory({
      tokenID: _tokenID,
      isPToken: selectedPrivacy.isPToken,
      version,
    });
    await dispatch(actionFetched(data));
  } catch (error) {
    await dispatch(actionFetchFail());
    throw error;
  }
};

export const actionFetchingTx = () => ({
  type: ACTION_FETCHING_TX,
});

export const actionFetchedTx = (payload) => ({
  type: ACTION_FETCHED_TX,
  payload,
});

export const actionFetchTx = () => async (dispatch, getState) => {
  const state = getState();
  let { tx, fetching } = historyDetailSelector(state);
  if (fetching) {
    return tx;
  }
  try {
    new Validator('tx', tx).required().object();
    await dispatch(actionFetchingTx());
    if (!tx) {
      return;
    }
    const { txType } = tx;
    const { tokenId: tokenID } = selectedPrivacy(state);
    const accountWallet = getDefaultAccountWalletSelector(state);
    new Validator('accountWallet', accountWallet).required().object();
    const version = PrivacyVersion.ver2;
    switch (txType) {
    case ACCOUNT_CONSTANT.TX_TYPE.RECEIVE: {
      tx = mappingTxReceiverSelector(state)(tx);
      break;
    }
    case ACCOUNT_CONSTANT.TX_TYPE.SHIELD:
    case ACCOUNT_CONSTANT.TX_TYPE.UNSHIELD: {
      const txp = await accountWallet.handleGetPTokenHistoryById({
        history: tx,
      });
      if (!txp) {
        return tx;
      }
      tx = mappingTxPTokenSelector(state)(txp);
      break;
    }
    case ACCOUNT_CONSTANT.TX_TYPE.SHIELDPORTAL: {
      const txp = await accountWallet.updateStatusShieldPortalTx(tx, tokenID);
      if (!txp) {
        return tx;
      }
      tx = mappingTxPortalSelector(state)(txp);
      break;
    }
    case ACCOUNT_CONSTANT.TX_TYPE.UNSHIELDPORTAL: {
      const txp = await accountWallet.updateStatusUnShieldPortalTx(tx);
      if (!txp) {
        return tx;
      }
      tx = mappingTxPortalSelector(state)(txp);
      break;
    }
    default: {
      const { txId } = tx;
      const params = {
        txId,
        tokenID,
        version,
      };
      let txt = await accountWallet.getTxHistoryByTxID(params);
      if (!txt) {
        return tx;
      }
      tx = mappingTxTransactorSelector(state)({
        ...tx,
        status: txt?.status || tx?.status,
        statusStr: txt?.statusStr || tx?.statusStr,
      });
      break;
    }
    }
  } catch (error) {
    throw error;
  } finally {
    await dispatch(actionFetchedTx(tx));
  }
  return tx;
};
