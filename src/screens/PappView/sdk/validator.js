const { AccountWallet, KeyWallet } = require('incognito-chain-web-js/build/wallet');

function isPaymentAddress(paymentAddrStr) {
  try {
    const key = KeyWallet.base58CheckDeserialize(paymentAddrStr);
    const paymentAddressObj = key.KeySet.PaymentAddress || {};
    if (paymentAddressObj.Pk.length === 32 && paymentAddressObj.Tk.length === 32) {
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
}


class Validator {
  constructor(label, value) {
    if (!label && typeof label !== 'string') throw new Error('Missing or invalid label');

    this.value = value;
    this.label = label;
    this.isRequired = false;
  }

  _throwError(message) {
    throw new Error(`Validating "${this.label}" failed: ${message}. Found ${this.value} (type of ${typeof this.value})`);  
  }

  _isDefined() {
    return this.value !== null && this.value !== undefined;
  }

  _onCondition(condition, message) {
    if (((!this.isRequired && this._isDefined()) || this.isRequired) && !condition()) {
      this._throwError(message);
    }

    return this;
  }

  required(message = 'Required') {
    this.isRequired = true;
    return this._onCondition(() => this._isDefined(), message);
  }

  string(message = 'Must be string') {
    return this._onCondition(() => typeof this.value === 'string', message);
  }

  array(message = 'Must be an array') {
    return this._onCondition(() => this.value instanceof Array, message);
  }

  boolean(message = 'Must be boolean') {
    return this._onCondition(() => typeof this.value === 'boolean', message);
  }
  
  number(message = 'Must be number') {
    return this._onCondition(() => Number.isFinite(this.value) && this.value > 0, message);
  }
  
  intergerNumber(message = 'Must be an interger number') {
    return this._onCondition(() => Number.isInteger(this.value) && this.value > 0, message);
  }
  
  paymentAddress(message = 'Invalid payment address') {
    return this._onCondition(() => isPaymentAddress(this.value), message);
  }

  privateKey(message = 'Invalid private key') {
    return this._onCondition(() => this.string(), message);
  }

  /**
   * 
   * Check "PrivateKey" is existed is enough for now
   */
  accountWallet(message = 'Invalid account wallet') {
    return this._onCondition(() => this.value instanceof AccountWallet, message);
  }
  
  /**
   * 
   * @param {number} value amount in nano (must be an integer number)
   * @param {string} message error message
   */
  amount(message = 'Invalid amount') {
    return this._onCondition(() => this.intergerNumber(), message);
  }

  receivers(message = 'Invalid receivers, must be array of receiver [receiverAddress, receiverAmount] (max 30 receivers)') {
    return this._onCondition(() => {
      if (!(this.value instanceof Array) || this.value.length === 0 || this.length > 30) return false;
      return this.value.every(receiver => {
        new Validator('receiver', receiver).required().array();

        const [paymentAddress, amount] = receiver;

        new Validator('receiver paymentAddress', paymentAddress).required().paymentAddress();
        new Validator('receiver amount', amount).required().amount();
        return true;
      });
    }, message);
  }
}

module.exports = Validator;