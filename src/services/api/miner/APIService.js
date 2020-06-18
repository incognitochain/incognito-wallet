/**
 * @providesModule APIService
 */
import User from '@models/user';
import NetInfo from '@react-native-community/netinfo';
import { CONSTANT_CONFIGS, CONSTANT_MINER } from '@src/constants';
import { CustomError, ErrorCode, ExHandler } from '@src/services/exception';
import http from '@src/services/http';
import Util from '@src/utils/Util';
import LocalDatabase from '@utils/LocalDatabase';
import _ from 'lodash';
import { Platform } from 'react-native';
import LogManager from '@src/services/LogManager';
import API from './api';

let AUTHORIZATION_FORMAT = 'Autonomous';
export const METHOD = {
  POST: 'post',
  GET: 'get',
  PUT: 'PUT',
  DELETE: 'delete',
};
const TAG = 'APIService';
export default class APIService {
  static buildUrl(url, parameters) {
    let qs = '';
    for (const key in parameters) {
      const value = parameters[key];
      qs += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
    }
    if (qs.length > 0) {
      qs = qs.substring(0, qs.length - 1); // chop off last "&"
      url = `${url}?${qs}`;
    }
    return url;
  }

  static async getURL(method, url, params, isLogin, isBuildFormData = true) {
    console.log(TAG, 'getURL :', url);
    // console.log(TAG,'getURL Params:', params);
    let header = {};
    let user = {};
    const isConnected = await NetInfo.fetch();
    // console.log('isConnected==>', isConnected);
    if (!isConnected) {
      return { status: 0, data: { message: 'Internet is offline' } };
    }

    if (isLogin) {
      const userObject: User = await LocalDatabase.getUserInfo();
      user = userObject?.data || {};
      // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjFENUVBQUMzLUQzMTUtNEIxQy1CNEI1LTZBQkFEMUM2MzBDREBtaW5lclguY29tIiwiZXhwIjoxNTc1MjA5ODI2LCJpZCI6MTU5MzI2fQ.GChhKLlRC9IVzr7HwwBbo41JllOBH8gX2PuyWO6UVpM';
      const token = user.token;
      console.log(TAG, 'getURL token', token);
      header = {
        Authorization: `${AUTHORIZATION_FORMAT} ${token}`,
      };
    }
    if (method === METHOD.GET) {
      try {
        const URL = APIService.buildUrl(url, params);
        console.log('URL build :', URL);
        const res = await fetch(URL, {
          method,
          // credentials: 'include',
          headers: header,
        });

        // console.log(TAG,'getURL Header: ', header);
        // console.log(TAG,'getURL Res:', res);
        // if (!res.ok) {
        //   // throw new Error(res.statusText);
        //   return {status: 0, data: ''};
        // }
        if (res && res.error) {
          //throw new Error(res.error);
          return { status: 0, data: '' };
        }
        if (res.status == 200) {
          const resJson = await res.json();
          // console.log(TAG,'getURL Response data:', resJson);
          return resJson;
        } else if (res.status == 401) {
          console.log(TAG, 'getURL 401 -----');
          let response = await APIService.handleRefreshToken(
            method,
            url,
            params,
            isLogin,
            user,
          );
          return response;
        } else {
          return { status: 0, data: '' };
        }
      } catch (error) {
        console.debug('API ERROR', error);
        throw error;
        //return {status: 0, error: error.message} ;
      }
    } else if (method === METHOD.POST || method === METHOD.PUT) {
      try {
        header = {
          ...header,
          Accept: 'application/json',
        };
        // header['Accept'] = 'application/json';
        let formData = JSON.stringify(params);
        if (isBuildFormData) {
          formData = new FormData();
          var isUpload = false;
          for (var k in params) {
            if (k == 'image' || k == 'image_file') {
              isUpload = true;
              //const isExist = await APIService.isExist(params[k])
              //console.log('File exist:', isExist)
              var photo = {
                uri: params[k],
                type: 'image/jpeg',
                name: 'photo.jpg',
              };
              formData.append(k, photo);
            } else {
              formData.append(k, params[k]);
            }

            //formData.append(k, params[k]);
          }
          console.log(TAG, 'Form data: ', formData);
          header['Content-Type'] = 'multipart/form-data';
        } else {
          header['Content-Type'] = 'application/json';
        }

        const res = await fetch(url, {
          method: method,
          headers: header,
          body: formData,
        });
        // console.log('Response:', res);
        // console.log('Header: ', header);
        // console.log('Resonse Status:', res.status);
        if (res && res.error) {
          //throw new Error(res.error);
          return { status: 0, data: '' };
        }

        if (res.status == 200) {
          const resJson = (await res
            .json()
            .catch((e) =>
              console.warn(TAG, 'getURL fail template json = ', e),
            )) || { status: 1 };
          // if(__DEV__ && _.includes(JSON.stringify(res),'https://hooks.slack.com/services/T06HPU570/BNVDZPZV4')){
          //   console.log(TAG,'getURL Response full',JSON.stringify(res));
          // }
          return resJson;
        } else if (res.status == 401) {
          let response = await APIService.handleRefreshToken(
            method,
            url,
            params,
            isLogin,
            user,
          );
          return response;
        } else {
          return { status: 0, data: '' };
        }
      } catch (error) {
        console.log('Error: ', url, error);
        return { status: 0, error: error.message };
      }
    } else if (method === METHOD.DELETE) {
      try {
        const URL = APIService.buildUrl(url, params);
        const res = await fetch(URL, {
          method: 'delete',
          credentials: 'include',
          headers: header,
        });
        console.log('Header: ', header);
        if (res && res.error) {
          //throw new Error(res.error);
          return { status: 0, data: '' };
        }
        if (res.status == 200) {
          const resJson = await res.json();
          console.log(TAG, 'Response data:', resJson);
          return resJson;
        } else if (res.status == 401) {
          let response = await APIService.handleRefreshToken(
            method,
            url,
            params,
            isLogin,
            user,
          );
          return response;
        } else {
          return { status: 0, data: '' };
        }
      } catch (error) {
        console.warn(error);
        return { status: 0, error: error.message };
      }
    }
  }

