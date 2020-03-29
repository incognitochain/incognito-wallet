/* eslint-disable import/no-cycle */
import APIService, { METHOD } from '@services/api/miner/APIService';
import DeviceLog from '@src/components/DeviceLog';
import Action from '@src/models/Action';
import Device from '@src/models/device';
import LocalDatabase from '@src/utils/LocalDatabase';
import Util from '@src/utils/Util';
import _ from 'lodash';
import ZMQService from 'react-native-zmq-service';
import { CustomError, ExHandler } from './exception';
import knownCode from './exception/customError/code/knownCode';
import FirebaseService, { DEVICE_CHANNEL_FORMAT, FIREBASE_PASS, MAIL_UID_FORMAT, PHONE_CHANNEL_FORMAT } from './FirebaseService';

const TAG = 'NodeService';
const password = `${FIREBASE_PASS}`;
const templateAction = {
  key:'',
  data:{}
};
const timeout = 18;
export const LIST_ACTION={
  UPDATE_FIRMWARE:{
    key:'update_firmware',
    data:undefined
  },
  CHECK_VERSION:{
    key:'check_version',
    data:undefined
  },
  GET_IP:{
    key:'ip_address',
    data:undefined
  },
  RESET:{
    key:'factory_reset',
    data:undefined
  },
  CHECK_STATUS:{
    key:'status',
    data:undefined
  },
  START:{
    key:'start',
    data:undefined
  },
  STOP:{
    key:'stop',
    data:undefined
  },
  GET_PUBLIC_KEY_MINING:{
    key:'getpublickeymining',
    data:{
      'jsonrpc': '1.0',
      'method': 'getpublickeymining',
      'params': [],
      'id': 1
    }
  },
};
export default class NodeService {
  static getAName = async ()=>{
    const listNode = await LocalDatabase.getListDevices()||[];
    const subfix = Date.now()%1000;
    const value = listNode?.length+1;
    const nodeName =  _.padEnd(`Node ${value}`,10,subfix);
    return nodeName;
  };

  static authFirebase = (product) =>{
    const pros =  new Promise((resolve,reject)=>{
      const productId = product.product_id;
      const firebase = new FirebaseService();
      const mailProductId = `${productId}${MAIL_UID_FORMAT}`;
      const password = `${FIREBASE_PASS}`;
      firebase.signIn(mailProductId, password).then(uid=>{
        resolve(uid);
      }).catch(e=>{
        reject(new CustomError(knownCode.node_auth_firebase_fail,{rawCode:e}));
      });

    });
    return Util.excuteWithTimeout(pros,12);
  };

  static verifyProductCode = async(verifyCode)=> {
    const params = { verify_code: verifyCode };
    const response = await Util.excuteWithTimeout(APIService.verifyCode(params), 60);
    const { status, data = {}} = response;
    if (status === 1) {
      const { product } = data;
      return product;
    }
  };

  static send = (product, actionExcute = templateAction, chain = 'incognito',type = 'incognito',dataToSend={}, timeout = 20) => {
    return new Promise((resolve,reject)=>{
      const productId = product.product_id;
      console.log(TAG, 'send ProductId: ', productId);
      if (productId) {
        const firebase = new FirebaseService();
        const uid = firebase.getUID()||'';
        const mailProductId = `${productId}${MAIL_UID_FORMAT}`;
        const action = NodeService.buildAction(product,actionExcute,dataToSend,chain,type);


        const callBack = res => {
          const {status = -1,data} = res;

          console.debug('SEND FIREBASE', JSON.stringify({
            res,
            action,
          }));

          console.log(TAG,'send Result: ', res);
          if (status >= 0) {
            resolve({...data,productId:productId,uid:uid});
          } else {
            console.log(TAG,'send Timeout action = ' + actionExcute.key);
            reject('Timeout action = '+  actionExcute.key);
          }
        };

        console.debug('SEND FIREBASE', JSON.stringify({
          mailProductId,
          password,
          action,
          timeout
        }));

        firebase.sendAction(
          mailProductId,
          password,
          action,
          callBack,
          timeout
        );
      }
    });



  };
  static buildAction =(product,actionExcute = templateAction,data, chain = 'incognito',type = 'incognito')=>{
    const productId = product.product_id || '';
    if (productId) {
      console.log(TAG, 'ProductId: ', product.product_id);
      const phoneChannel = `${productId}${PHONE_CHANNEL_FORMAT}`;
      const deviceChannel = `${productId}${DEVICE_CHANNEL_FORMAT}`;
      const dataToSend = data||{};
      const action = new Action(
        type,
        phoneChannel,
        { action: actionExcute.key, chain: chain, type: type, ...dataToSend },
        'firebase',
        deviceChannel
      );
      return action;
    }
    return null;
  };

