import { PRV } from '@src/constants/common';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import convert from '@src/utils/convert';
import format from '@src/utils/format';
import BigNumber from 'bignumber.js';
import { formValueSelector } from 'redux-form';
import { formConfigs } from './OrderLimit.constant';

export const maxAmountValidatorForSellInput = (sellInputAmount) => {
  try {
    if (!sellInputAmount) {
      return undefined;
    }
    const {
      originalAmount,
      availableOriginalAmount,
      symbol,
      availableAmountText,
    } = sellInputAmount || {};
    if (
      new BigNumber(originalAmount).gt(new BigNumber(availableOriginalAmount))
    ) {
      let text = new BigNumber(availableOriginalAmount).gt(0)
        ? `Max amount you can order is ${availableAmountText} ${symbol}`
        : `Your ${symbol} balance is insufficient.`;
      return text;
    }
  } catch (error) {
    console.log('maxAmountValidatorForSellInput-error', error);
  }
  return undefined;
};

export const maxAmountValidatorForBuyInput = ({
  sellInputAmount,
  customRate,
  buyToken,
  sellToken,
  buyOriginalAmount,
}) => {
  try {
    if (!sellInputAmount) {
      return undefined;
    }
    const {
      availableAmountNumber: availableSellAmountNumber,
      availableOriginalAmount: availableSellOriginalAmount,
    } = sellInputAmount;
    let availableBuyAmountNumber = new BigNumber(
      availableSellAmountNumber,
    ).dividedBy(customRate);
    const availableBuyOriginalAmount = convert.toOriginalAmount(
      availableBuyAmountNumber,
      buyToken?.pDecimals,
    );
    availableBuyAmountNumber = convert.toHumanAmount(
      availableBuyOriginalAmount,
      buyToken?.pDecimals,
    );
    const availableBuyAmountText = format.amountVer2(
      availableBuyOriginalAmount,
      buyToken?.pDecimals,
    );
    if (
      new BigNumber(buyOriginalAmount).gt(
        new BigNumber(availableBuyOriginalAmount),
      )
    ) {
      let text = new BigNumber(availableSellOriginalAmount).gt(0)
        ? `Max amount you can order is ${availableBuyAmountText} ${buyToken?.symbol}`
        : `Your ${sellToken?.symbol} balance is insufficient.`;
      return text;
    }
  } catch (error) {
    console.log('maxAmountValidatorForBuyInput-error', error);
  }
  return undefined;
};

export const getInputAmount = (
  state,
  feeData,
  orderLimit,
  isGettingBalance,
  getPrivacyDataByTokenID,
  pool,
) => (field) => {
  try {
    const { networkfee } = orderLimit;
    const token: SelectedPrivacy = getPrivacyDataByTokenID(orderLimit[field]);
    if (!token.tokenId) {
      return {
        amount: '',
        originalAmount: 0,
        isFocus: false,
      };
    }
    const selector = formValueSelector(formConfigs.formName);
    const amountText = selector(state, field);
    let amount = convert.toNumber(amountText, true) || 0;
    const originalAmount = convert.toOriginalAmount(amount, token.pDecimals);
    amount = convert.toHumanAmount(originalAmount, token.pDecimals);
    let availableOriginalAmount = token.amount || 0;
    let availableAmountNumber = 0;
    let availableAmountText = '';
    const usingFee =
      token.tokenId === feeData.feetoken && field === formConfigs.selltoken;
    if (usingFee) {
      availableOriginalAmount = new BigNumber(availableOriginalAmount)
        .minus(new BigNumber(feeData.origininalFeeAmount))
        .toNumber();
    }
    if (usingFee && token.isMainCrypto) {
      availableOriginalAmount = new BigNumber(availableOriginalAmount)
        .minus(networkfee)
        .toNumber();
    }
    if (new BigNumber(availableOriginalAmount).isGreaterThan(0)) {
      const formatAmount = format.amountVer2(
        availableOriginalAmount,
        token?.pDecimals,
      );
      availableAmountNumber = convert.toNumber(formatAmount, true);
      availableAmountText = format.toFixed(
        availableAmountNumber,
        token.pDecimals,
      );
    }
    let poolValue = 0;
    if (token.tokenId === pool?.token1Id) {
      poolValue = pool?.token1Value;
    } else if (token.tokenId === pool?.token2Id) {
      poolValue = pool?.token2Value;
    }
    let poolValueStr = format.amountVer2(poolValue, token.pDecimals);
    const data = {
      tokenId: token.tokenId,
      symbol: token.symbol,
      pDecimals: token.pDecimals,
      isMainCrypto: token.isMainCrypto,
      iconUrl: token.iconUrl,
      tokenData: token,

      amount,
      originalAmount,
      amountText,

      availableOriginalAmount,
      availableAmountText,
      availableAmountNumber,

      usingFee,
      loadingBalance: isGettingBalance.includes(token.tokenId),

      balance: token.amount,
      balanceStr: `${format.amountVer2(token?.amount || 0, token.pDecimals)} ${
        token?.symbol
      }`,
      balanceTitle: `${token?.symbol} Balance`,
      poolValue,
      poolValueStr,
    };
    return data;
  } catch (error) {
    console.log('inputAmountSelector error', error);
  }
};

export const minFeeValidator = (feetokenData) => {
  if (!feetokenData) {
    return undefined;
  }
  try {
    const {
      origininalFeeAmount,
      minFeeOriginal,
      symbol,
      minFeeAmountText,
    } = feetokenData;
    if (
      new BigNumber(origininalFeeAmount).isLessThan(
        new BigNumber(minFeeOriginal),
      )
    ) {
      return `Amount must be larger than ${minFeeAmountText} ${symbol}`;
    }
  } catch (error) {
    console.log('minFeeValidator-error', error);
  }
  return undefined;
};

export const availablePayFeeByPRVValidator = ({
  origininalFeeAmount,
  prvBalance = 0,
  usingFeeBySellToken,
  networkfee,
} = {}) => {
  if (usingFeeBySellToken) {
    return undefined;
  }
  try {
    let availablePRVBalance = new BigNumber(prvBalance)
      .minus(origininalFeeAmount)
      .minus(networkfee);
    if (availablePRVBalance.isLessThan(0)) {
      return `Your ${PRV.symbol} balance is insufficient.`;
    }
  } catch (error) {
    console.log('availablePayFeeByPRVValidator-error', error);
  }
  return undefined;
};
