import formatUtil, { LONG_DATE_TIME_FORMAT } from '@utils/format';
import { COINS } from '@src/constants';
import moment from 'moment';
import {COLORS} from '@src/styles';
import orderBy from 'lodash/orderBy';

class CoinConfigModel {
  constructor(data = {}, masterAddress) {
    if (!data) {
      return null;
    }

    const token = data.Token;

    this.id = token.TokenID;
    this.termID = data.ID;
    this.name = token.Name;
    this.symbol = token.Symbol;
    this.pDecimals = token.PDecimals;
    this.min = data.Min;
    this.max = data.Max;
    this.apy = data.APY.toFixed(2);
    this.masterAddress = masterAddress;
    this.locked = data.Locked;
    this.lockTime = data.LockTime;

    if (this.id === COINS.PRV_ID) {
      this.name = this.locked ? `${COINS.PRV.name} Lock` : COINS.PRV.name;
      this.symbol = COINS.PRV.symbol;
      this.pDecimals = COINS.PRV.pDecimals;
    }

    this.displayInterest = `${formatUtil.toFixed(this.apy, 2)}%  ${this.locked ? 'APR' : 'APY'}`;
    this.displayLockTime = this.locked ? `${this.lockTime} Months` : '';
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
    this.locked = data.Locked;
    this.lockTime = data.LockTime;
    this.stakerTokenBalanceID = data.ID;
    this.unlockDate = data.DaturityDate;
    this.displayUnlockDate = formatUtil.formatDateTime(this.unlockDate, LONG_DATE_TIME_FORMAT);
    this.lockDate = data.CreatedAt;
    this.displayLockDate = formatUtil.formatDateTime(this.lockDate, LONG_DATE_TIME_FORMAT);
    this.active = data.Active;

    // if (this.id === COINS.PRV_ID) {
    //   this.name = COINS.PRV.name;
    //   this.symbol = COINS.PRV.symbol;
    //   this.pDecimals = COINS.PRV.pDecimals;
    // }

    this.coin = coins.find(coin => coin.id === this.id && coin.locked === this.locked && coin.lockTime === this.lockTime);

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
    const coins = (data.Configs.map(item => new CoinConfigModel(item, this.masterAddress)) || []).filter(item => !!item);
    this.coins = orderBy(coins, ['locked'], ['desc']);
  }
}

export class PoolHistory {
  constructor(data = {}, account, coins) {
    if (!data) {
      return null;
    }
    this.id = data.ID;
    this.time = moment(data.CreatedAt).format(LONG_DATE_TIME_FORMAT);
    this.time1 = data.CreatedAt;
    this.amount = data.Amount;
    this.status = data.Status;
    this.coinId = data.TokenID;
    this.tx = data.IncognitoTx;
    this.paymentAddress = data.PStakeAddress;
    this.stakerTokenBalanceID = data.StakerTokenBalanceID;

    this.account = account?.name || account?.AccountName;
    this.coin = coins.find(coin => coin.id === this.coinId);

    if (data.LockData) {
      try {
        const lockData = JSON.parse(data.LockData);
        this.locked = lockData.Locked;
        this.lockTime = lockData.LockTime;
        this.unlockDate = moment(lockData.DaturityDate).format(LONG_DATE_TIME_FORMAT);
      } catch (e) {
        console.log('Ignore err: ', e);
      }
    }

    if (this.coin) {
      this.description = `${formatUtil.amountFull(this.amount, this.coin.pDecimals, true)} ${this.coin.symbol}`;
    }

    this.status = [
      'Pending',
      'Pending',
      'Successful',
      'Unsuccessful',
      'Pending',
      'Checking',
      'Pending',
      'Successful',
    ][data.Status];

    this.statusColor = COLORS.white;
    if (this.status === 'Unsuccessful') {
      this.statusColor = COLORS.red;
    }
    if (this.status === 'Successful') {
      this.statusColor = COLORS.green1;
    }

    this.type = [
      'None',
      'Provide',
      'Withdraw provision',
      'Auto stake on',
      'Auto stake off',
      'Reward',
      'Withdraw reward',
      'None',
      'Migrate',
      '',
      'Provide',
      'Convert unify',
    ][data.Type];

    if (this.locked) {
      this.type += ' lock';
    }
  }
}
