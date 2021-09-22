/* eslint-disable import/no-cycle */
import BigNumber from 'bignumber.js';
import format from '@src/utils/format';
import convertUtil from '@utils/convert';
import isNumber from 'lodash/isNumber';
import isNaN from 'lodash/isNaN';
import SelectedPrivacy from '@src/models/selectedPrivacy';

export const getPairRate = ({ token2, token1Value, token2Value }) => {
  try {
    const rate = new BigNumber(token2Value)
      .dividedBy(new BigNumber(token1Value))
      .toNumber();
    const rateFixed = format.toFixed(rate, token2?.pDecimals || 0);
    if (!rateFixed || rateFixed === '0') {
      return '';
    }
    return rateFixed;
  } catch (error) {
    console.log('getPairRate-error', error);
  }
};

export const getExchangeRate = (token1, token2, token1Value, token2Value) => {
  try {
    const rawRate = new BigNumber(token2Value).dividedBy(token1Value / Math.pow(10, token1.pDecimals || 0)).toNumber();
    return `1 ${token1.symbol} = ${format.toFixed(rawRate, token2.pDecimals)} ${
      token2?.symbol
    }`;
  } catch (error) {
    console.log('getExchangeRate-error', error);
  }
};

export const getPrincipal = (token1, token2, token1Value, token2Value) => {
  const token1Str = `${format.amount(token1Value, token1.pDecimals)} ${
    token1.symbol
  }`;
  const token2Str = `${format.amount(token2Value, token2.pDecimals)} ${
    token2.symbol
  }`;
  return `${token1Str} + ${token2Str}`;
};

export const getShareStr = (share, totalShare) => {
  const percent = format.toFixed(
    new BigNumber(share)
      .dividedBy(totalShare || 1)
      .multipliedBy(100)
      .toString(),
    7,
  );
  return `${share} (${percent}%)`;
};

export const getReward = (token1, token2, token1Value, token2Value) => {
  const token1Str = `${format.amount(token1Value, token1.pDecimals)} ${
    token1.symbol
  }`;
  const token2Str = `${format.amount(token2Value, token2.pDecimals)} ${
    token2.symbol
  }`;
  return `${token1Str} + ${token2Str}`;
};

export const getPoolSize = (
  token1: SelectedPrivacy,
  token2: SelectedPrivacy,
  token1PoolValue = 0,
  token2PoolValue = 0,
) => {
  const formattedToken1Pool = format.amount(
    token1PoolValue,
    token1?.pDecimals,
  );
  const formattedToken2Pool = format.amount(
    token2PoolValue,
    token2?.pDecimals,
  );
  return `${formattedToken1Pool} ${token1?.symbol} + ${formattedToken2Pool} ${token2?.symbol}`;
};

export const parseInputWithText = ({ text, token }) => {
  let number = convertUtil.toNumber(text, true);
  number = convertUtil.toOriginalAmount(
    number,
    token.pDecimals,
    token.pDecimals !== 0,
  );
  return number;
};

export const calculateContributeValue = ({
  inputValue,
  outputToken,
  inputPool,
  outputPool,
}) => {
  if (!inputPool || !outputPool) return;
  if (
    !outputToken ||
    !isNumber(inputValue) ||
    isNaN(inputValue) ||
    !inputValue
  ) {
    return '';
  }
  const number = new BigNumber(inputValue).multipliedBy(outputPool).dividedBy(inputPool).toNumber();
  const amount = convertUtil.toHumanAmount(number, outputToken.pDecimals);
  return format.toFixed(amount, outputToken.pDecimals);
};

export const formatBalance = (token1, token2, token1Value, token2Value) => {
  if (
    !token1 ||
    !token2 ||
    token1Value === undefined ||
    token2Value === undefined
  )
    return '';
  const token1Str = `${format.amount(token1Value, token1.pDecimals)} ${
    token1.symbol
  }`;
  const token2Str = `${format.amount(token2Value, token2.pDecimals)} ${
    token2.symbol
  }`;
  return `${token1Str} + ${token2Str}`;
};
