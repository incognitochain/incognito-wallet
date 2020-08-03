import formatUtil, { LONG_DATE_TIME_FORMAT } from '@utils/format';
import { COINS } from '@src/constants';
import moment from 'moment';

class CoinConfigModel {
  constructor(data = {}, masterAddress) {
    if (!data) {
      return null;
    }

    const token = data.Token;

    this.id = token.TokenID;
    this.name = token.Name;
    this.symbol = token.Symbol;
    this.pDecimals = token.PDecimals;
    this.min = data.Min;
    this.max = data.Max;
    this.apy = data.APY.toFixed(2);
    this.masterAddress = masterAddress;

    if (this.id === COINS.PRV_ID) {
      this.name = COINS.PRV.name;
      this.symbol = COINS.PRV.symbol;
      this.pDecimals = COINS.PRV.pDecimals;
    }

    this.displayInterest = `${formatUtil.toFixed(this.apy, 2)}%  APY`;
  }
}

export class UserCoinPoolModel {
  constructor(data = {}, coins) {
    if (!data) {
      return null;
    }

    this.id = data.TokenID;
    this.symbol = data.TokenSymbol;
    this.balance = data.Balance;
    this.rewardBalance = data.RewardBalance;
    this.pendingBalance = data.PendingBalance;
    this.unstakePendingBalance = data.UnstakePendingBalance;
    this.withdrawPendingBalance = data.WithdrawPendingBalance;

    // if (this.id === COINS.PRV_ID) {
    //   this.name = COINS.PRV.name;
    //   this.symbol = COINS.PRV.symbol;
    //   this.pDecimals = COINS.PRV.pDecimals;
    // }

    this.coin = coins.find(coin => coin.id === this.id);

    if (this.coin) {
      this.pDecimals = this.coin.pDecimals;
      this.symbol = this.coin.symbol;
    }

    this.displayReward = formatUtil.amountFull(this.rewardBalance, COINS.PRV.pDecimals, true);
    this.displayBalance = formatUtil.amountFull(this.balance, this.pDecimals, true);
    this.displayFullBalance = formatUtil.amountFull(this.balance, this.pDecimals, false);
    this.displayPendingBalance = formatUtil.amountFull(this.pendingBalance, this.pDecimals, true);
    this.displayUnstakeBalance = formatUtil.amountFull(this.unstakePendingBalance, this.pDecimals, true);
    this.displayWithdrawReward = formatUtil.amountFull(this.withdrawPendingBalance, COINS.PRV.pDecimals, true);
  }
}

export class PoolConfigModel {
  constructor(data = {}) {
    if (!data) {
      return null;
    }

    this.masterAddress = data.MasterAddress;
    this.coins = data.Configs.map(item => new CoinConfigModel(item, this.masterAddress));
  }
}

export class PoolHistory {
  constructor(data = {}, account, coins) {
    if (!data) {
      return null;
    }

    this.id = data.ID;
    this.time = moment(data.CreatedAt).format(LONG_DATE_TIME_FORMAT);
    this.amount = data.Amount;
    this.status = data.Status;
    this.coinId = data.TokenID;
    this.tx = data.IncognitoTx;
    this.paymentAddress = data.PStakeAddress;

    this.account = account?.name || account?.AccountName;
    this.coin = coins.find(coin => coin.id === this.coinId);

    if (this.coin) {
      this.description = `${formatUtil.amountFull(this.amount, this.coin.pDecimals, true)} ${this.coin.symbol}`;
    }

    this.status = [
      'Pending',
      'Pending',
      'Successful',
      'Unsuccessful',
      'Pending',
    ][data.Status];

    this.type = [
      'None',
      'Provide',
      'Withdraw provision',
      'Auto stake on',
      'Auto stake off',
      'Reward',
      'Withdraw reward',
    ][data.Type];
  }
}
