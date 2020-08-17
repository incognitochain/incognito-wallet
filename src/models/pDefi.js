import formatUtil, { LONG_DATE_TIME_FORMAT } from '@utils/format';
import moment from 'moment';
import { MAX_DEX_FEE, MAX_FEE_PER_TX } from '@components/EstimateFee/EstimateFee.utils';
import BigNumber from 'bignumber.js';

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
    this.buyAmount = json.MinimumAmount;
    this.tradingFee = json.TradingFee;
    this.networkFee = json.NetworkFee;
    this.networkFeeTokenId = json.NetworkFeeTokenID;
    this.account = accounts.find(item => item.PaymentAddress === json.ReceiverAddress)?.accountName;
    this.createdAt = moment(json.CreatedAt).format(LONG_DATE_TIME_FORMAT);
    this.type = 'Trade';
    this.status = [
      'Pending',
      'Unsuccessful',
      'Successful',
    ][json.Status];

    let buyToken = allTokens.find(token => token.id === this.buyTokenId || token.address === this.buyTokenId);
    const sellToken = allTokens.find(token => token.id === this.sellTokenId || token.address === this.sellTokenId);
    const networkFeeToken = allTokens.find(token => token.id === this.networkFeeTokenId);

    if (buyToken?.address && sellToken?.address) {
      this.exchange = 'Kyber';
      // if (this.networkFee > DEFI_TRADING_FEE) {
      //   this.tradingFee = DEFI_TRADING_FEE;
      // } else if (this.networkFee > 4e8) {
      //   this.tradingFee = 4e8;
      // } else {
      //   this.tradingFee = 1e7;
      // }
      this.tradingFee = (this.networkFee - MAX_DEX_FEE) + MAX_FEE_PER_TX;
      this.networkFee = this.networkFee - this.tradingFee;

      const originalSellAmount = BigNumber(this.sellAmount)
        .dividedBy(BigNumber(10).pow(sellToken.pDecimals));
      const originalPrice = BigNumber(this.buyAmount)
        .dividedBy(BigNumber(10).pow(18));
      this.buyAmount = BigNumber(originalPrice)
        .multipliedBy(originalSellAmount)
        .multipliedBy(BigNumber(10).pow(buyToken.pDecimals))
        .toFixed(0);

      // this.buyAmount = (this.buyAmount / sellDecimals) * (this.sellAmount / sellPDecimals) * buyDecimals;
      // this.buyAmount = this.buyAmount / Math.pow(10, buyToken.decimals - buyToken.pDecimals);
      // this.buyAmount = Math.floor(this.buyAmount * this.sellAmount / Math.pow(10, sellToken.pDecimals));
    } else {
      this.exchange = 'Incognito';
    }

    if (buyToken) {
      this.buyTokenSymbol = buyToken.symbol;
      this.buyAmount = formatUtil.amountFull(this.buyAmount, buyToken.pDecimals);
    }

    if (sellToken) {
      this.sellTokenSymbol = sellToken.symbol;
      this.sellAmount = formatUtil.amountFull(this.sellAmount, sellToken.pDecimals);
    }

    if (networkFeeToken) {
      this.networkFeeTokenSymbol = networkFeeToken.symbol;
      this.networkFee = Math.round(this.networkFee / 3 * 4);
      this.networkFee = formatUtil.amountFull(this.networkFee, networkFeeToken.pDecimals);
      this.tradingFee = formatUtil.amountFull(this.tradingFee, networkFeeToken.pDecimals);
    }

    this.description = `${this.sellAmount} ${this.sellTokenSymbol} to ${this.buyAmount} ${this.buyTokenSymbol}`;
  }
}
