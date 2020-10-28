import LocalDatabase from '@utils/LocalDatabase';
import Device from '@models/device';
import NodeService from '@services/NodeService';
import APIService from '@src/services/api/miner/APIService';
import LogManager from '@src/services/LogManager';

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

