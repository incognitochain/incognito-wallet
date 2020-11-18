import LocalDatabase from '@utils/LocalDatabase';
import Device, {MAX_ERROR_COUNT, VALIDATOR_STATUS} from '@models/device';
import NodeService from '@services/NodeService';
import APIService from '@src/services/api/miner/APIService';
import LogManager from '@src/services/LogManager';
import { map, isEmpty, isNumber, forEach, uniq } from 'lodash';
import { getTransactionByHash } from '@services/wallet/RpcClientService';
import tokenService, { PRV } from '@services/wallet/tokenService';
import { PRV_ID } from '@screens/Dex/constants';
import { getTokenList } from '@services/api/token';
import { parseNodeRewardsToArray } from '@screens/Node/utils';
import accountService from '@services/wallet/accountService';

export const checkIfVerifyCodeIsExisting = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if the current list is existing
      // Check next qrcode === current qrcode with verifyProductCode
      // No need to show
      let list = (await LocalDatabase.getListDevices()) || [];
      let verifyProductCode = await LocalDatabase.getVerifyCode();
      const deviceList = [];
      //did remove verifyCodeList dont use
      list.forEach(element => {
        deviceList.push(element?.product_name);
      });
      console.log('Verify code in Home node ' + verifyProductCode);
      if (verifyProductCode && verifyProductCode !== '') {
        console.log('Verify code in Home node ' + verifyProductCode);
        let result = await NodeService.verifyProductCode(verifyProductCode);
        console.log('Verifing process check code in Home node to API: ' + LogManager.parseJsonObjectToJsonString(result));
        // We also add tracking log
        await APIService.trackLog({
          action: 'tracking_node_devices', message: 'Tracking node devices info for better supportable', rawData: JSON.stringify({
            deviceList: deviceList || [],
            verifyProductCode: verifyProductCode || 'Empty',
            result: result || {}
          }), status: 1
        });
        if (result && result?.verify_code && result?.verify_code === verifyProductCode) { // VerifyCode the same and product_name in list
          resolve({ showModal: true, verifyProductCode });
          return;
        }
      } else {
        // Force eventhough the same
        await LocalDatabase.saveVerifyCode('');
      }
      resolve({ showModal: false, verifyProductCode: '' });
    } catch (e) {
      reject(e);
    }
  });
};

// Func support for VNode
// Get Total VNode dont have BLSKey | PublicKey
export const getTotalVNodeNotHaveBlsKey = async () => {
  let listDevice = await LocalDatabase.getListDevices();
  listDevice = map(listDevice, item => Device.getInstance(item));
  let hasVNode        = false;
  let vNodeNotHaveBLS = 0;
  listDevice.forEach(item => {
    if (item.IsVNode) {
      hasVNode = true;
      if (isEmpty(item.PublicKeyMining) || isEmpty(item.PublicKey)) {
        vNodeNotHaveBLS++;
      }
    }
  });
  return {
    hasVNode,
    vNodeNotHaveBLS,
    hasNode: listDevice.length > 0,
  };
};

// Update Node Info
// support for VNode and VNode
export const combineNode = async (device, wallet, newBLSKey) => {
  const listAccount = await wallet.listAccount();
  const rawAccount  = await accountService.getAccountWithBLSPubKey(newBLSKey, wallet);
  device.Account = listAccount.find(item =>
    item.AccountName === rawAccount?.name
  );
  if (device.Account) {
    device.ValidatorKey = device.Account.ValidatorKey;
    if (device?.Account?.PublicKeyCheckEncode && !device.PublicKey) {
      device.PublicKey = device.Account.PublicKeyCheckEncode;
    }
  }
  if (device.SelfUnstakeTx) {
    console.debug('CHECK UNSTAKE TX STATUS', device.SelfUnstakeTx, device.Name);
    try {
      const res = await getTransactionByHash(device.SelfUnstakeTx);
      console.debug('CHECK UNSTAKE TX STATUS RESPONSE', res, device.Name);

      if (res.isInBlock && !device.IsAutoStake) {
        device.SelfUnstakeTx = null;
      } else if (res.err) {
        if (!isNumber(device.SelfUnstakeTxErrorCount)) {
          device.SelfUnstakeTxErrorCount = MAX_ERROR_COUNT;
        }

        if (device.SelfUnstakeTxErrorCount <= 0) {
          device.SelfUnstakeTx = null;
        } else {
          device.SelfUnstakeTxErrorCount = device.SelfUnstakeTxErrorCount - 1;
        }
      }
    } catch {
      device.SelfUnstakeTx = null;
    }
  }

  if (device.SelfStakeTx) {
    console.debug('CHECK STAKE TX STATUS', device.SelfStakeTx, device.Name);
    try {
      const res = await getTransactionByHash(device.SelfStakeTx);
      console.debug('CHECK STAKE TX STATUS RESPONSE', res, device.Name);
      if (res.isInBlock && device.IsAutoStake) {
        device.SelfStakeTx = null;
      } else if (res.err) {
        if (!isNumber(device.SelfStakeTxErrorCount)) {
          device.SelfStakeTxErrorCount = MAX_ERROR_COUNT;
        }

        if (device.SelfStakeTxErrorCount <= 0) {
          device.SelfStakeTx = null;
        } else {
          device.SelfStakeTxErrorCount = device.SelfStakeTxErrorCount - 1;
        }
      }
    } catch {
      device.SelfStakeTx = null;
    }
  }
  return device;
};

