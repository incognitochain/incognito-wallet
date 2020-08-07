import React from 'react';
import formatUtil from '@utils/format';
import { MESSAGES } from '@screens/Dex/constants';
import {PRV} from '@services/wallet/tokenService';

function parseHistory(history, historyObject) {
  Object.keys(historyObject).forEach(key => history[key] = historyObject[key]);
  history.updatedAt = history.updatedAt || history.lockTime || 0;
  return history;
}

export class TradeHistory {
  constructor(res, inputToken, outputToken, inputValue, outputValue, networkFee, networkFeeUnit, tradingFee, stopPrice) {
    if (!res) {
      return;
    }

    this.txId = res.txId;
    this.lockTime = res.lockTime;
    this.inputToken = inputToken.symbol;
    this.inputTokenId = inputToken.id;
    this.inputValue = formatUtil.amountFull(inputValue, inputToken.pDecimals);
    this.outputToken = outputToken.symbol;
    this.outputTokenId = outputToken.id;
    this.outputValue = formatUtil.amountFull(outputValue, outputToken.pDecimals);
    this.type = MESSAGES.TRADE;
    this.networkFee = formatUtil.amountFull(networkFee, networkFeeUnit === inputToken.symbol ? inputToken.pDecimals : PRV.pDecimals);
    this.networkFeeUnit = networkFeeUnit;
    this.tradingFee = formatUtil.amountFull(tradingFee, inputToken.pDecimals);
    this.stopPrice = formatUtil.amountFull(stopPrice, outputToken.pDecimals);
    this.updatedAt = Math.floor(new Date().getTime() / 1000);
  }

  get shortDescription() {
    return '';
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
    this.account = account.AccountName || account.name;
    this.paymentAddress = account.PaymentAddress;
    this.checking = false;
    this.updatedAt = Math.floor(new Date().getTime() / 1000);

    WithdrawHistory.currentWithdraw = this;
  }

  get shortDescription() {
    return `${formatUtil.amountFull(this.amount, this.pDecimals)} ${this.tokenSymbol} to ${this.account}`;
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
  constructor(res, token, amount, networkFee, networkFeeUnit, account) {
    if (!res) {
      return;
    }

    this.txId = res.txId;
    this.lockTime = res.lockTime;
    this.tokenSymbol = token.symbol;
    this.tokenId = token.id;
    this.amount = formatUtil.amountFull(amount, token.pDecimals);
    this.type = MESSAGES.DEPOSIT;
    this.networkFee = formatUtil.amountFull(networkFee, networkFeeUnit === token.symbol ? token.pDecimals : PRV.pDecimals);
    this.networkFeeUnit = networkFeeUnit;
    this.account = account.name || account.AccountName;
    this.updatedAt = Math.floor(new Date().getTime() / 1000);
  }

  get shortDescription() {
    return `${this.amount} ${this.tokenSymbol} from ${this.account}`;
  }

  static load(historyObject) {
    const history = new DepositHistory();
    return parseHistory(history, historyObject);
  }
}

export class AddLiquidityHistory {
  constructor(res, pairId, tokenParams1, tokenParams2, inputFee, outputFee, account) {
    if (!res) {
      return;
    }
    this.pairId = pairId;
    this.txId = res.txId;
    this.lockTime = res.lockTime;
    this.txId1 = res.txId;
    this.lockTime1 = res.lockTime;

    this.token1 = tokenParams1;
    this.token2 = tokenParams2;

    this.type = MESSAGES.ADD_LIQUIDITY;
    this.inputFee = inputFee;
    this.outputFee = outputFee;
    this.account = account.AccountName || account.name;
    this.paymentAddress = account.PaymentAddress;
    this.updatedAt = Math.floor(new Date().getTime() / 1000);
  }

  get shortDescription() {
    return `${formatUtil.amountFull(this.token1.TokenAmount || 0, this.token1.PDecimals)} ${this.token1.TokenSymbol} ` +
    `${formatUtil.amountFull(this.token2.TokenAmount || 0, this.token2.PDecimals)} ${this.token2.TokenSymbol}`;
  }

  updateTx2(res) {
    this.txId2 = res.txId;
    this.cancelTx = undefined;
    this.lockTime2 = res.lockTime;
    this.status = undefined;
    this.lockTime = res.lockTime;
    this.updatedAt = Math.floor(new Date().getTime() / 1000);
  }

  cancel(res) {
    this.cancelTx = res.txId;
    this.cancelLockTime = res.lockTime;
    this.status = undefined;
    this.lockTime = res.lockTime;
    this.updatedAt = Math.floor(new Date().getTime() / 1000);
  }

  static load(historyObject) {
    const history = new AddLiquidityHistory();
    const parsedHistory = parseHistory(history, historyObject);

    parsedHistory.token1.ReturnedAmount = parsedHistory.token1.ReturnedAmount || 0;
    parsedHistory.token2.ReturnedAmount = parsedHistory.token2.ReturnedAmount || 0;
    parsedHistory.token1.ContributedAmount = parsedHistory.token1.TokenAmount - parsedHistory.token1.ReturnedAmount;
    parsedHistory.token2.ContributedAmount = parsedHistory.token2.TokenAmount - parsedHistory.token2.ReturnedAmount;

    return parsedHistory;
  }

  static currentHistory = null;
}

export class RemoveLiquidityHistory {
  constructor(res, shareValue, tokenParams1, tokenParams2, fee, account) {
    if (!res) {
      return;
    }
    this.txId = res.txId;
    this.lockTime = res.lockTime;
    this.token1 = tokenParams1;
    this.token2 = tokenParams2;
    this.shareValue = shareValue;
    this.type = MESSAGES.REMOVE_LIQUIDITY;
    this.fee = fee;
    this.account = account.AccountName || account.name;
    this.paymentAddress = account.PaymentAddress;
    this.updatedAt = Math.floor(new Date().getTime() / 1000);
  }

  get shortDescription() {
    return `${this.token1.TokenAmount} ${this.token1.TokenSymbol} ` + `${this.token2.TokenAmount} ${this.token2.TokenSymbol}`;
  }

  static load(historyObject) {
    const history = new RemoveLiquidityHistory();
    return parseHistory(history, historyObject);
  }
}

