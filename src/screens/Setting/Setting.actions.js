import LocalDatabase from '@utils/LocalDatabase';
import Device from '@models/device';
import serverService from '@src/services/wallet/Server';
import {
  ACTION_FETCHED_DEVICES,
  ACTION_FETCHED_SERVER,
  ACTION_TOGGLE_BACKUP_ALL_KEYS,
  ACTION_TOGGLE_CURRENCY,
  ACTION_TOGGLE_DECIMAL_DIGITS,
  ACTION_UPDATE_SHOW_WALLET_BALANCE,
  ACTION_TOGGLE_USE_PRV_TO_PAY_FEE,
} from './Setting.constant';

const actionFetchedDevices = (payload) => ({
  type: ACTION_FETCHED_DEVICES,
  payload,
});

const actionFetchedServer = (payload) => ({
  type: ACTION_FETCHED_SERVER,
  payload,
});

export const actionToggleDecimalDigits = () => ({
  type: ACTION_TOGGLE_DECIMAL_DIGITS,
});

export const actionToggleUsePRVToPayFee = () => ({
  type: ACTION_TOGGLE_USE_PRV_TO_PAY_FEE,
});

export const actionFetchDevices = () => async (dispatch) => {
  let devices = [];
  try {
    devices = (await LocalDatabase.getListDevices()).map((device) =>
      Device.getInstance(device),
    );
  } catch (error) {
    console.log('error', error);
  } finally {
    dispatch(actionFetchedDevices(devices));
  }
};

export const actionFetchServers = () => async (dispatch) => {
  let server = null;
  try {
    server = await serverService.getDefault();
  } catch (error) {
    console.log(error);
  } finally {
    dispatch(actionFetchedServer(server));
  }
};

export const actionToggleCurrency = () => ({
  type: ACTION_TOGGLE_CURRENCY,
});

export const actionUpdateShowWalletBalance = () => ({
  type: ACTION_UPDATE_SHOW_WALLET_BALANCE,
});

export const actionToggleBackupAllKeys = (payload = false) => ({
  type: ACTION_TOGGLE_BACKUP_ALL_KEYS,
  payload,
});
