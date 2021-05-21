import formatUtil from '@utils/format';
import { HISTORY_STATUS } from '@src/constants/trading';
import { isEmpty } from 'lodash';
import { PRV } from '@src/constants/common';

// const TYPES = ['Incognito', 'Incognito', 'Kyber', '0x', 'Uniswap'];

const TRANSFER_STATUS = {
  PROCESSING: 'processing',
  PENDING: 'pending',
  SUCCESSFUL: 'successful',
  UNSUCCESSFUL: 'unsuccessful',
  INTERRUPTED: 'tap to try again',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PART_REFUNFED: 'part-refunded',
  REJECTED: 'unsuccessful',
  CANCELED: 'canceled',
};

export class RewardModel {
  constructor(data = {}) {
    this.walletAddress = data.WalletAddress;
    this.amount1 = data.Amount1;
    this.amount2 = data.Amount2;
    this.total = data.TotalAmount;
    this.tokenId1 = data.Token1ID;
    this.tokenId2 = data.Token2ID;
    this.pair = data.Pair;
    this.beaconHeight = data.BeaconHeight;
    this.beaconTime = data.BeaconTimeStamp;
    this.interestRate1 = data.InterestRate1;
    this.interestRate2 = data.InterestRate2;
  }
}

export class DepositResponse {
  constructor(data = {}) {
    this.walletAddress = data.WalletAddress;
    this.depositId = data.DepositID;
  }
}

export class PDexTradeHistoryModel {
  constructor({
    history,
  }) {
    if (!history) return;

    this.id = history.requestTx;
    this.requestTx = history.requestTx;
    this.responseTx = history.responseTx;

    this.buyTokenId = history.buyTokenId;
    this.buyToken = history.buyToken;
    this.buyAmount = history.buyAmount;
    if (this.buyToken) {
      this.buyTokenSymbol = this.buyToken?.symbol || '';
      this.buyAmount = formatUtil.amountFull(
        this.buyAmount,
        this.buyToken.pDecimals,
      );
    }

    this.sellTokenId = history.sellTokenId;
    this.sellToken = history.sellToken;
    this.sellAmount = history.sellAmount;
    if (this.sellToken) {
      this.sellTokenSymbol = this.sellToken?.symbol || '';
      this.sellAmount = formatUtil.amountFull(
        this.sellAmount,
        this.sellToken.pDecimals,
      );
    }

    // fee
    this.networkFee = history.networkFee;
    if (this.networkFee) {
      this.networkFee = formatUtil.amountFull(
        this.networkFee,
        PRV.pDecimals,
      );
    }

    this.account = history.accountName;
    this.type = 'Trade';
    this.exchange = 'Incognito';
    // this.exchange = TYPES[history.Type] || 'Incognito';
    this.description = `${this.sellAmount} ${this.sellTokenSymbol} to ${this.buyAmount} ${this.buyTokenSymbol}`;

    // status
    switch (history.status) {
    case HISTORY_STATUS.REFUND:
    case HISTORY_STATUS.REJECTED:
      this.status = TRANSFER_STATUS.FAILED;
      break;
    case HISTORY_STATUS.ACCEPTED:
      this.status = TRANSFER_STATUS.SUCCESSFUL;
      break;
    default:
      this.status = TRANSFER_STATUS.PENDING;
    }
  }
}

export class PDexHistoryPureModel {
  constructor({ history, accountName }) {
    this.sellAmount = history?.sell;
    this.requestTx = history?.requesttx;
    if (!isEmpty(history?.respondtx)) {
      this.responseTx = history?.respondtx[0];
    }
    this.status = history?.status;
    this.buyTokenId = history?.buytoken;
    this.sellTokenId = history?.selltoken;
    this.buyAmount = 0;
    if (this.buyTokenId && !isEmpty(history?.receive) && history?.receive[this.buyTokenId]) {
      this.buyAmount = history?.receive[this.buyTokenId];
    }
    this.networkFee = history?.fee;
    this.accountName = accountName;
  }
}
