import User from '@models/user';
import AsyncStorage from '@react-native-community/async-storage';
import {CONSTANT_KEYS} from '@src/constants';
import _ from 'lodash';

const TAG = 'LocalDatabase';
export const KEY_SAVE = {
  USER: CONSTANT_KEYS.USER,
  LIST_DEVICE: CONSTANT_KEYS.LIST_DEVICE,
  LIST_TOKEN: CONSTANT_KEYS.LIST_TOKEN,
  DEX: CONSTANT_KEYS.DEX,
  DEX_HISTORY: CONSTANT_KEYS.DEX_HISTORY,
  SEEN_DEPOSIT_GUIDE: CONSTANT_KEYS.SEEN_DEPOSIT_GUIDE,
  PIN: CONSTANT_KEYS.PIN,
  DECIMAL_SEPARATOR: '$decimal_separator',
  FREQUENT_RECEIVERS: CONSTANT_KEYS.FREQUENT_RECEIVERS,
  VERIFY_CODE: '$verify_code',
};
export default class LocalDatabase {
  static async getValue(key: String): String {
    // console.log(TAG, ' getValue begin ', key);
    const s = await AsyncStorage.getItem(key);
    return s;
  }
  static saveValue = async (key: String, value: Object) => {
    // console.log(TAG, ' saveValue begin ', value);
    await AsyncStorage.setItem(key, value);
  };

  static getListDevices = async (): [] => {
    let listDevice = '';
    try {
      listDevice = (await LocalDatabase.getValue(KEY_SAVE.LIST_DEVICE)) || '';
    } catch (error) {
      console.log(TAG, ' getListDevices error ');
    }
    return Promise.resolve(
      !_.isEmpty(listDevice) ? JSON.parse(listDevice) : [],
    );
  };

  static removeDevice = async (device, list) => {
    list = list.filter(item => item.ProductId !== device.ProductId);
    await LocalDatabase.saveListDevices(list);
    return list;
  };

  static updateDevice = async deviceJson => {
    let list = await LocalDatabase.getListDevices();
    const index = _.findIndex(list, ['product_id', deviceJson.product_id]);
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
    const listDevices = JSON.stringify(jsonListDevice);
    await LocalDatabase.saveValue(KEY_SAVE.LIST_DEVICE, listDevices);
  };
  static getListToken = async () => {
    let list = await LocalDatabase.getValue(KEY_SAVE.LIST_TOKEN);
    return JSON.parse(list || '[]');
  };
  static saveListToken = listToken => {
    return LocalDatabase.saveValue(
      KEY_SAVE.LIST_TOKEN,
      JSON.stringify(listToken),
    );
  };
  static saveDeviceKeyInfo = async (product_id, keyInfo) => {
    if (!_.isEmpty(product_id) && !_.isEmpty(keyInfo)) {
      const deviceJSON =
        (await LocalDatabase.getDevice(product_id).catch(
          e => throw new Error('device not found in local'),
        )) ?? undefined;
      if (deviceJSON) {
        deviceJSON['keyInfo'] = {
          ...deviceJSON['keyInfo'],
          ...keyInfo,
        };
        await LocalDatabase.updateDevice(deviceJSON);
        console.log(
          TAG,
          ' saveDeviceKeyInfo end success deviceJSON=',
          deviceJSON,
        );
      }
    }
  };
  static saveUpdatingFirware = async (product_id, isUpdating) => {
    if (!_.isEmpty(product_id)) {
      const deviceJSON =
        (await LocalDatabase.getDevice(product_id).catch(
          e => throw new Error('device not found in local'),
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
  static async logout() {
    return await AsyncStorage.multiRemove([
      KEY_SAVE.USER,
      KEY_SAVE.LIST_DEVICE,
    ]);
  }
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

  static async saveDEXInfo(dexInfo) {
    await LocalDatabase.saveValue(KEY_SAVE.DEX, JSON.stringify(dexInfo));
  }

  static async getDEXInfo() {
    const dexString = (await LocalDatabase.getValue(KEY_SAVE.DEX)) || '';
    return _.isEmpty(dexString) ? null : JSON.parse(dexString);
  }

  static async saveDexHistory(swapHistory) {
    await LocalDatabase.saveValue(
      KEY_SAVE.DEX_HISTORY,
      JSON.stringify(swapHistory),
    );
  }

  static async getDexHistory() {
    const swapHistory =
      (await LocalDatabase.getValue(KEY_SAVE.DEX_HISTORY)) || '';
    return _.isEmpty(swapHistory) ? [] : JSON.parse(swapHistory);
  }

  static async saveSeenDepositGuide(firstTime) {
    await LocalDatabase.saveValue(
      KEY_SAVE.SEEN_DEPOSIT_GUIDE,
      JSON.stringify(firstTime),
    );
  }

  static async getSeenDepositGuide() {
    const seenDepositGuide =
      (await LocalDatabase.getValue(KEY_SAVE.SEEN_DEPOSIT_GUIDE)) || '';
    return _.isEmpty(seenDepositGuide) ? false : JSON.parse(seenDepositGuide);
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

  static async getFrequentReceivers() {
    const receivers = JSON.parse(
      await LocalDatabase.getValue(KEY_SAVE.FREQUENT_RECEIVERS),
    );
    return _.isEmpty(receivers) ? [] : receivers;
  }

  static async setFrequentReceivers(receiver = {name: '', address: ''}) {
    const oldReceivers = await this.getFrequentReceivers();
    const {name, address} = receiver;
    const isReceiverExist = oldReceivers.some(
      item => item?.address === address || item?.name === name,
    );
    if (isReceiverExist) {
      throw Error('User exist!');
    }
    const newReceivers = JSON.stringify([...oldReceivers, receiver]);
    return LocalDatabase.saveValue(KEY_SAVE.FREQUENT_RECEIVERS, newReceivers);
  }

  static saveVerifyCode(verifyCode) {
    return LocalDatabase.saveValue(KEY_SAVE.VERIFY_CODE, verifyCode);
  }

  static getVerifyCode() {
    return LocalDatabase.getValue(KEY_SAVE.VERIFY_CODE);
  }
}