  static async handleRefreshToken(method, url, params, isLogin, user) {
    console.log('handleRefreshToken');
    console.log('User---------:', user);
    const header = {
      Authorization: `${AUTHORIZATION_FORMAT} ${user.refresh_token}`,
    };
    let URL = API.REFRESH_TOKEN_API;
    console.log('URL build :', URL);
    try {
      const res = await fetch(URL, {
        method: 'POST',
        credentials: 'include',
        headers: header,
      });
      console.log('Header:', header);
      if (res && res.error) {
        //throw new Error(res.error);
        return { status: 0, data: '' };
      }
      if (res.status == 200) {
        const resJson = await res.json();
        console.log('Response data:', resJson);
        const { status, data } = resJson;
        if (status) {
          const { token } = data;
          user.token = token;
          if (!_.isEmpty(token)) {
            console.log(TAG, 'handleRefreshToken save local');
            await LocalDatabase.saveUserInfo(JSON.stringify(user));
          }

          let response = await APIService.getURL(method, url, params, isLogin);

          return response;
        } else {
          return null;
        }
      }
      // else if (res.status == 401){
      //   return APIService.handleRefreshToken(user);
      // }
    } catch (error) {
      console.log('Error:', error);
      return null;
    }
  }

  static async signIn(params) {
    const url = API.SIGN_IN_API;
    const response = await APIService.getURL(METHOD.POST, url, params, false);
    return response;
  }

  static async sendValidatorKey(ipAdrress, { type, data }) {
    if (!_.isEmpty(data)) {
      const url = `http://${ipAdrress}:5000/init-node`;
      const buildParams = {
        type: type,
        source: '_PHONE',
        data: {
          action: data.action,
          chain: data.chain,
          product_id: data.product_id,
          validatorKey: data.validatorKey,
        },
        protocal: 'firebase',
      };

      console.log('buildParams', buildParams);

      const response = await APIService.getURL(
        METHOD.POST,
        url,
        buildParams,
        false,
        false,
      );
      console.log(TAG, 'sendValidatorKey:', response);
      return response;
    }
    return null;
  }

  static async updateValidatorKey(qrCode, validatorKey) {
    const url = `http://10.42.0.1:5000/update-key?qrcode=${qrCode}&validatorKey=${validatorKey}`;
    const data = await APIService.getURL(METHOD.GET, url);

    if (data.status !== 1) {
      throw new Error('Send validator key failed');
    }

    return data.status === 1;
  }

