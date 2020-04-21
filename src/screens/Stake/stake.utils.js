import {CONSTANT_COMMONS} from '@src/constants';
import {ExHandler} from '@src/services/exception';
import _ from 'lodash';
import convert from '@src/utils/convert';

export const MAX_DIGITS_BALANCE_PSTAKE = 9;
export const TIMEOUT_CAL_REALTIME_BALANCE_PSTAKE = 70;
export const DEFAULT_REWARD_RATE = 57;

export const STAKE = {
  MAIN_ACCOUNT: 'pStake',
};

export const isStakeAccount = account => {
  if (!account) {
    return false;
  }
  return (
    account?.AccountName === STAKE.MAIN_ACCOUNT ||
    account?.name === STAKE.MAIN_ACCOUNT
  );
};

export const mappingData = (dataMasterAddress, dataStakerInfo) => {
  const {pDecimals, symbol} = CONSTANT_COMMONS.PRV;
  const balance = dataStakerInfo?.Balance || 0;
  const minToStake = dataMasterAddress?.MinToStake || 0;
  const balanceToHumanAmount = _.floor(convert.toHumanAmount(balance, 9));
  const minToStakeToHunmanAmount = _.floor(
    convert.toHumanAmount(minToStake, 9),
  );
  const shouldCalInterestRate =
    balanceToHumanAmount >= minToStakeToHunmanAmount;
  const rewardBalance = dataStakerInfo?.RewardBalance || 0;
  const totalBalance = balance + rewardBalance;
  const staked = balance !== 0;
  return {
    minToStake: minToStake,
    minToWithdraw: 1,
    currentRewardRate: staked
      ? dataStakerInfo?.RewardRate
      : dataMasterAddress?.CurrentRewardRate || DEFAULT_REWARD_RATE,
    stakingMasterAddress: dataMasterAddress?.StakingMasterAddress || '',
    balance,
    rewardDate: dataStakerInfo?.RewardDate || '',
    pDecimals,
    symbol,
    maxToStake: 0,
    rewardDateToMilSec: new Date(dataStakerInfo?.RewardDate).getTime(),
    balanceToHumanAmount,
    minToStakeToHunmanAmount,
    shouldCalInterestRate,
    rewardBalance,
    totalBalance,
    staked,
  };
};

export const calInterestRate = ({
  nowToMilSec,
  balance = 0,
  rate = 50,
  rewardDateToMilSec,
}) => {
  try {
    const duration = nowToMilSec - rewardDateToMilSec;
    if (duration < 0) {
      return 0;
    }
    const interestRate =
      (balance * (rate / 100) * duration) / (365 * 24 * 60 * 60 * 1000);
    if (!isNaN(Number(interestRate))) {
      return interestRate;
    }
    return 0;
  } catch (error) {
    new ExHandler(error).showErrorToast();
    return 0;
  }
};
