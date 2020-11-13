import {
  ACTION_FETCHED_NODES_INFO_API,
  ACTION_FETCHING_NODES_INFO_FROM_API,
  ACTION_FETCH_NODES_INFO_FROM_API_FAIL,
  ACTION_UPDATE_FETCHING,
  ACTION_UPDATE_LIST_NODE_DEVICE,
  ACTION_UPDATE_MISSING_SETUP,
  ACTION_SET_TOTAL_VNODE,
  ACTION_UPDATE_NUMBER_LOADED_VNODE_BLS, ACTION_CLEAR_NODE_DATA
} from '@screens/Node/Node.constant';
import { ExHandler } from '@services/exception';
import { apiGetNodesInfo } from '@screens/Node/Node.services';
import accountService from '@services/wallet/accountService';
import Device, { VALIDATOR_STATUS } from '@models/device';
import LocalDatabase from '@utils/LocalDatabase';
import VirtualNodeService from '@services/VirtualNodeService';
import { isEmpty, forEach, uniq } from 'lodash';
import {parseNodeRewardsToArray} from '@screens/Node/utils';
import tokenService, {PRV} from '@services/wallet/tokenService';
import {PRV_ID} from '@screens/Dex/constants';
import {getTokenList} from '@services/api/token';

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

const formatRewards = async (data) => {
  let tokenIds    = [];
  let rewardsList = [];
  let allTokens   = [PRV];
  // let allRewards  = { [PRV_ID]: 0 };
  // let noRewards   = true;
  forEach(data, item => {
    rewardsList = rewardsList.concat(item?.Rewards || []);
  });
  // forEach(rewardsList, (reward) => {
  //   const tokenId     = reward?.TokenID;
  //   const rewardValue = reward?.Amount || 0;
  //   tokenIds.push(tokenId);
  //   if (rewardValue > 0) {
  //     noRewards = false;
  //   }
  //   if (allRewards.hasOwnProperty(tokenId)) {
  //     allRewards[tokenId] += rewardValue;
  //   } else {
  //     allRewards[tokenId] = rewardValue;
  //   }
  // });

  const {
    allRewards,
    noRewards
  } = rewardsList.reduce(( prvValue, curValue) => {
    const tokenId     = curValue?.TokenID;
    const rewardValue = curValue?.Amount || 0;

    let allRewards    = prvValue.allRewards;
    let noRewards     = prvValue.noRewards;


  }, {
    allRewards: { [PRV_ID]: 0 },
    noRewards: true
  });

  tokenIds = uniq(tokenIds);
  let tokenDict = tokenService.flatTokens(allTokens);
  if (tokenIds.some(id => !tokenDict[id])) {
    console.log('SANG TEST: ', tokenIds.some(id => !tokenDict[id]));
    const pTokens = await getTokenList();
    allTokens = tokenService.mergeTokens(allTokens, pTokens);
    tokenDict = tokenService.flatTokens(allTokens);
    if (tokenIds.some(id => !tokenDict[id])) {
      const chainTokens = await tokenService.getPrivacyTokens();
      allTokens = tokenService.mergeTokens(chainTokens, allTokens);
    }
  }
  return {
    allTokens,
    allRewards,
    noRewards
  };
};

// Make sure VNode have BLS key before call action.
export const actionGetNodesInfoFromApi = (isRefresh) => async (dispatch, getState) => {
  const state = getState();
  let { listDevice, isFetching, isRefreshing } = state.node;
  if (isFetching || isRefreshing) return;
  try {
    await dispatch(actionFetchingNodesInfoFromAPI(isRefresh));
    const nodesFromApi  = await apiGetNodesInfo();

    const { allTokens, allRewards, noRewards } = await formatRewards(nodesFromApi);

    let combineNodeInfo = {};
    nodesFromApi.forEach(item => {
      combineNodeInfo[isEmpty(item?.BLS) ? item?.QR_CODE : item?.BLS] = item;
    });

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

      device.Rewards = { [PRV_ID]: 0 };
      let deviceRewards  = { [PRV_ID]: 0 };
      forEach(Rewards || [], (reward) => {
        const tokenId     = reward?.TokenID;
        const rewardValue = reward?.Amount || 0;
        if (tokenId === PRV_ID) {
          device.Rewards = { [tokenId]: rewardValue };
        }
        if (deviceRewards.hasOwnProperty(tokenId)) {
          deviceRewards[tokenId] += rewardValue;
        } else {
          deviceRewards[tokenId] = rewardValue;
        }
      });

      device.AllRewards = parseNodeRewardsToArray(deviceRewards, allTokens);

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
    const state  = getState();
    const wallet = state?.wallet;

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
        if (device?.Account?.PublicKeyCheckEncode && !device.PublicKey) {
          device.PublicKey = device.Account.PublicKeyCheckEncode;
        }
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
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    // CallBack
    callbackResolve && callbackResolve();
  }
};


