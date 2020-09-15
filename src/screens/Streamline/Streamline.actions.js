import { MAX_FEE_PER_TX } from '@src/components/EstimateFee/EstimateFee.utils';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { walletSelector } from '@src/redux/selectors/wallet';
import accountServices from '@src/services/wallet/accountService';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
} from './Streamline.constant';
import { streamlineStorageSelector } from './Streamline.selector';

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

export const actionFetch = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const wallet = walletSelector(state);
    const account = defaultAccountSelector(state);
    const { isFetching } = streamlineStorageSelector(state);
    if (isFetching) {
      return;
    }
    await dispatch(actionFetching());
    const result = await accountServices.defragmentNativeCoin(
      MAX_FEE_PER_TX,
      true,
      account,
      wallet,
    );
    const payload = {
      address: account?.paymentAddress,
      utxos: result.map((item) => item?.txId),
    };
    if (result) {
      await dispatch(actionFetched(payload));
    }
  } catch (error) {
    await dispatch(actionFetchFail());
    throw error;
  }
};
