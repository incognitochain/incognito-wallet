import {formValueSelector} from 'redux-form';
import convert from '@utils/convert';
import format from '@utils/format';
import {MESSAGES} from '@screens/Dex/constants';
import BigNumber from 'bignumber.js';
import {formConfigsRemovePool} from '@screens/PDexV3/features/Liquidity/Liquidity.constant';
import uniq from 'lodash/uniq';

const convertAmount = ({ originalNum, pDecimals }) => {
  const humanAmount = convert.toHumanAmount(originalNum, pDecimals);
  return format.toFixed(humanAmount, pDecimals);
};

export const getInputAmount = (
  state,
  isGettingBalance,
  tokens,
  { feeAmount, feeToken }
) => (formName, field) => {
  try {
    const token = tokens[field];
    if (!token || !token.tokenId) {
      return {
        amount: '',
        originalAmount: 0,
        loadingBalance: true,
        error: MESSAGES.NEGATIVE_NUMBER,
      };
    }

    const selector = formValueSelector(formName);

    const inputAmountStr = selector(state, field);
    let amount = convert.toNumber(inputAmountStr, true) || 0;
    const originalInputAmount = convert.toOriginalAmount(amount, token.pDecimals);
    let maxOriginalAmount = token.amount || 0;
    let maxOriginalAmountText = convertAmount({
      originalNum: maxOriginalAmount,
      pDecimals: token.pDecimals
    });
    if ((token.tokenId === feeToken) && (maxOriginalAmount - feeAmount) > 0) {
      maxOriginalAmount = maxOriginalAmount - feeAmount;
      maxOriginalAmountText = convertAmount({
        originalNum: maxOriginalAmount,
        pDecimals: token.pDecimals
      });
    }
    let error = undefined;
    if ((feeToken === token.tokenId) && (new BigNumber(feeAmount).gt(new BigNumber(maxOriginalAmount)))) {
      error = MESSAGES.NOT_ENOUGH_NETWORK_FEE;
    }
    if (new BigNumber(originalInputAmount).gt(new BigNumber(maxOriginalAmount))) {
      error = MESSAGES.BALANCE_INSUFFICIENT;
    }

    if (!originalInputAmount) {
      error = MESSAGES.NEGATIVE_NUMBER;
    }

    return {
      tokenId: token.tokenId,
      symbol: token.symbol,
      pDecimals: token.pDecimals,
      iconUrl: token.iconUrl,

      originalInputAmount,
      inputAmountStr,
      inputAmountSymbolStr: `${inputAmountStr} ${token.symbol}`,
      maxOriginalAmount,
      maxOriginalAmountText,

      loadingBalance: isGettingBalance.includes(token.tokenId),
      balance: token.amount,
      balanceStr: format.amountFull(token.amount, token.pDecimals, false).toString(),
      error,
    };
  } catch (error) {
    console.log('inputAmountSelector error', error);
  }
};

export const getInputShareAmount = (
  state,
  isGettingBalance,
  tokens,
  { feeAmount, token: feeToken },
  { maxInputShareStr, maxOutputShareStr, share }
) => (formName, field) => {
  try {
    const token = tokens[field];
    if (!token || !token.tokenId) {
      return {
        amount: '',
        originalAmount: 0,
        loadingBalance: true
      };
    }
    const selector = formValueSelector(formName);
    const inputAmountStr = selector(state, field);
    let amount = convert.toNumber(inputAmountStr, true) || 0;
    const originalInputAmount = convert.toOriginalAmount(amount, token.pDecimals);
    const maxInputShareNumb = convert.toNumber(maxInputShareStr, true);
    const maxOutputShareNumb = convert.toNumber(maxOutputShareStr, true);
    let maxWithdrawHuman = maxInputShareNumb ?? 0;
    if (field !== formConfigsRemovePool.inputToken) {
      maxWithdrawHuman = maxOutputShareNumb ?? 0;
    }
    let withdrawAmount = new BigNumber(amount).dividedBy(maxWithdrawHuman).multipliedBy(share).toNumber();
    const feeBalance = feeToken.amount ?? 0;
    let error;
    if (withdrawAmount > share) {
      error = MESSAGES.BALANCE_INSUFFICIENT;
    } else if (feeBalance < feeAmount) {
      error = MESSAGES.NOT_ENOUGH_NETWORK_FEE;
    }
    let withdraw = Math.ceil(withdrawAmount);
    if (withdrawAmount > share) withdraw = share;
    return {
      tokenId: token.tokenId,
      symbol: token.symbol,
      pDecimals: token.pDecimals,

      originalInputAmount,
      inputAmountStr,
      inputAmountSymbolStr: `${inputAmountStr} ${token.symbol}`,
      withdraw,
      loadingBalance: isGettingBalance.includes(token.tokenId),
      balance: token.amount,
      balanceStr: format.amountFull(token.amount, token.pDecimals, false),
      error,
    };
  } catch (error) {
    console.log('inputAmountSelector error', error);
  }
};

export const filterTokenList = ({
  tokenId,
  pools = [],
  tokenIds = [],
  ignoreTokens = []
}) => {
  const existTokens = uniq(pools.reduce((prev, curr) => {
    const { token1Id, token2Id } = curr;
    if (token1Id === tokenId) {
      prev.push(token2Id);
    }
    if (token2Id === tokenId) {
      prev.push(token1Id);
    }
    return prev;
  }, []));
  return tokenIds.filter(_tokenId => !ignoreTokens.includes(_tokenId) && !existTokens.includes(_tokenId));
};
