import formatUtil from '@utils/format';
import { MESSAGES } from '@screens/Uniswap/constants';
import {PRV} from '@services/wallet/tokenService';
import { v4 } from 'uuid';

function parseHistory(history, historyObject) {
  Object.keys(historyObject).forEach(key => history[key] = historyObject[key]);
  history.updatedAt = history.updatedAt || history.lockTime || 0;
  return history;
}

export class TradeHistory {
  constructor(data) {
    if (!data) {
      return;
    }

    const {
      id,
      inputToken,
      outputToken,
      inputValue,
      outputValue,
    } = data;

    this.id = v4();
    this.dbId = id;
    this.lockTime = Math.floor(new Date().getTime() / 1000);
    this.inputToken = inputToken.symbol;
    this.inputTokenId = inputToken.id;
    this.inputValue = formatUtil.amountFull(inputValue, inputToken.pDecimals);
    this.outputToken = outputToken.symbol;
    this.outputTokenId = outputToken.id;
    this.outputValue = formatUtil.amountFull(outputValue, outputToken.pDecimals);
    this.type = MESSAGES.TRADE;
    this.updatedAt = Math.floor(new Date().getTime() / 1000);
  }

  static load(historyObject) {
    const history = new TradeHistory();
    return parseHistory(history, historyObject);
  }
}

export class WithdrawHistory {
  constructor(res, token, amount, networkFee, networkFeeUnit, account) {
    if (!res) {
      return;
    }
    this.id = v4();
    this.txId = res.txId;
    this.lockTime = res.lockTime;
    this.txId1 = res.txId;
    this.lockTime1 = res.lockTime;
    this.tokenSymbol = token.symbol;
    this.tokenId = token.id;
    this.tokenName = token.name;
    this.amount = amount;
    this.pDecimals = token.pDecimals || 0;
    this.type = MESSAGES.WITHDRAW;
    this.networkFee = networkFee;
    this.networkFeeDecimals = networkFeeUnit === token.symbol ? token.pDecimals : PRV.pDecimals;
    this.networkFeeUnit = networkFeeUnit;
    this.account = account.AccountName;
    this.paymentAddress = account.PaymentAddress;
    this.checking = false;
    this.updatedAt = Math.floor(new Date().getTime() / 1000);

    WithdrawHistory.currentWithdraw = this;
  }

  updateTx2(res) {
    this.txId2 = res.txId;
    this.lockTime2 = res.lockTime;
    this.checking = false;
    this.status = undefined;
    this.lockTime = res.lockTime;
    this.updatedAt = Math.floor(new Date().getTime() / 1000);
  }

  static currentWithdraw = null;
  static withdrawing = false;

  static load(historyObject) {
    const history = new WithdrawHistory();
    return parseHistory(history, historyObject);
  }
}

export class DepositHistory {
  constructor(data) {
    if (!data) {
      return;
    }

    const {
      res,
      token,
      amount,
      networkFee,
      networkFeeUnit,
      account,
    } = data;
    this.id = v4();
    this.txId = res?.txId;
    this.lockTime = res?.lockTime || Math.floor(new Date().getTime() / 1000);
    this.tokenSymbol = token.symbol;
    this.tokenId = token.id;
    this.pDecimals = token.pDecimals;
    this.decimals = token.decimals;
    this.amount = amount;
    this.type = MESSAGES.DEPOSIT;
    this.networkFee = networkFee;
    this.networkFeeDecimals = networkFeeUnit === token.symbol ? token.pDecimals : PRV.pDecimals;
    this.networkFeeUnit = networkFeeUnit;
    this.updatedAt = Math.floor(new Date().getTime() / 1000);
    this.account = account.AccountName;
  }

  static currentDeposit = null;

  updateBurnTx(burnTx) {
    this.burnTxId = burnTx.txId;
  }

  updateRecordId(id) {
    this.dbId = id;
  }

  static load(historyObject) {
    const history = new DepositHistory();
    return parseHistory(history, historyObject);
  }
}

export class WithdrawSCHistory {
  constructor(data) {
    if (!data) {
      return;
    }

    const {
      id,
      token,
      value,
    } = data;

    this.id = v4();
    this.dbId = id;
    this.lockTime = Math.floor(new Date().getTime() / 1000);
    this.token = token.symbol;
    this.tokenId = token.id;
    this.value = formatUtil.amountFull(value, token.pDecimals);
    this.type = MESSAGES.WITHDRAW_SC;
    this.updatedAt = Math.floor(new Date().getTime() / 1000);
  }

  static load(historyObject) {
    const history = new TradeHistory();
    return parseHistory(history, historyObject);
  }
}
