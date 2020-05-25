import { createSelector } from 'reselect';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import convert from '@src/utils/convert';
import { CONSTANT_COMMONS } from '@src/constants';
import format from '@src/utils/format';
import floor from 'lodash/floor';

export const estimateFeeSelector = createSelector(
  state => state.estimateFee,
  estimateFee => estimateFee,
);

export const feeDataSelector = createSelector(
  estimateFeeSelector,
  selectedPrivacySeleclor.selectedPrivacy,
  selectedPrivacySeleclor.getPrivacyDataByTokenID,
  (estimateFee, selectedPrivacy) => {
    const {
      actived,
      minFeePTokenText,
      minFeePrvText,
      feePTokenText,
      feePrvText,
      maxFeePTokenText,
      maxFeePrvText,
      amount,
      amountText,
      screen,
      rate,
      minAmount,
      minAmountText,
    } = estimateFee;
    const isUseTokenFee = actived !== CONSTANT_COMMONS.PRV.id;
    const feeUnit = isUseTokenFee
      ? selectedPrivacy?.externalSymbol || selectedPrivacy.symbol
      : CONSTANT_COMMONS.PRV.symbol;
    const feePDecimals = isUseTokenFee
      ? selectedPrivacy?.pDecimals
      : CONSTANT_COMMONS.PRV.pDecimals;
    const fee = isUseTokenFee ? feePTokenText : feePrvText;
    let amountNumber = convert.toNumber(amountText);
    if (isUseTokenFee || selectedPrivacy?.isMainCrypto) {
      const newAmount = amountNumber - convert.toNumber(fee);
      amountNumber = newAmount > 0 ? newAmount : 0;
    }
    const maxAmount = Math.max(floor(amountNumber, 9), 0);
    const maxAmountText = format.amountFull(maxAmount);
    return {
      isUseTokenFee,
      fee,
      feeUnit,
      feeUnitByTokenId: actived,
      feePDecimals,
      minFee: isUseTokenFee ? minFeePTokenText : minFeePrvText,
      maxFee: isUseTokenFee ? maxFeePTokenText : maxFeePrvText,
      amount,
      amountText,
      screen,
      rate,
      minAmount,
      minAmountText,
      maxAmount,
      maxAmountText,
      isUsedPRVFee: !isUseTokenFee
    };
  },
);
