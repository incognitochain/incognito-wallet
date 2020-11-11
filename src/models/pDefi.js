import formatUtil, { LONG_DATE_TIME_FORMAT } from '@utils/format';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { isNaN } from 'lodash';

const TYPES = ['Incognito', 'Incognito', 'Kyber', '0x', 'Uniswap'];

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
  constructor(json, allTokens, accounts) {
    if (!json) {
      return;
    }
    this.id = json.DepositID;
    this.sellTokenId = json.TokenID;
    this.sellAmount = json.Amount;
    this.buyTokenId = json.BuyTokenID;
    this.buyAmount = BigNumber(json.MinimumAmount);
    this.tradingFee = json.TradingFee;
    this.networkFee = json.NetworkFee;
    this.networkFeeTokenId = json.NetworkFeeTokenID;
    this.account = accounts.find(
      (item) => item.PaymentAddress === json.ReceiverAddress,
    )?.accountName;
    this.createdAt = moment(json.CreatedAt).format(LONG_DATE_TIME_FORMAT);
    this.type = 'Trade';
    this.status = ['Pending', 'Unsuccessful', 'Successful'][json.Status];
    this.exchange = TYPES[json.Type] || 'Incognito';
    let buyToken = allTokens.find(
      (token) =>
        token.id === this.buyTokenId ||
        (token.address && token.address === this.buyTokenId),
    );
    const sellToken = allTokens.find(
      (token) =>
        token.id === this.sellTokenId ||
        (token.address && token.address === this.sellTokenId),
    );
    const networkFeeToken = allTokens.find(
      (token) => token.id === this.networkFeeTokenId,
    );
    this.buyTokenSymbol = buyToken?.symbol || '';
    if (
      this.exchange !== 'Incognito' &&
      buyToken?.address === json.BuyTokenID
    ) {
      this.networkFee = this.networkFee - this.tradingFee;
    }
    if (buyToken && !this.buyAmount?.isNaN()) {
      this.buyAmount = formatUtil.amountFull(
        this.buyAmount,
        buyToken.pDecimals,
      );
    } else {
      this.buyAmount = '';
    }
    if (sellToken) {
      this.sellTokenSymbol = sellToken.symbol;
      this.sellAmount = formatUtil.amountFull(
        this.sellAmount,
        sellToken.pDecimals,
      );
    }
    if (networkFeeToken) {
      this.networkFeeTokenSymbol = networkFeeToken.symbol;
      this.networkFee = Math.round((this.networkFee / 3) * 4);
      this.networkFee = formatUtil.amountFull(
        this.networkFee,
        networkFeeToken.pDecimals,
      );
      this.tradingFee = formatUtil.amountFull(
        this.tradingFee,
        networkFeeToken.pDecimals,
      );
    }
    this.description = `${this.sellAmount} ${this.sellTokenSymbol} to ${this.buyAmount} ${this.buyTokenSymbol}`;
  }
}
