import {
  ACTION_FETCHED_NODES_INFO_API,
  ACTION_FETCHING_NODES_INFO_FROM_API,
  ACTION_FETCH_NODES_INFO_FROM_API_FAIL,
  ACTION_UPDATE_LIST_NODE_DEVICE,
  ACTION_UPDATE_MISSING_SETUP,
  ACTION_SET_TOTAL_VNODE,
  ACTION_UPDATE_NUMBER_LOADED_VNODE_BLS,
  ACTION_CLEAR_NODE_DATA,
  UPDATE_WITHDRAW_TXS,
  ACTION_CLEAR_LIST_NODES,
  ACTION_CLEAR_WITHDRAW_TXS
} from '@screens/Node/Node.constant';
import { ExHandler } from '@services/exception';
import { apiGetNodesInfo } from '@screens/Node/Node.services';
import Device from '@models/device';
import LocalDatabase from '@utils/LocalDatabase';
import VirtualNodeService from '@services/VirtualNodeService';
import { parseNodeRewardsToArray } from '@screens/Node/utils';
import {
  parseRewards,
  combineNodesInfoToObject,
  formatNodeItemFromApi,
  combineNode
} from '@screens/Node/Node.utils';
import NodeService from '@services/NodeService';
import moment from 'moment';
import { forEach, isEqual } from 'lodash';
import { getTransactionByHash } from '@services/wallet/RpcClientService';

const MAX_RETRY = 5;
const TIMEOUT   = 5; // 2 minutes

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
// Get NodesInfo from API
export const actionGetNodesInfoFromApi = (isRefresh) => async (dispatch, getState) => {
  const state = getState();
  let { listDevice, isFetching, isRefreshing } = state?.node;
  const wallet = state?.wallet;
  if (isFetching || isRefreshing) return;
  try {
    // Start loading
    await dispatch(actionFetchingNodesInfoFromAPI(isRefresh));

    const nodesInfo = await apiGetNodesInfo();
    console.debug('Node Info From API: ', nodesInfo);

    const {
      allTokens,
      allRewards,
      noRewards
    } = await parseRewards(nodesInfo);
    const nodeRewards = parseNodeRewardsToArray(allRewards, allTokens);

    // convert nodesInfo from API to Object
    let combineNodeInfo = combineNodesInfoToObject(nodesInfo);

    // format listDevice with new Data get from API
    listDevice = await Promise.all(listDevice.map(async (device) => (
      await formatNodeItemFromApi(device, combineNodeInfo, allTokens, wallet)
    )));

    await dispatch(actionFetchedNodesInfoFromAPI({
      listDevice,
      nodeRewards,
      noRewards,
      allTokens
    }));

  } catch (error) {
    new ExHandler(error).showErrorToast();
    await dispatch(actionFetchNodesInfoFromAPIFail());
  }
};

// Clear data on Node screen
export const actionClearNodeData = (clearListNode) => ({
  type: ACTION_CLEAR_NODE_DATA,
  clearListNode
});

// Clear List Node on store
export const actionClearListNodes = () => ({
  type: ACTION_CLEAR_LIST_NODES,
});

// payload = { listDevice: array, isFetching: boolean };
export const updateListNodeDevice = (payload) => ({
  type: ACTION_UPDATE_LIST_NODE_DEVICE,
  payload,
});

