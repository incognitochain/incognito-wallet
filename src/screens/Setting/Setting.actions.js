import LocalDatabase from '@utils/LocalDatabase';
import Device from '@models/device';
import serverService from '@src/services/wallet/Server';
import {
  ACTION_FETCHED_DEVICES,
  ACTION_FETCHED_SERVER,
  ACTION_TOGGLE_CURRENCY,
  ACTION_TOGGLE_DECIMAL_DIGITS,
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

export const actionFetchDevices = () => async (dispatch, getState) => {
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

export const actionFetchServers = () => async (dispatch, getState) => {
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