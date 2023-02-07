/* eslint-disable react/react-in-jsx-scope */
import { isEmpty } from 'lodash';
import convert from '@src/utils/convert';
import format from '@src/utils/format';
import BigNumber from 'bignumber.js';

export const removeAllSpace = (str) => {
  if (isEmpty(str)) return str;
  return str.replace(/\s/g,'');
};

export const standardizedAddress = (address) => {
  if (!address) {
    return '';
  }
  let indexParams = address?.indexOf('?');
  let newAddress = address;
  if (indexParams !== -1) {
    newAddress = address.substring(0, indexParams);
  }
  return removeAllSpace(newAddress);
};

export const amountValidatorForPRV = (data) => {
  const {inputValue, privacyPRVInfo} = data;

  if (!inputValue) return undefined;

  const { prvBalanceOriginal, feePerTx, symbol, decimals } = privacyPRVInfo;

  const valueNumber = convert.toNumber(inputValue, true);
  const inputNumber = convert.toOriginalAmount(valueNumber, decimals);

  const inputValueNumberBN = new BigNumber(inputNumber);
  const prvBalanceOriginalBN = new BigNumber(prvBalanceOriginal);
  // const prvBalanceOriginalBN = new BigNumber(prvBalanceOriginal);

  // Balance <= 0.1 PRV (Because Network Fee 0.1 PRV)
  if (prvBalanceOriginalBN.isLessThanOrEqualTo(0)) {
    return `Your ${symbol} balance is insufficient.`;
  } 

  // Balance <= 0.1 PRV (Because Network Fee 0.1 PRV) => withdraw = 0
  else if (prvBalanceOriginalBN.isLessThanOrEqualTo(feePerTx)) {
    return `Max amount you can withdraw is ${0} ${symbol}`;
  } 
  
  // Input > Balance [OR] Input + NetworkFee > Balance
  else if (inputValueNumberBN.gt(prvBalanceOriginalBN) || inputValueNumberBN.plus(feePerTx).gt(prvBalanceOriginalBN)) {
    const maxValueWithdraw = prvBalanceOriginalBN - feePerTx;
    let maxValueWithdrawNumber = convert.toHumanAmount(
      maxValueWithdraw,
      decimals,
    );
    const maxValueWithdrawText = format.toFixed(
      maxValueWithdrawNumber,
      decimals,
    );
    return `Max amount you can withdraw is ${maxValueWithdrawText} ${symbol}`;
  }

  return undefined;
};