export const actionUpdateNodeAt = (deviceIndex, device) => async (dispatch, getState) => {
  try {
    const state             = getState();
    let { listDevice }      = state?.node;
    listDevice[deviceIndex] = device;
    await LocalDatabase.saveListDevices(listDevice);
    dispatch(updateListNodeDevice({ listDevice }));
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

export const actionUpdateListNodeDevice = (payload) => async (dispatch) => {
  try {
    let { listDevice } = payload;
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

export const actionUpdateMissingSetup = (payload) => ({
  type: ACTION_UPDATE_MISSING_SETUP,
  payload
});

// check VNode have blsKey, account, total VNode
// if dont have VNode dont call this action
// payload = { hasVNode, vNodeNotHaveBLS }
export const actionSetTotalVNode = (payload) => ({
  type: ACTION_SET_TOTAL_VNODE,
  payload
});

// VNode dont have BLSKey | PublicKey
// Loaded blsKey | account success, call this action
// Enough loaded VNode call api load NodesInfo
export const actionUpdateNumberLoadedVNodeBLS = () => ({
  type: ACTION_UPDATE_NUMBER_LOADED_VNODE_BLS,
});

// @actionUpdatePNodeItem update PNode
// update Account, Host, Firmware, PublicKeyMining, check is Online
// When callback load end, hide loading cell
export const actionUpdatePNodeItem = (options, callbackResolve) => async (dispatch, getState) => {
  try {
    const state           = getState();
    const { listDevice }  = state?.node;
    const wallet          = state?.wallet;
    let { productId }     = options;
    const deviceIndex
      = listDevice.findIndex(item => item.ProductId === productId);
    let device = {};
    if (deviceIndex > -1) {
      device = listDevice[deviceIndex];
    }
    const deviceData = await NodeService.fetchAndSavingInfoNodeStake(device);
    device = Device.getInstance(deviceData);
    if (device.IsSetupViaLan) {
      const res = await NodeService.getLog(device);
      const log = res.Data;
      const { updatedAt, description } = log;
      let data;
      try { data = JSON.parse(description); } catch {/*Ignore the error*/}
      if (updatedAt) {
        const startTime = moment(updatedAt);
        const endTime   = moment();
        const duration  = moment.duration(endTime.diff(startTime));
        const minutes   = duration.asMinutes();
        if (minutes > TIMEOUT) {
          device.setIsOnline(Math.max(device.IsOnline - 1, 0));
        } else {
          device.setIsOnline(MAX_RETRY);
          device.Host = data?.ip?.lan;
        }
      }
    } else {
      const ip = await NodeService.pingGetIP(device);
      if (ip) {
        device.Host = ip;
        device.setIsOnline(MAX_RETRY);
      } else {
        device.Host = '';
        device.setIsOnline(Math.max(device.IsOnline - 1, 0));
      }
    }
    if (device.IsOnline && device.Host) {
      try {
        const version = await NodeService.checkVersion(device);
        const latestVersion = await NodeService.getLatestVersion();
        device.Firmware = version;
        if (version && version !== latestVersion) {
          NodeService.updateFirmware(device, latestVersion)
            .then(res => console.debug('UPDATE FIRMWARE SUCCESS', device.QRCode, res))
            .catch(e => console.debug('UPDATE FIRMWARE FAILED', device.QRCode, e));
        }
      } catch (e) {
        console.debug('CHECK VERSION ERROR', device.QRCode, e);
      }
    }
    if (device.PaymentAddress) {
      const listAccount = await wallet.listAccount();
      device.Account = listAccount.find(item => item.PaymentAddress === device.PaymentAddress);
      if (device.Account) {
        device.ValidatorKey = device.Account.ValidatorKey;
        device.PublicKey = device.Account.PublicKeyCheckEncode;
        const listAccounts = await wallet.listAccountWithBLSPubKey();
        const account = listAccounts.find(item=> isEqual(item.AccountName, device.AccountName));
        device.PublicKeyMining = account.BLSPublicKey;
      }
    }
    await dispatch(actionUpdateNodeAt(deviceIndex, device));
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    // CallBack
    callbackResolve && callbackResolve();
  }
};

// @actionUpdateVNodeItem update VNode
// update Account, BLSKey, check is Online
// If VNode dont have BLSKey | PublicKey, dispatch action update success
// When callback load end, hide loading cell
export const actionUpdateVNodeItem = (options, callbackResolve) => async (dispatch, getState) => {
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
      device = await combineNode(device, wallet, newBLSKey);
    } else {
      device?.setIsOnline(Math.max(device?.IsOnline - 1, 0));
    }

    await dispatch(actionUpdateNodeAt(deviceIndex, device));

    // Log Time load Node
    const end = new Date().getTime();
    console.debug('Loaded Node in: ', end - now);
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    // CallBack
    callbackResolve && callbackResolve();
  }
};

export const updateWithdrawTxs = (withdrawTxs) => ({
  type: UPDATE_WITHDRAW_TXS,
  withdrawTxs
});

export const actionClearWithdrawTxs = () => ({
  type: ACTION_CLEAR_WITHDRAW_TXS,
});

export const actionCheckWithdrawTxs = () =>  async (dispatch, getState) => {
  try {
    const state = getState();
    let { withdrawTxs } = state?.node;
    forEach(withdrawTxs, async (txId, key) => {
      const tx = await getTransactionByHash(txId);
      if (tx.err || tx.isInBlock) {
        delete withdrawTxs[key];
      }
    });
    dispatch(updateWithdrawTxs(withdrawTxs));
  } catch (error) {
    console.debug('Check Withdraw Txs with Error: ', error);
  }
};