/*
* Return value
// *All tokens in all rewards
// @allTokens = [{ displayName, hasIcon, id, isVerified, isVerified, name, pDecimals, symbol }]
*
// *All Nodes rewards
// Exp: { 0000000000004: 150 }
// @allRewards = { tokenId: tokenReward }
*
// *Check have rewards
// @noRewards = { boolean }
*
// *PRV rewards from Node
// Exp: { 0000000000004: 150 }
// @prvRewards = { PRV_ID: PRV_REWARD }
* */
export const parseRewards = async (nodesInfo, skipAllTokens = false) => {
  let tokenIds    = [];
  let rewardsList = [];
  let allTokens   = [PRV];
  let allRewards  = { [PRV_ID]: 0 };
  let noRewards   = true;

  forEach(nodesInfo, item => {
    rewardsList = rewardsList.concat(item?.Rewards || []);
  });
  forEach(rewardsList, (reward) => {
    const tokenId     = reward?.TokenID;
    const rewardValue = reward?.Amount || 0;
    tokenIds.push(tokenId);
    if (rewardValue > 0) {
      noRewards = false;
    }
    if (allRewards.hasOwnProperty(tokenId)) {
      allRewards[tokenId] += rewardValue;
    } else {
      allRewards[tokenId] = rewardValue;
    }
  });

  const prvRewards = { [PRV_ID]: allRewards[PRV_ID] };

  if (!skipAllTokens) {
    tokenIds = uniq(tokenIds);
    let tokenDict = tokenService.flatTokens(allTokens);
    if (tokenIds.some(id => !tokenDict[id])) {
      const pTokens = await getTokenList();
      allTokens = tokenService.mergeTokens(allTokens, pTokens);
      tokenDict = tokenService.flatTokens(allTokens);
      if (tokenIds.some(id => !tokenDict[id])) {
        const chainTokens = await tokenService.getPrivacyTokens();
        allTokens = tokenService.mergeTokens(chainTokens, allTokens);
      }
    }
  }
  return {
    allTokens,
    allRewards,
    noRewards,
    prvRewards
  };
};

export const combineNodesInfoToObject = (nodesInfo) => {
  let object = {};
  nodesInfo.forEach(item => {
    object[isEmpty(item?.BLS) ? item?.QRCode : item?.BLS] = item;
  });
  return object;
};

// Format Node Info get from API
export const formatNodeItemFromApi = async (device, listNodeObject, allTokens, wallet) => {
  const nodeItem = listNodeObject[
    device.IsVNode ? device.PublicKeyMining : device.QRCode
  ];
  if (!nodeItem) return device;
  const {
    IsInCommittee,
    IsInAutoStaking,
    IsAutoStake,
    PendingUnstake,
    IsUnstaked,
    PendingWithdrawal
  } = nodeItem;

  if (IsInCommittee) {
    // Node is in Committee
    device.Status = VALIDATOR_STATUS.WORKING;
  } else if ( IsInAutoStaking ) {
    // Node is waiting to join Committee
    device.Status = VALIDATOR_STATUS.WAITING;
  } else {
    // Nothing to show status => gray
    device.Status = null;
  }

  device.IsAutoStake = IsAutoStake;

  if (device.IsPNode) {

    // PNode unstaked => IsUnstaked = true
    device.IsFundedUnstakedRequestProcessed = IsUnstaked;

    // PNode waiting unstake => PendingUnstake = true
    device.IsFundedUnstaking                = PendingUnstake;

    // PendingWithdrawal === true
    // PNode is requesting Withdraw => cant withdraw, disable button withdraw
    // PendingWithdrawal === false
    // PNode is not request withdraw => can withdraw
    // It's mean IsFundedStakeWithdrawable === true => can withdraw, opposite
    device.IsFundedStakeWithdrawable = !PendingWithdrawal;

    // PNode has been Unstaked
    if (device.IsFundedUnstakedRequestProcessed) {
      // always allow withdraw
      device.IsFundedStakeWithdrawable = true;
      device.StakerAddress = null;
      let blsKey = device.PublicKeyMining;

      // IsFundedUnstakedRequestProcessed = true => PNode unstaked
      // IsFundedAutoStake = false =>
      if (device.IsFundedUnstaked && blsKey) {
        device = await combineNode(device, wallet, blsKey);
      }
    }
  }

  const {
    allRewards,
    prvRewards
  } = await parseRewards([nodeItem], true);
  device.Rewards    = prvRewards;
  device.AllRewards = parseNodeRewardsToArray(allRewards, allTokens);

  return device;
};