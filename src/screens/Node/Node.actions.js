import {
  ACTION_FETCHED_NODES_INFO_API,
  ACTION_FETCHING_NODES_INFO_FROM_API,
  ACTION_FETCH_NODES_INFO_FROM_API_FAIL,
  ACTION_UPDATE_FETCHING,
  ACTION_UPDATE_LIST_NODE_DEVICE,
  ACTION_UPDATE_MISSING_SETUP,
  ACTION_SET_TOTAL_VNODE,
  ACTION_UPDATE_NUMBER_LOADED_VNODE_BLS,
  ACTION_CLEAR_NODE_DATA
} from '@screens/Node/Node.constant';
import { ExHandler } from '@services/exception';
import { apiGetNodesInfo } from '@screens/Node/Node.services';
import accountService from '@services/wallet/accountService';
import Device from '@models/device';
import LocalDatabase from '@utils/LocalDatabase';
import VirtualNodeService from '@services/VirtualNodeService';
import { parseNodeRewardsToArray } from '@screens/Node/utils';
import {
  parseRewards,
  combineNodesInfoToObject,
  formatNodeItemFromApi
} from '@screens/Node/Node.utils';

const MAX_RETRY = 5;

export const actionFetchingNodesInfoFromAPI = (isRefresh) => ({
  type: ACTION_FETCHING_NODES_INFO_FROM_API,
  isRefresh
});

export const actionFetchedNodesInfoFromAPI = payload => ({
  type: ACTION_FETCHED_NODES_INFO_API,
  payload,
});

export const actionFetchNodesInfoFromAPIFail = () => ({
  type: ACTION_FETCH_NODES_INFO_FROM_API_FAIL,
});

// Make sure VNode have BLS key before call action.
export const actionGetNodesInfoFromApi = (isRefresh) => async (dispatch, getState) => {
  const state = getState();
  let { listDevice, isFetching, isRefreshing } = state?.node;
  if (isFetching || isRefreshing) return;
  try {
    await dispatch(actionFetchingNodesInfoFromAPI(isRefresh));
    const nodesInfo = await apiGetNodesInfo();
    const {
      allTokens,
      allRewards,
      noRewards
    } = await parseRewards(nodesInfo);

    // convert nodesInfo from API to Object
    let combineNodeInfo = combineNodesInfoToObject(nodesInfo);

    // format listDevice with new Data get from API
    listDevice = await Promise.all(listDevice.map(async (device) => (
      await formatNodeItemFromApi(device, combineNodeInfo, allTokens)
    )));

    await dispatch(actionFetchedNodesInfoFromAPI({
      listDevice,
      nodeRewards: parseNodeRewardsToArray(allRewards, allTokens),
      noRewards,
      allTokens
    }));

  } catch (error) {
    new ExHandler(error).showErrorToast();
    await dispatch(actionFetchNodesInfoFromAPIFail());
  }
};

export const actionClearNodeData = () => ({
  type: ACTION_CLEAR_NODE_DATA
});

/**
* @param {Object<{
*   listDevice: array,
*   isFetching: boolean
* }>} payload
*/
export const updateListNodeDevice = (payload) => ({
  type: ACTION_UPDATE_LIST_NODE_DEVICE,
  payload,
});

export const actionUpdateListNodeDevice = (payload) => async (dispatch) => {
  try {
    let { listDevice } = payload;
    // listDevice = await Promise.all(listDevice.map(async item => await formatTxNode(Device.getInstance(item))));
    listDevice = listDevice.map(item => Device.getInstance(item));
    await LocalDatabase.saveListDevices(listDevice);
    dispatch(updateListNodeDevice({
      ...payload,
      listDevice
    }));
  } catch (error) {
    throw error;
  }
};

/**
* @param {boolean} isFetching
*/
export const actionUpdateFetching = (isFetching) => ({
  type: ACTION_UPDATE_FETCHING,
  isFetching,
});

export const actionUpdateMissingSetup = (payload) => ({
  type: ACTION_UPDATE_MISSING_SETUP,
  payload
});

export const actionSetTotalVNode = (payload) => ({
  type: ACTION_SET_TOTAL_VNODE,
  payload
});

export const actionUpdateNumberLoadedVNodeBLS = () => ({
  type: ACTION_UPDATE_NUMBER_LOADED_VNODE_BLS,
});

export const updateDeviceItem = (options, callbackResolve) => async (dispatch, getState) => {
  try {
    let {
      blsKey,
      productId,
      device: itemDevice
    }  = options;
    const state     = getState();
    const wallet    = state?.wallet;
    const now       = new Date().getTime();
    const newBLSKey = await VirtualNodeService.getPublicKeyMining(itemDevice);

    const { listDevice }  = state?.node;

    const deviceIndex
      = listDevice.findIndex(item => item.ProductId === productId);

    let device = {};
    if (deviceIndex > -1) {
      device = listDevice[deviceIndex];
    }
    if (newBLSKey && blsKey !== newBLSKey) {
      device.PublicKeyMining  = newBLSKey;
      device.Account = {};
      device.StakeTx = null;
    }
    if (newBLSKey) {
      device?.setIsOnline(MAX_RETRY);
      const listAccount
        = await wallet.listAccount();
      const rawAccount
        = await accountService.getAccountWithBLSPubKey(newBLSKey, wallet);

      device.Account = listAccount.find(item =>
        item.AccountName === rawAccount?.name
      );

      if (device.Account) {
        device.ValidatorKey = device.Account.ValidatorKey;
        if (device?.Account?.PublicKeyCheckEncode && !device.PublicKey) {
          device.PublicKey = device.Account.PublicKeyCheckEncode;
        }
      }
    } else {
      device?.setIsOnline(Math.max(device?.IsOnline - 1, 0));
    }

    await LocalDatabase.saveListDevices(listDevice);
    await dispatch(updateListNodeDevice({ listDevice }));

    // Log Time load Node
    const end = new Date().getTime();
    console.log('Loaded Node in: ', end - now);
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    // CallBack
    callbackResolve && callbackResolve();
  }
};


