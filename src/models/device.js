import {DEVICES} from '@src/constants/miner';
import accountService from '@src/services/wallet/accountService';
import _ from 'lodash';

export const DEVICE_STATUS = {
  CODE_UNKNOWN : -1,
  CODE_STOP : 4,
  CODE_PENDING : 5,
  // CODE_OUT_OF_STATUS : -3,
  CODE_START : 2,
  CODE_MINING : 3,
  CODE_SYNCING : 1,
  CODE_OFFLINE : -2
};
export const DATA_INFO = [{'status':'ready', 'message':'online','code':DEVICE_STATUS.CODE_START},
  {'status':'syncing',  'message':__DEV__?'syncing_queueing':'queueing','code':DEVICE_STATUS.CODE_SYNCING},
  {'status':'mining', 'message':'earning','code':DEVICE_STATUS.CODE_MINING},
  {'status':'offline', 'message':__DEV__?'offline_online':'online','code':DEVICE_STATUS.CODE_START},
  {'status':'pending','message':__DEV__?'pending_queueing':'queueing','code':DEVICE_STATUS.CODE_PENDING},
  {'status':'notmining', 'message':__DEV__?'notmining_online':'online','code':DEVICE_STATUS.CODE_START},
  {'status':'waiting', 'message':__DEV__?'waiting_queueing':'queueing','code':DEVICE_STATUS.CODE_MINING}];
export const template = {
  minerInfo:{
    account:{},
    isCallStaked:false,
    qrCodeDeviceId: '',
    PaymentAddress: '',
    StakerAddress: '',
    validatorKey: '',
    Commission:1,
    isUpdating:false,
    publicKey: '',
    rewards: {},
    isOnline: 0,
    accountName: '',
    stakeTx: '',
  },
  keyInfo:{
    publicKeyMining:'',
    publicKeyRole:''
  },
  status:{
    code: -1,
    message:'Waiting'
  },
  is_checkin: 0,
  linked: false,
  platform: 'MINER',
  product_id: '',
  product_name: 'Miner',
  verify_code:'',
  user_id:-1,
  deleted:false,
  product_type:DEVICES.MINER_TYPE
};
export default class Device {
  static CODE_UNKNOWN = DEVICE_STATUS.CODE_UNKNOWN;
  static CODE_STOP = DEVICE_STATUS.CODE_STOP;
  static CODE_PENDING = DEVICE_STATUS.CODE_PENDING;
  static CODE_START = DEVICE_STATUS.CODE_START;
  static CODE_MINING = DEVICE_STATUS.CODE_MINING;
  static CODE_SYNCING = DEVICE_STATUS.CODE_SYNCING;
  static CODE_OFFLINE = DEVICE_STATUS.CODE_OFFLINE;

  constructor(data){
    this.data = {...template, ...data,status:template.status};
  }
  isUpdatingFirmware =()=>{
    return this.data.minerInfo?.isUpdating??false;
  };
  get PublicKeyMining(){
    return this.data.keyInfo?.publicKeyMining;
  }
  set PublicKeyMining(publicKeyMining:String){
    const keyInfo = {
      ...this.data.keyInfo,
      publicKeyMining:publicKeyMining
    };
    this.data['keyInfo'] = keyInfo;
  }
  set PublicKey(publicKey) {
    this.data.minerInfo.publicKey = publicKey;
  }
  get PublicKey() {
    return this.data.minerInfo.publicKey;
  }
  get IsOnline() {
    return this.data.minerInfo.isOnline;
  }
  get IsWorking() {
    return this.data.minerInfo.Status === 'committee';
  }
  setIsOnline(result) {
    this.data.minerInfo.isOnline = result;
  }
  set Rewards(rewards) {
    this.data.minerInfo.rewards = rewards;
  }
  get Rewards() {
    return this.data.minerInfo.rewards;
  }
  get Account() {
    return this.data?.minerInfo?.account;
  }
  set Account(account) {
    this.data.minerInfo.account = account;
  }
  get AccountName() {
    return this.data.minerInfo.account?.AccountName;
  }
  set StakeTx(tx) {
    this.data.minerInfo.stakeTx = tx;
  }
  get StakeTx() {
    return this.data.minerInfo.stakeTx;
  }
  get Staked() {
    return !!this.Status || !!this.StakeTx;
  }
  set IsAutoStake(result) {
    this.data.minerInfo.isAutoStake = result;
  }
  get IsAutoStake() {
    return this.data.minerInfo.isAutoStake;
  }
  set UnstakeTx(txId) {
    this.data.minerInfo.unstakeTx = txId;
  }
  get UnstakeTx() {
    return this.data.minerInfo.unstakeTx;
  }
  set ValidatorKey(key) {
    this.data.minerInfo.validatorKey = key;
  }
  get ValidatorKey() {
    return this.data.minerInfo.validatorKey || this.Account?.ValidatorKey;
  }
  get Unstaking() {
    return this.UnstakeTx || (!!this.Status && !this.IsAutoStake);
  }
  set IsWithdrawable(bool) {
    this.data.minerInfo.isDrawable = bool;
  }
  get IsWithdrawable() {
    return this.data.minerInfo.isDrawable;
  }
  set UnstakeStatus(status) {
    this.data.minerInfo.unstakeStatus = status;
  }
  get UnstakeStatus() {
    return this.data.minerInfo.unstakeStatus;
  }
  get IsUnstaking() {
    return this.UnstakeStatus === 1;
  }
  get Unstaked() {
    return this.UnstakeStatus === 2;
  }
  get Host(){
    return this.data.minerInfo?.ipAddress||'';
  }
  set Host(ip){
    this.data.minerInfo.ipAddress = ip;
  }
  get Port(){
    return this.data.minerInfo?.port||'';
  }
  set Port(port) {
    this.data.minerInfo.port = port;
  }

  get APIUrl(){
    if (!_.isEmpty(this.Host) && _.isEmpty(this.Port)) {
      return this.Host;
    }

    return !_.isEmpty(this.Host) && !_.isEmpty(this.Port) ? `${this.Host}:${this.Port}` : '';
  }
  set Status(status) {
    this.data.minerInfo.status = status;
  }
  get Status() {
    return this.data.minerInfo.status;
  }

  get Name(){
    return this.data.product_name || '';
  }
  get Type(){
    return this.data.product_type || '';
  }

  balance = async(account,wallet)=>{
    return (!_.isEmpty(account) && !_.isEmpty(wallet) && await accountService.getBalance(account, wallet)) || 0;
  };

  get ProductId(){
    return this.data.product_id ?? '';
  }

  get qrCodeDeviceId(){
    return this.data.minerInfo?.qrCodeDeviceId ?? '';
  }

  get PaymentAddress() {
    return this.data.minerInfo.account?.PaymentAddress || this.data.minerInfo.PaymentAddress;
  }

  get PaymentAddressFromServer(){
    return this.data.minerInfo?.PaymentAddress ?? '';
  }

  get CommissionFromServer(){
    return this.data.minerInfo?.Commission ?? 1;
  }

  get IsPNode() {
    return this.Type === DEVICES.MINER_TYPE;
  }

  get IsVNode() {
    return this.Type === DEVICES.VIRTUAL_TYPE;
  }

  get StakerAddress() {
    return this.data.minerInfo.StakerAddress;
  }

  set StakerAddress(stakerAddress) {
    this.data.minerInfo.StakerAddress = stakerAddress;
  }

  get IsLinked() {
    return !!this.data.linked;
  }

  toJSON(){
    return this.data;
  }
  static getInstance = (data=template):Device =>{
    return new Device(data);
  }

}