  static reset = async(device:Device,chain='incognito')=>{

    try {
      if(!_.isEmpty(device)){
        const actionReset = LIST_ACTION.RESET;
        const dataResult = await Util.excuteWithTimeout(NodeService.send(device.data,actionReset,chain,Action.TYPE.PRODUCT_CONTROL),timeout);
        console.log(TAG,'reset send dataResult = ',dataResult);
        // const { status = -1, data, message= ''} = dataResult;
        return _.isEqual(dataResult?.status,1);
      }
    } catch (error) {
      console.log(TAG,'reset error = ',error);
    }

    return true;
  }

  static updateFirware = async(device:Device,chain='incognito')=>{

    try {
      if(!_.isEmpty(device)){
        const actionReset = LIST_ACTION.UPDATE_FIRMWARE;
        const dataResult = await Util.excuteWithTimeout(NodeService.send(device.data,actionReset,chain,Action.TYPE.PRODUCT_CONTROL),timeout);
        console.log(TAG,'updateFirware send dataResult = ',dataResult);
        // const { status = -1, data, message= ''} = dataResult;
        return dataResult;
      }
    } catch (error) {
      console.log(TAG,'updateFirware error = ',error);
      return null;
    }

    return null;
  }

  static checkVersion = async(device:Device,chain='incognito')=>{

    try {
      if(!_.isEmpty(device)){
        const action = LIST_ACTION.CHECK_VERSION;
        const dataResult = await Util.excuteWithTimeout(NodeService.send(device.data,action,chain,Action.TYPE.PRODUCT_CONTROL),8);
        console.log(TAG,'checkVersion send dataResult = ',dataResult);
        const { status = -1, data, message= ''} = dataResult;
        if(status === 1){
          return data;
        }
      }
    } catch (error) {
      console.log(TAG,'checkVersion error = ',error);
    }

    return null;
  }

  static pingGetIP = async(device:Device,chain='incognito')=>{

    try {
      if(!_.isEmpty(device)){
        const action = LIST_ACTION.GET_IP;
        const dataResult = await Util.excuteWithTimeout(NodeService.send(device.data,action,chain,Action.TYPE.PRODUCT_CONTROL),8);
        console.log(TAG,'pingGetIP send dataResult = ',dataResult);
        const { status = -1, data, message= ''} = dataResult;
        if(status === 1){
          return data;
        }
      }
    } catch (error) {
      console.log(TAG,'pingGetIP error = ',error);
    }

    return null;
  }

  static sendValidatorKey = async(device:Device,validatorKey:String,chain='incognito', addStep)=>{
    if(!_.isEmpty(device) && !_.isEmpty(validatorKey)){
      const params = {product_id:device.data.product_id, validatorKey:validatorKey};
      await NodeService.send(device.data,LIST_ACTION.START,chain,Action.TYPE.INCOGNITO,{...params,action:LIST_ACTION.START.key}, 20, addStep);
      const dataResult = await NodeService.send(device.data,LIST_ACTION.GET_IP,chain,Action.TYPE.PRODUCT_CONTROL, null, 20, addStep);
      const { status = -1, data} = dataResult;
      if(status === 1){
        const action:Action = NodeService.buildAction(device.data,LIST_ACTION.START,params,chain,Action.TYPE.INCOGNITO);
        const response = await APIService.sendValidatorKey(data,{
          type:action?.type||'',
          data:action?.data||{}
        });
        const uid = dataResult?.uid||'';
        return {...response,uid:uid};
      }
    }
  };

