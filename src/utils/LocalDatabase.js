import User from '@models/user';
import AsyncStorage from '@services/storage';
import { CONSTANT_KEYS } from '@src/constants';
import _ from 'lodash';
import isEmpty from 'lodash/isEmpty';
// eslint-disable-next-line import/no-cycle
import Device from '@models/device';
// eslint-disable-next-line import/no-cycle
import {findAccountFromListAccounts} from '@screens/Node/Node.utils';

const TAG = 'LocalDatabase';
export const KEY_SAVE = {
  USER: CONSTANT_KEYS.USER,
  LIST_DEVICE: CONSTANT_KEYS.LIST_DEVICE,
  DEX_HISTORY: CONSTANT_KEYS.DEX_HISTORY,
  PIN: CONSTANT_KEYS.PIN,
  DECIMAL_SEPARATOR: '$decimal_separator',
  VERIFY_CODE: '$verify_code',
  ACCOUNT_QRCODE: '$account_qrcode',
  DEVICE_ID: '$device_id',
  SCREEN_STAKE_GUIDE: CONSTANT_KEYS.SCREEN_STAKE_GUIDE,
  WEBVIEW: '$webview',
  PROVIDE_TXS: CONSTANT_KEYS.PROVIDE_TXS,
  NODECLEARED: '$node_cleared',
  SHIP_ADDRESS: '$ship_address',
  MASTER_KEY_LIST: CONSTANT_KEYS.MASTER_KEY_LIST,
  FIREBASE_ID: '$FIREBASE_ID',
};
export default class LocalDatabase {
  static async getValue(key: String): String {
    // console.log(TAG, ' getValue begin ', key);
    try {
      const s = await AsyncStorage.getItem(key);
      return s;
    } catch (e) {
      console.log('GET ');
    }
  }
  static saveValue = async (key: String, value: Object) => {
    // console.log(TAG, ' saveValue begin ', value);
    await AsyncStorage.setItem(key, value);
  };

  static getListDevices = async (accountList = []): [] => {
    let listDevice = '';
    try {
      listDevice = JSON.parse((await LocalDatabase.getValue(KEY_SAVE.LIST_DEVICE)) || '[]');
      if(!isEmpty(accountList) && !isEmpty(listDevice)) {
        listDevice = listDevice.map(item => Device.getInstance(item));
        listDevice = listDevice.map(device => {
          const account = findAccountFromListAccounts({
            accounts: accountList,
            address: device?.PaymentAddress,
          });
          if (device.PaymentAddress && account) {
            device.Account = account;
            device.ValidatorKey = device.Account.ValidatorKey;
            device.PublicKey = device.Account.PublicKeyCheckEncode;
            device.PaymentAddressFromServer = account?.PaymentAddress;
          }
          return device;
        });
      }
    } catch (error) {
      console.log(TAG, ' getListDevices error ', error);
      throw new Error(error);
    }

    if (!_.isArray(listDevice)) {
      return [];
    }

    return listDevice;
  };

  static removeDevice = async (device, list) => {
    list = list.filter(item => item.ProductId !== device.ProductId);
    await LocalDatabase.saveListDevices(list);
    return list;
  };

  static updateDevice = async deviceJson => {
    let list = await LocalDatabase.getListDevices();
    const index = _.findIndex(list, ['product_name', deviceJson.product_name]);
    if (index >= 0) {
      list[index] = {
        ...list[index],
        ...deviceJson,
      };
    } else {
      list.push(deviceJson);
    }
    await LocalDatabase.saveListDevices(list);
  };
  /**
   * return {JSON} : deviceInfo
   */
  static getDevice = async product_id => {
    if (_.isEmpty(product_id)) throw new Error('product_id is empty');

    let list = await LocalDatabase.getListDevices();
    const index = _.findIndex(list, ['product_id', product_id]);
    return list[index];
  };
  static saveListDevices = async (jsonListDevice: []) => {
    const listDevices = JSON.stringify(jsonListDevice, (key, value) => {
      if (key === 'Wallet' || key === 'MasterKey') {
        return undefined;
      }
      return value;
    });
    await LocalDatabase.saveValue(KEY_SAVE.LIST_DEVICE, listDevices);
  };

  static saveUpdatingFirware = async (product_id, isUpdating) => {
    if (!_.isEmpty(product_id)) {
      const deviceJSON =
        (await LocalDatabase.getDevice(product_id).catch(
          e => {
            console.log('saveUpdatingFirware error: ', e);
            throw new Error('device not found in local');
          },
        )) ?? undefined;
      if (deviceJSON) {
        deviceJSON['minerInfo'] = {
          ...deviceJSON['minerInfo'],
          isUpdating: isUpdating,
        };
        await LocalDatabase.updateDevice(deviceJSON);
        console.log(
          TAG,
          ' saveUpdatingFirware end success deviceJSON=',
          deviceJSON,
        );
      }
    }
  };

