import LocalDatabase from '@utils/LocalDatabase';
import Device from '@models/device';
import serverService from '@src/services/wallet/Server';
import {
  ACTION_FETCHED_DEVICES,
  ACTION_FETCHED_SERVER,
} from './Setting.constant';

const actionFetchedDevices = (payload) => ({
  type: ACTION_FETCHED_DEVICES,
  payload,
});

const actionFetchedServer = (payload) => ({
  type: ACTION_FETCHED_SERVER,
  payload,
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
