import LocalDatabase from '@utils/LocalDatabase';
import Device, {MAX_ERROR_COUNT} from '@models/device';
import NodeService from '@services/NodeService';
import APIService from '@src/services/api/miner/APIService';
import LogManager from '@src/services/LogManager';
import VirtualNodeService from '@services/VirtualNodeService';
import { map, isEmpty, isNumber } from 'lodash';
import {getTransactionByHash} from '@services/wallet/RpcClientService';

/**
* @param {array} listDevice
*/

export const checkShowWelcome = (listDevice) => {
  return new Promise(async (resolve, reject) => {
    try {
      const clearedNode = await LocalDatabase.getNodeCleared();
      const list = (await LocalDatabase.getListDevices()) || [];
      if (!clearedNode && listDevice.length === 0 && list.length > 0) {
        const firstDevice = Device.getInstance(list[0]);
        if (firstDevice.IsPNode && !firstDevice.IsLinked) {
          resolve(true);
        }
      }
      resolve(false);
    } catch (e) {
      reject(e);
    }
  });
};

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

export const getTotalVNode = async () => {
  let listDevice = await LocalDatabase.getListDevices();
  listDevice = map(listDevice, item => Device.getInstance(item));
  let hasVNode        = false;
  let vNodeNotHaveBLS = 0;
  listDevice.forEach(item => {
    if (item.IsVNode) {
      hasVNode = true;
      if (isEmpty(item.PublicKeyMining)) {
        vNodeNotHaveBLS++;
      }
    }
  });

  return {
    hasVNode,
    vNodeNotHaveBLS
  };
};

export const getBLSWithVNode = async (device) => {
  return await VirtualNodeService.getPublicKeyMining(device);
};

export const formatTxNode = async (device) => {
  // reward set on API result
  // device.Rewards = rewards || {};
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