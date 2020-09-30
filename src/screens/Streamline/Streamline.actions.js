import { MAX_FEE_PER_TX } from '@src/components/EstimateFee/EstimateFee.utils';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { walletSelector } from '@src/redux/selectors/wallet';
import { ExHandler } from '@src/services/exception';
import accountServices from '@src/services/wallet/accountService';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_INIT_PROCCESS,
  ACTION_FETCHED_ALL_TXS,
  ACTION_TOGGLE_PENDING,
} from './Streamline.constant';
import {
  streamlineSelector,
} from './Streamline.selector';

export const actionFetching = () => ({
  type: ACTION_FETCHING,
});

export const actionFetched = (payload) => ({
  type: ACTION_FETCHED,
  payload,
});

export const actionFetch = () => async (dispatch, getState) => {
  let error;
  try {
    const state = getState();
    const account = defaultAccountSelector(state);
    const wallet = walletSelector(state);
    const { isFetching } = streamlineSelector(state);

    if (isFetching) {
      return;
    }

    await dispatch(actionFetching());

    const result = await accountServices.defragmentNativeCoin(
      MAX_FEE_PER_TX,
      true,
      account,
      wallet,
      accountServices.MAX_DEFRAGMENT_TXS
    );

    if (result) {
      const payload = {
        address: account?.paymentAddress,
        utxos: result?.map((item) => item?.txId),
      };
      await dispatch(actionFetched(payload));
    }

  } catch (e) {
    error = e;
    if (
      error &&
      error?.code === 'WEB_JS_ERROR(-3002)' &&
      error?.stackTraceCode === ''
    ) {
      error = new Error('Something’s not quite right. Please try again later.');
      return new ExHandler(error).showErrorToast();
    }
    new ExHandler(error).showErrorToast(true);
  } finally {
    dispatch(actionFetchedAllTxs());
  }
};

export const actionInitProccess = (payload) => ({
  type: ACTION_INIT_PROCCESS,
  payload,
});

export const actionFetchedAllTxs = () => ({
  type: ACTION_FETCHED_ALL_TXS,
});

export const actionTogglePending = (payload) => ({
  type: ACTION_TOGGLE_PENDING,
  payload,
});