  static async pingHotspot() {
    try {
      const ipAdrress = '10.42.0.1';
      const url = `http://${ipAdrress}:5000`;
      const response = await Util.excuteWithTimeout(
        APIService.getURL(METHOD.GET, url, {}),
        3,
      );
      console.log(TAG, 'pingHotspot:', response);
      return !_.isEmpty(response);
    } catch (error) {
      return null;
    }
  }

  static async signUp(params) {
    const url = API.SIGN_UP_API;
    const response = await APIService.getURL(METHOD.POST, url, params, false);
    return response;
  }

  static async refreshToken(params) {
    const url = API.REFRESH_TOKEN_API;
    const response = await APIService.getURL(METHOD.POST, url, params, false);
    return response;
  }
  static async signOut() {
    const url = API.SIGN_OUT_API;
    const response = await APIService.getURL(METHOD.DELETE, url, {});
    return response;
  }
  static async getUserProfile() {
    const url = API.GET_PROFILE_API;
    const response = await APIService.getURL(METHOD.GET, url, {});
    return response;
  }

  static async verifyCode(params) {
    const url = API.VERIFY_CODE_API;

    const response = await APIService.getURL(METHOD.GET, url, params, true);

    console.debug('VERIFY CODE RESPONSE', response);

    return response;
  }

  static async removeProduct(params) {
    const url = API.REMOVE_PRODUCT_API;

    const response = await APIService.getURL(METHOD.DELETE, url, params, true);
    return response;
  }
  static async updateProduct(params) {
    const url = API.UPDATE_PRODUCT_API;

    const response = await APIService.getURL(METHOD.PUT, url, params, true);
    return response;
  }
  static async getSystemPlatform() {
    const url = API.GET_SYSTEM_APP_API;

    const response = await APIService.getURL(METHOD.GET, url, {}, true);
    return response;
  }

  static async getProductList(isNeedFilter = false) {
    const url = API.PRODUCT_LIST_API;

    const response = await APIService.getURL(METHOD.GET, url, {}, true);
    let { status, data = [] } = response;
    if (isNeedFilter && status === 1) {
      data = data.filter((item) => {
        return (
          _.includes(item.platform, CONSTANT_MINER.PRODUCT_TYPE) &&
          item.is_checkin == 1
        );
      });
    }
    return { status, data };
  }
  static async requestStake({
    ProductID,
    ValidatorKey,
    qrCodeDeviceId,
    PaymentAddress,
  }) {
    if (!PaymentAddress) return throw new Error('Missing paymentAddress');
    if (!ProductID) return throw new Error('Missing ProductID');
    if (!qrCodeDeviceId) return throw new Error('Missing qrCodeDeviceId');
    if (!ValidatorKey) return throw new Error('Missing ValidatorKey');

    const response = await http.post('pool/request-stake', {
      ProductID: ProductID,
      ValidatorKey: ValidatorKey,
      QRCode: qrCodeDeviceId,
      PaymentAddress: PaymentAddress,
    });

    return {
      status: !_.isEmpty(response) ? 1 : 0,
      data: response,
    };
  }

  static fetchInfoNodeStake({ PaymentAddress }) {
    return http.get('pool/request-stake', {
      params: {
        PaymentAddress: PaymentAddress,
      },
    });
  }

  static async airdrop1({
    WalletAddress,
    // pDexWalletAddress
  }) {
    if (!WalletAddress) throw new Error('Missing WalletAddress');
    // if (!pDexWalletAddress) return throw new Error('Missing pDexWalletAddress');

    const response =
      (await http
        .post('auth/airdrop1', {
          WalletAddress: WalletAddress,
          pDexWalletAddress: 'null'
        })
        .catch(console.log)) ?? false;
    console.log(TAG, 'airdrop1 end = ', response);
    return {
      status: response ? 1 : 0,
      data: response,
    };
  }

  static async qrCodeCheck({ QRCode }) {
    if (!QRCode) return throw new Error('Missing QRCode');
    try {
      let response = await http.post('pool/qr-code-check', {
        QRCode: QRCode,
      });
      const status = _.isBoolean(response) && response ? 1 : 0;
      console.log(TAG, 'qrCodeCheck end = ', response);
      return {
        status: status,
        data: response,
      };
    } catch (error) {
      const message = new ExHandler(
        error,
        'QR-Code is invalid. Please try again',
      ).message;
      return {
        status: 0,
        data: message,
      };
    }
  }

