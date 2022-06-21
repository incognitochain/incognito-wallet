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
  ACTION_CLEAR_WITHDRAW_TXS,
  ACTION_UPDATE_WITHDRAWING,
  ACTION_UPDATE_LOADED_NODE,
  ACTION_UPDATE_ACCESS_TOKEN_REFRESH_TOKEN
} from '@screens/Node/Node.constant';
import { ExHandler } from '@services/exception';
import { apiGetNodeInfo, apiGetNodeReward } from '@screens/Node/Node.services';
import Device from '@models/device';
import LocalDatabase from '@utils/LocalDatabase';
import { parseNodeRewardsToArray } from '@screens/Node/utils';
import {
  parseRewards,
  combineNodesInfoToObject,
  formatNodeItemFromApi,
  combineNode,
  findNodeIndexByProductId,
  getNodeToken,
  getNodeBLSKey, findAccountFromListAccounts
} from '@screens/Node/Node.utils';
import NodeService from '@services/NodeService';
import moment from 'moment';
import { forEach, isEmpty } from 'lodash';
import { getTransactionByHash } from '@services/wallet/RpcClientService';
import { listAllMasterKeyAccounts } from '@src/redux/selectors/masterKey';

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
  const listAccount = listAllMasterKeyAccounts(state);
  let { listDevice, isFetching, isRefreshing } = state?.node;
  if (isFetching || isRefreshing) return;
  try {
    // Start loading
    await dispatch(actionFetchingNodesInfoFromAPI(isRefresh));

    const nodesInfo = await apiGetNodeReward();
    console.debug('Node Info From API: ', nodesInfo);

    const {
      allTokens,
      allRewards,
    } = await parseRewards(nodesInfo);
    const nodeRewards = parseNodeRewardsToArray(allRewards, allTokens);

    // convert nodesInfo from API to Object
    let combineNodeInfo = combineNodesInfoToObject(nodesInfo);

    // format listDevice with new Data get from API
    listDevice = await Promise.all(listDevice.map(async (device) => (
      await formatNodeItemFromApi(device, combineNodeInfo, allTokens, listAccount)
    )));

    await dispatch(actionFetchedNodesInfoFromAPI({
      listDevice,
      nodeRewards,
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

export const actionUpdateNodeByProductId = (productId, device) => async (dispatch, getState) => {
  try {
    const state             = getState();
    let { listDevice }      = state?.node;
    const deviceIndex = findNodeIndexByProductId(listDevice, productId);
    if (deviceIndex > -1 && listDevice.length > deviceIndex) {
      listDevice[deviceIndex] = device;
      await LocalDatabase.saveListDevices(listDevice);
      dispatch(updateListNodeDevice({ listDevice }));
    }
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

export const actionUpdateListNodeDevice = (payload) => async (dispatch) => {
  try {
    let { listDevice, ignoredInstance } = payload;
    if (!ignoredInstance) {
      listDevice = listDevice.map(item => Device.getInstance(item));
    }
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


export const updateWithdrawTxs = (withdrawTxs) => ({
  type: UPDATE_WITHDRAW_TXS,
  withdrawTxs
});

export const actionClearWithdrawTxs = () => ({
  type: ACTION_CLEAR_WITHDRAW_TXS,
});

export const actionUpdateWithdrawing = (withdrawing) => ({
  type: ACTION_UPDATE_WITHDRAWING,
  withdrawing
});

export const actionUpdateLoadedNode = (payload) => ({
  type: ACTION_UPDATE_LOADED_NODE,
  payload
});

// check node finish withdraw
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
    if (isEmpty(withdrawTxs)) {
      dispatch(actionUpdateWithdrawing(false));
    }
    dispatch(updateWithdrawTxs(withdrawTxs));
  } catch (error) {
    console.debug('Check Withdraw Txs with Error: ', error);
  }
};

// @actionUpdatePNodeItem update PNode
// update Account, Host, Firmware, PublicKeyMining, check is Online
// When callback load end, hide loading cell
export const actionUpdatePNodeItem = (productId) => async (dispatch, getState) => {
  try {
    const state           = getState();
    const listAccount     = listAllMasterKeyAccounts(state);
    const { listDevice }  = state?.node;
    if (productId) {
      dispatch(actionUpdateLoadedNode({[productId]: false}));
    }
    const start = new Date().getTime();
    const deviceIndex = findNodeIndexByProductId(listDevice, productId);
    let device = {};
    if (deviceIndex > -1 && listDevice.length > deviceIndex) {
      device = listDevice[deviceIndex];
      const deviceData = await NodeService.fetchAndSavingInfoNodeStake(device);
      if (!deviceData) return null;
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
      }

      const { blsKey, account } = await getNodeBLSKey(device, listAccount);
      if (!isEmpty(blsKey)) {
        device.PublicKeyMining = blsKey;
      }

      if (device.PaymentAddress && account) {
        device.Account = account;
        device.ValidatorKey = device.Account.ValidatorKey;
        device.PublicKey = device.Account.PublicKeyCheckEncode;
        device.Account = findAccountFromListAccounts({
          accounts: listAccount,
          address: device?.PaymentAddress,
        });
      }

      if (!device.IsSetupViaLan) {
        const ip = await NodeService.pingGetIP(device, 15);
        let blsPubKey = '';
        if (device.Account && device?.Account?.BLSPublicKey) {
          blsPubKey = device?.Account?.BLSPublicKey;
        }
        if (device.PublicKeyMining) {
          blsPubKey = device?.PublicKeyMining;
        }
        if (blsPubKey) {
          const { isOnline } = await apiGetNodeInfo({ blsKey: blsPubKey });
          if (isOnline) {
            device?.setIsOnline(MAX_RETRY);
          } else {
            device?.setIsOnline(0);
          }
          if (ip) {
            device.Host = ip;
          } else {
            device.Host = '';
          }
        }
      }

      if (device.IsOnline && device.Host) {
        try {
          const version = await NodeService.checkVersion(device);
          const latestVersion = await NodeService.getLatestVersion();
          device.Firmware = version;
          device.LatestFirmware = latestVersion;
          if (version && version !== latestVersion) {
            NodeService.updateFirmware(device, latestVersion)
              .then(res => console.debug('UPDATE FIRMWARE SUCCESS', device.QRCode, res))
              .catch(e => console.debug('UPDATE FIRMWARE FAILED', device.QRCode, e));
          }
        } catch (e) {
          console.debug('CHECK VERSION ERROR', device.QRCode, e);
        }
      }

      await dispatch(actionUpdateNodeByProductId(productId, device));
      // Log Time load Node
      const end = new Date().getTime();
      console.debug('Loaded PNode in: ', end - start);
    }
    return null;
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    if (productId) {
      dispatch(actionUpdateLoadedNode({[productId]: true}));
    }
  }
};

// @actionUpdateVNodeItem update VNode
// update Account, BLSKey, check is Online
// If VNode dont have BLSKey | PublicKey, dispatch action update success
// When callback load end, hide loading cell
export const actionUpdateVNodeItem = (deviceItem) => async (dispatch, getState) => {
  const oldBLSKey = deviceItem?.PublicKeyMining;
  const publicKey = deviceItem?.PublicKey;
  const productId = deviceItem?.ProductId;
  try {
    if (productId) {
      dispatch(actionUpdateLoadedNode({[productId]: false}));
    }
    const start       = new Date().getTime();
    const state       = getState();
    const listAccount = listAllMasterKeyAccounts(state);
    const { blsKey: newBLSKey } = await getNodeBLSKey(deviceItem, listAccount);
    const { listDevice }  = state?.node;

    const deviceIndex = findNodeIndexByProductId(listDevice, productId);

    let device = {};
    if (deviceIndex > -1 && listDevice.length > deviceIndex) {
      device = listDevice[deviceIndex];
      if (!isEmpty(newBLSKey)) {
        device.PublicKeyMining = newBLSKey;
        device.StakeTx = null;
      }

      // Check VNode has Account by BLS Key
      // If has new BLS Key, use new BLSKey, if not use Old BLS Key
      const accountBLSKey = isEmpty(newBLSKey) ? oldBLSKey : newBLSKey;
      device = await combineNode(device, listAccount, accountBLSKey || '');

      let blsPubKey = '';
      if (device.Account && device?.Account?.BLSPublicKey) {
        blsPubKey = device?.Account?.BLSPublicKey;
      }
      if (device.PublicKeyMining) {
        blsPubKey = device?.PublicKeyMining;
      }
      if (blsPubKey) {
        const { isOnline } = await apiGetNodeInfo({ blsKey: blsPubKey });
        if (isOnline) {
          device?.setIsOnline(MAX_RETRY);
        } else {
          device?.setIsOnline(0);
        }
      }

      await dispatch(actionUpdateNodeByProductId(productId, device));

      // Log Time load Node
      const end = new Date().getTime();
      console.debug('Loaded VNode in: ', end - start);
    }
    return null;
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    if (isEmpty(oldBLSKey) || isEmpty(publicKey)) {
      dispatch(actionUpdateNumberLoadedVNodeBLS());
    }
    if (productId) {
      dispatch(actionUpdateLoadedNode({[productId]: true}));
    }
  }
};

export const actionUpdateAccessRefreshToken = (payload) => ({
  type: ACTION_UPDATE_ACCESS_TOKEN_REFRESH_TOKEN,
  payload
});

export const actionCheckAccessRefreshToken = (accessToken, refreshToken) => async (dispatch) => {
  try {
    if (isEmpty(accessToken) || isEmpty(refreshToken)) {
      const {
        accessToken: access_token,
        refreshToken: refresh_token
      } = await getNodeToken();
      accessToken = access_token;
      refreshToken = refresh_token;
    }
    if (!isEmpty(accessToken) && !isEmpty(refreshToken)) {
      dispatch(actionUpdateAccessRefreshToken({accessToken, refreshToken}));
    }
  } catch (error) {/*Ignore error*/}
};