  static fetchAndSavingInfoNodeStake = async (device)=>{
    try {
      const paymentAddress =  device.PaymentAddressFromServer;
      const data = await APIService.fetchInfoNodeStake({ PaymentAddress: paymentAddress });
      const fetchProductInfo = device.toJSON()??{};
      fetchProductInfo['minerInfo'] = {
        ...fetchProductInfo.minerInfo,
        ...data
      };
      return fetchProductInfo;
    } catch (error) {
      console.log(TAG,'fetchAndSavingInfoNodeStake error = ',error);
    }
  };

  /**
   * {isHave:false,current:0.0,node:0.0}
   */
  static checkUpdatingVersion = async (device:Device)=>{
    let dataResult = {isHave:false,current:undefined,node:undefined};
    try {
      const {data ,status = 0} = await APIService.getSystemPlatform().catch(e=>new ExHandler(e).showWarningToast())??{} ;
      console.log(TAG,'checkUpdatingVersion begin ');
      if(!_.isEqual(status,0)){
        console.log(TAG,'checkUpdatingVersion begin01 ');
        const {
          created_at,
          id,
          status = 0,
          version=''
        } = data;
        const nodeVersion = await NodeService.checkVersion(device);
        console.log(TAG,'checkUpdatingVersion nodeVersion ',nodeVersion);
        // compare to node's version
        dataResult = {
          ...dataResult,
          isHave: !_.isEqual(nodeVersion,version),
          current:version,
          node:nodeVersion
        };
        return dataResult;
      }
    } catch (error) {
      console.log(TAG,'checkUpdatingVersion error ',error);
      new ExHandler(error).throw();
    }
    return dataResult;
  }
  static sendZMQ = async (params)=> {
    if(!_.isEmpty(params)){
      console.log(TAG,' connectZMQ sendZMQ ----- begin ');
      const result = await Util.excuteWithTimeout(ZMQService.sendData(JSON.stringify(params)),4).catch(e=>console.log(TAG,' connectZMQ sendZMQ ----- catch error = ',e));
      return result;
    }
    return '';
  };

  static getBLSKey = async (device:Device, chain = 'incognito') => {
    try {
      const action = LIST_ACTION.GET_IP;
      const res = await Util.excuteWithTimeout(NodeService.send(device.data,action,chain,Action.TYPE.PRODUCT_CONTROL),5);
      const ip = res.data;
      device.Host = ip;
      const port = 9334;
      const url = `http://${ip}:${port}/`;
      const buildParams = LIST_ACTION.GET_PUBLIC_KEY_MINING.data;
      const response = await Util.excuteWithTimeout(APIService.getURL(METHOD.POST, url, buildParams, false,false), timeout);
      return _.split(response.Result, ':')[1];
    } catch (error) {
      console.debug(TAG,'getBLSKey error = ',error);
    }

    return null;
  };

  static isWithdrawable = async (device:Device) => {
    try {
      const response = await APIService.getRequestWithdraw(device.PaymentAddress);
      const status = response.Status;
      return status !== 1;
    } catch (error) {
      console.debug('isWithdrawable', error);
      return true;
    }
  };

  static getInfoByQrCode = (qrCode) => {
    return Util.excuteWithTimeout(APIService.getInfoByQrCode(qrCode), timeout);
  };

  static getLog = (device) => {
    return APIService.getLog(device.qrCodeDeviceId);
  };
}