  static async trackLog({
    action = '',
    message = '',
    rawData = '',
    status = 1,
  }) {
    if (!action) return null;
    try {
      const phoneInfo = Util.phoneInfo();
      const url = API.TRACK_LOG;
      const buildParams = {
        os: `${Platform.OS}-${CONSTANT_CONFIGS.BUILD_VERSION}-${phoneInfo}`,
        action: `${CONSTANT_CONFIGS.isMainnet ? '' : 'TEST-'}${action}`,
        message: message,
        rawData: rawData,
        status: status,
      };
      const response = await Util.excuteWithTimeout(
        APIService.getURL(METHOD.POST, url, buildParams, false, false),
        3,
      );

      const status = _.isEmpty(response) ? 0 : 1;
      console.log(TAG, 'trackLog end = ', response);
      return {
        status: status,
        data: response,
      };
    } catch (error) {
      return {
        status: 0,
        data: null,
      };
    }
  }

  /**
   *
   * @param {*} QRCode
   * @returns {
        status:0,
        data: {WifiName ='', Status = false}
      }
   */
  static async qrCodeCheckGetWifi({ QRCode }) {
    if (!QRCode) return throw new Error('Missing QRCode');
    try {
      let response = await http.post('stake/qr-code-check-get-wifi', {
        QRCode: QRCode,
      });
      const { WifiName = '', Status = false } = response ?? {};
      console.log(TAG, 'qrCodeCheckGetWifi end = ', response);
      return {
        status: Status ? 1 : 0,
        data: response,
      };
    } catch (error) {
      const message = new ExHandler(
        error,
        'QR-Code is invalid. Please try again',
      ).message;
      return {
        status: 0,
        data: message,
      };
    }
  }

  static async requestWithdraw({ ProductID, QRCode, PaymentAddress }) {
    return http
      .post('pool/request-withdraw', {
        ProductID,
        ValidatorKey: '1234',
        QRCode,
        PaymentAddress,
      })
      .catch((error) => {
        if (error.message === 'Unknown error') {
          new ExHandler(
            new CustomError(ErrorCode.node_pending_withdrawal),
          ).throw();
        }
      });
  }

  static async getRequestWithdraw(paymentAddress) {
    return http.get(`pool/request-withdraw?PaymentAddress=${paymentAddress}`);
  }

  static getInfoByQrCode(QRCode) {
    return http.post('pool/qr-code-get', {
      QRCode,
    });
  }

  static getLog(qrCode) {
    const url = `${API.GET_LOG}?qrcode=${qrCode}`;
    return APIService.getURL(METHOD.GET, url, false, false);
  }
  // Shipping fee when buying device
  static async getShippingFee(city, country, code, region, street) {
    const url = `${API.ORDER}/order/shipping-fee`;
    const params = {
      AddressCity: city,
      AddressCountry: country,
      AddressPostalCode: code,
      AddressStreet: street,
      AddressRegion: region,
    };
    return APIService.getURL(METHOD.POST, url, params, false, false);
  }

  static async getBeaconBestStateDetail() {
    const url = `${CONSTANT_CONFIGS.TRACK_LOG_URL}`;
    const params = {
      jsonrpc: '1.0',
      method: 'getbeaconbeststatedetail',
      params: [],
      id: 1,
    };
    return http.post(url, params);
  }
  static async getListRewardAmount() {
    const url = `${CONSTANT_CONFIGS.TRACK_LOG_URL}`;
    const params = {
      jsonrpc: '1.0',
      method: 'listrewardamount',
      params: [],
      id: 1,
    };
    return http.post(url, params);
  }
  // Get list pToken support for buying device
  static async getPTokenSupportForBuyingDevice() {
    return http.get('order/tokens-support');
  }
  // Checkout device
  static async checkOutOrder(
    email,
    countryCode,
    street,
    city,
    region,
    postalCode,
    phoneNumber,
    tokenId,
    quantity,
    lastName,
    firstName,
  ) {
    const params = {
      LastName: lastName,
      FirstName: firstName,
      AddressStreet: street,
      AddressRegion: region,
      AddressCity: city,
      AddressPostalCode: postalCode,
      AddressCountry: countryCode,
      PhoneNumber: phoneNumber,
      TokenID: tokenId,
      Quantity: quantity,
      TaxCountry: countryCode,
      Email: email,
    };
    return http.post('order/incognito/checkout', params);
  }
  // Get system config
  static async getSystemConfig() {
    return http.get('system/configs');
  }
}
