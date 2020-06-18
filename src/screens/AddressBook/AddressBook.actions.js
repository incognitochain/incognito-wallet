import { accountSeleclor } from '@src/redux/selectors';
import { v4 } from 'uuid';
import {
  ACTION_CREATE,
  ACTION_SYNC_SUCCESS,
  ACTION_UPDATE,
  ACTION_RESEARCH,
  ACTION_DELETE,
} from './AddressBook.constant';

export const actionCreate = (payload) => ({
  type: ACTION_CREATE,
  payload,
});

export const actionSyncSuccess = () => ({
  type: ACTION_SYNC_SUCCESS,
});

export const actionUpdate = (payload) => ({
  type: ACTION_UPDATE,
  payload,
});

export const actionResearch = (payload) => ({
  type: ACTION_RESEARCH,
  payload,
});

export const actionDelete = (payload) => ({
  type: ACTION_DELETE,
  payload,
});

export const actionSyncAddressBook = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const accounts = accountSeleclor.listAccountSelector(state);
    const isAccListEmpty = accounts.length === 0;
    if (!isAccListEmpty) {
      await Promise.all(
        accounts.map(async (account) => {
          const payload = {
            name: account?.name,
            address: account?.PaymentAddress,
          };
          await dispatch(actionCreate(payload));
        }),
      );
      await dispatch(actionSyncSuccess());
    }
  } catch (error) {
    throw error;
  }
};