  static async saveUserInfo(jsonUser: String) {
    const oldUser = await LocalDatabase.getValue(KEY_SAVE.USER);
    if (jsonUser !== oldUser) {
      const data = {...JSON.parse(oldUser), ...JSON.parse(jsonUser)};
      await LocalDatabase.saveValue(KEY_SAVE.USER, JSON.stringify(data));
    }
  }
  static async getUserInfo(): Promise<User> {
    const userJson = (await LocalDatabase.getValue(KEY_SAVE.USER)) || '';
    return _.isEmpty(userJson) ? null : new User(JSON.parse(userJson));
  }

  static async getOldDexHistory() {
    const swapHistory =
      (await LocalDatabase.getValue(KEY_SAVE.DEX_HISTORY)) || '';
    return _.isEmpty(swapHistory) ? [] : JSON.parse(swapHistory);
  }

  static async saveDexHistory(dexHistories, walletName) {
    await LocalDatabase.saveValue(
      `${walletName}-dex-histories`,
      JSON.stringify(dexHistories),
    );
  }

  static async getDexHistory(walletName) {
    const swapHistory =
      (await LocalDatabase.getValue(`${walletName}-dex-histories`)) || '';
    return _.isEmpty(swapHistory) ? [] : JSON.parse(swapHistory);
  }

  static async getPIN() {
    const pin = await LocalDatabase.getValue(KEY_SAVE.PIN);
    return pin || '';
  }

  static async savePIN(newPin) {
    const pin = await LocalDatabase.saveValue(KEY_SAVE.PIN, newPin);
    return pin || '';
  }

  static saveDecimalSeparator(separator) {
    return LocalDatabase.saveValue(KEY_SAVE.DECIMAL_SEPARATOR, separator);
  }

  static getDecimalSeparator() {
    return LocalDatabase.getValue(KEY_SAVE.DECIMAL_SEPARATOR);
  }

  static saveVerifyCode(verifyCode) {
    return LocalDatabase.saveValue(KEY_SAVE.VERIFY_CODE, verifyCode);
  }

  static getVerifyCode = async () => {
    let verifyCode = await LocalDatabase.getValue(KEY_SAVE.VERIFY_CODE);
    return verifyCode;
  }

  static saveAccountWithQRCode(account) {
    return LocalDatabase.saveValue(KEY_SAVE.ACCOUNT_QRCODE, JSON.stringify(account));
  }

  static getAccountWithQRCode = async () => {
    let verifyCode = await LocalDatabase.getValue(KEY_SAVE.ACCOUNT_QRCODE);
    return verifyCode;
  }

  static saveDeviceId(deviceId) {
    return LocalDatabase.saveValue(KEY_SAVE.DEVICE_ID, deviceId);
  }

  static getDeviceId() {
    return LocalDatabase.getValue(KEY_SAVE.DEVICE_ID) || '';
  }

  static saveFirebaseId(firebaseID) {
    return LocalDatabase.saveValue(KEY_SAVE.FIREBASE_ID, firebaseID);
  }

  static getFirebaseId() {
    return LocalDatabase.getValue(KEY_SAVE.FIREBASE_ID) || '';
  }

  // For webview caching
  static getUriWebviewCommunity = () => {
    return LocalDatabase.getValue(KEY_SAVE.WEBVIEW);
  };

  static setUriWebviewCommunity = (value) => {
    return LocalDatabase.saveValue(KEY_SAVE.WEBVIEW, value);
  };

  static async getProvideTxs() {
    const value = await LocalDatabase.getValue(KEY_SAVE.PROVIDE_TXS);
    return value ? JSON.parse(value) : [];
  }

  static saveProvideTxs(txs) {
    return LocalDatabase.saveValue(
      KEY_SAVE.PROVIDE_TXS,
      JSON.stringify(txs || []),
    );
  }

  // For node caching
  static getNodeCleared = () => {
    return LocalDatabase.getValue(KEY_SAVE.NODECLEARED);
  };

  static setNodeCleared = (value) => {
    return LocalDatabase.saveValue(KEY_SAVE.NODECLEARED, value);
  };

  static getShipAddress = async () => {
    const value = await LocalDatabase.getValue(KEY_SAVE.SHIP_ADDRESS);
    return JSON.parse(value || '{}');
  };

  static setShipAddress = (value) => {
    return LocalDatabase.saveValue(KEY_SAVE.SHIP_ADDRESS, JSON.stringify(value || {}));
  };

  static getMasterKeyList = async () => {
    const value = await LocalDatabase.getValue(KEY_SAVE.MASTER_KEY_LIST);
    return JSON.parse(value || '[]');
  };

  static setMasterKeyList = (value) => {
    return LocalDatabase.saveValue(KEY_SAVE.MASTER_KEY_LIST,
      JSON.stringify(
        value.map(item => ({ ...item, wallet: undefined })) ||
        [],
      )
    );
  };
}
