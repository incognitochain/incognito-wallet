import pappSdk from 'papp-sdk';
import CONSTANTSDK from './constant';


const { resetStore } = pappSdk;
const { DATA_NAMES, SDK_MODULE } = CONSTANTSDK;

class SDK {
  constructor(webViewInstance) {
    if (!webViewInstance) {
      throw new Error('webViewInstance is required!');
    }

    this.webViewInstance = webViewInstance;
  }

  sendScript(script) {
    if (this.webViewInstance?.webViewRef?.current) {
      this.webViewInstance.injectJavaScript(`
        ${script}
        true;
      `);
      console.log('sendScript', script);
    }
  }

  resetStore() {
    resetStore();
  }

  sendUpdateTokenInfo({ id, balance, symbol, name, nanoBalance, pDecimals = 0 }) {
    if (typeof id !== 'string') throw new Error('invalid token id');
    if (typeof balance !== 'number' || balance < 0) throw new Error('invalid token balance');
    if (!Number.isInteger(nanoBalance) || nanoBalance < 0) throw new Error('invalid token nanoBalance');
    if (!Number.isInteger(pDecimals) || pDecimals < 0) throw new Error('invalid token pDecimals');
    if (!symbol || typeof symbol !== 'string') throw new Error('invalid token symbol');
    if (!name || typeof name !== 'string') throw new Error('invalid token name');

    const script = `${SDK_MODULE}._setData("${DATA_NAMES.TOKEN_INFO}", ${JSON.stringify({ id, balance, symbol, name, nanoBalance, pDecimals })});`;
    this.sendScript(script);
  }
  
  sendUpdatePaymentAddress(address) {
    if (!address || typeof address !== 'string') throw new Error('invalid payment address');
    const script = `${SDK_MODULE}._setData("${DATA_NAMES.PAYMENT_ADDRESS}", "${address}");`;
    this.sendScript(script);
  }
  
  sendUpdateTxPendingResult({ pendingTxId, error, data }) {
    if (!pendingTxId) throw new Error('invalid pendingTxId');
    if (!error && !data) throw new Error('must be have error or data');
    const script = `${SDK_MODULE}._setData("${DATA_NAMES.TX_PENDING_RESULT}", ${JSON.stringify({ pendingTxId, error, data })});`;
    this.sendScript(script);
  }

  sendListToken(data) {
    if (!(data instanceof Array)) throw new Error('token list must be an array');
    const script = `${SDK_MODULE}._setData("${DATA_NAMES.LIST_TOKEN}", ${JSON.stringify(data)});`;
    this.sendScript(script);
  }

  /**
   * 
   * @param {object} data 
   * userId
   */
  sendExtraInfo(data) {
    if (!(data instanceof Object)) throw new Error('extra data must be an object');
    const script = `${SDK_MODULE}._setData("${DATA_NAMES.EXTRA_DATA}", ${JSON.stringify(data)});`;
    this.sendScript(script);
  }
}

export default SDK;