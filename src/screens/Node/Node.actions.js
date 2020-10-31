import {
  ACTION_FETCHED_NODES_INFO_API,
  ACTION_FETCHING_NODES_INFO_FROM_API,
  ACTION_FETCH_NODES_INFO_FROM_API_FAIL,
  ACTION_UPDATE_FETCHING,
  ACTION_UPDATE_LIST_NODE_DEVICE,
  ACTION_UPDATE_MISSING_SETUP,
  ACTION_SET_TOTAL_VNODE,
  ACTION_UPDATE_NUMBER_LOADED_VNODE_BLS
} from '@screens/Node/Node.constant';
import { ExHandler } from '@services/exception';
import { apiGetNodesInfo } from '@screens/Node/Node.services';
import accountService from '@services/wallet/accountService';
import Device, { VALIDATOR_STATUS } from '@models/device';
import LocalDatabase from '@utils/LocalDatabase';
import VirtualNodeService from '@services/VirtualNodeService';
import { isEmpty } from 'lodash';
import {parseNodeRewardsToArray} from '@screens/Node/utils';
import {PRV} from '@services/wallet/tokenService';
import {PRV_ID} from '@screens/Dex/constants';

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
  let { listDevice, isFetching, isRefreshing } = state.node;
  if (isFetching || isRefreshing) return;

  let noRewards = true;

  try {
    await dispatch(actionFetchingNodesInfoFromAPI(isRefresh));
    const nodesFromApi  = await apiGetNodesInfo();
    let combineNodeInfo = {};
    let allRewards = { [PRV_ID]: 0 };
    nodesFromApi.forEach(item => {
      combineNodeInfo[isEmpty(item?.BLS) ? item?.QR_CODE : item?.BLS] = item;
      if (item.Rewards && item.Rewards.length > 0) {
        const reward = item.Rewards[0];
        allRewards[reward?.TokenID] = reward?.Amount;
        if (reward?.Amount > 0) {
          noRewards = false;
        }
      }
    });
    const nodeRewards = parseNodeRewardsToArray(allRewards, [PRV]);

    listDevice = listDevice.map((device) => {
      const itemAPI = combineNodeInfo[device.IsVNode ? device.PublicKeyMining : device.PublicKey];
      if (!itemAPI) return device;
      const {
        IsInCommittee,
        IsInAutoStaking,
        IsAutoStake,
        Rewards
      } = itemAPI;

      if (IsInCommittee) {
        device.Status = VALIDATOR_STATUS.WORKING;
      } else if ( IsInAutoStaking ) {
        device.Status = VALIDATOR_STATUS.WAITING;
      } else {
        device.Status = null;
      }
      device.IsAutoStake  = IsAutoStake;

      if (Rewards && Rewards.length > 0) {
        const reward = Rewards[0];
        device.Rewards = { [reward?.TokenID]: reward?.Amount };
      } else {
        device.Rewards = { [PRV_ID]: 0 };
      }
      return device;
    });

    await dispatch(actionFetchedNodesInfoFromAPI({
      nodesFromApi: nodesFromApi || [],
      listDevice,
      nodeRewards,
      noRewards
    }));
  } catch (error) {
    new ExHandler(error).showErrorToast();
    await dispatch(actionFetchNodesInfoFromAPIFail());
  }
};

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

export const actionGetPNodeInfo = () => {

};

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
    const state           = getState();
    const wallet          = state?.wallet;

    const now = new Date().getTime();
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
      }
    } else {
      device?.setIsOnline(Math.max(device?.IsOnline - 1, 0));
    }

    await LocalDatabase.saveListDevices(listDevice);
    await dispatch(updateListNodeDevice({
      listDevice
    }));

    const end = new Date().getTime();
    console.log('Loaded Node in: ', end - now);
    //CallBack
    callbackResolve && callbackResolve();
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};


