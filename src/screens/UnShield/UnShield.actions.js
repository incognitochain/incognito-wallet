import {
  ACTION_ADD_STORAGE_DATA,
  ACTION_REMOVE_STORAGE_DATA,
} from './UnShield.constant';

export const actionAddStorageData = (payload) => ({
  type: ACTION_ADD_STORAGE_DATA,
  payload,
});

export const actionRemoveStorageData = (payload) => ({
  type: ACTION_REMOVE_STORAGE_DATA,
  payload,
});
