import React from 'react';
import {View, Text, Platform} from 'react-native';
import {ArrowUpIcon} from '@src/components/Icons';
import format from '@src/utils/format';
import {useSelector} from 'react-redux';
import { FONT } from '@src/styles';
import {
  MAX_DIGITS_BALANCE_PSTAKE,
  TIMEOUT_CAL_REALTIME_BALANCE_PSTAKE,
  calTotalBalance,
} from './stake.utils';
import {stakeDataSelector} from './stake.selector';
import {styled} from './stake.styled';

const StakeBalance = () => {
  const initialState = {
    balanceCurrent: 0,
    duration: 1,
    nextNodeTime: null,
  };
  const [state, setState] = React.useState(initialState);
  const {balanceCurrent, nextNodeTime} = state;
  const {
    balance,
    symbol,
    staked,
    currentRewardRate,
    rewardDateToMilSec,
    pDecimals,
    nodeTime,
    shouldCalInterestRate,
    totalBalance,
  } = useSelector(stakeDataSelector);
  const handleReCalBalance = async () => {
    try {
      if (!nextNodeTime) {
        return;
      }
      const balanceCurrent = calTotalBalance({
        nowToMilSec: nextNodeTime,
        balance,
        rate: currentRewardRate,
        rewardDateToMilSec,
      });
      // Check condition, to do improve later.
      // For reducing number in balance (overlay num)
      let maxDigit = 2;
      if (balanceCurrent <= 1000000000000000) {
        maxDigit = 4;
      }
      if (balanceCurrent <= 100000000000000) {
        maxDigit = 5;
      }
      if (balanceCurrent <= 10000000000000) {
        maxDigit = 6;
      }
      if (balanceCurrent <= 1000000000000) {
        maxDigit = 7;
      }
      if (balanceCurrent <= 100000000000) {  
        maxDigit= 8;
      } 
      if (balanceCurrent <= 10000000000) {
        maxDigit = 9;
      } 
      const totalBalanceCurrent = format.balance(
        balanceCurrent,
        pDecimals,
        maxDigit,
      );
      const nextNodeTimeCurrent =
        nextNodeTime + TIMEOUT_CAL_REALTIME_BALANCE_PSTAKE;
      await setState({
        ...state,
        balanceCurrent: totalBalanceCurrent,
        nextNodeTime: nextNodeTimeCurrent,
      });
    } catch (error) {
      await setState({
        ...state,
        balanceCurrent: totalBalance,
      });
    }
  };
  React.useEffect(() => {
    if (balance !== 0 && shouldCalInterestRate) {
      const intervalId = setInterval(
        handleReCalBalance,
        TIMEOUT_CAL_REALTIME_BALANCE_PSTAKE,
      );
      return () => {
        clearInterval(intervalId);
      };
    } else {
      setState({
        ...state,
        balanceCurrent: format.balance(
          totalBalance,
          pDecimals,
          MAX_DIGITS_BALANCE_PSTAKE,
        ),
      });
    }
  }, [balance, nextNodeTime]);
  React.useEffect(() => {
    setState({
      ...state,
      nextNodeTime: nodeTime,
    });
  }, [nodeTime]);
  return (
    <View style={styled.balanceContainer}>
      <Text
        style={[styled.balance, {fontVariant: ['tabular-nums']}, Platform.OS === 'ios' ? {fontFamily: FONT.NAME.regular} : {}]} // Broken width font
        numberOfLines={1}
        allowFontScaling
        includeFontPadding={false} // For android
        adjustsFontSizeToFit
      >
        {balanceCurrent === 0 ? '0.00' : balanceCurrent}
      </Text>
      <Text style={styled.symbol}>{symbol}</Text>
      {staked && (
        <View style={styled.arrow}>
          <ArrowUpIcon />
        </View>
      )}
    </View>
  );
};

StakeBalance.propTypes = {};

export default StakeBalance;
