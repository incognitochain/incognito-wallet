import { MAX_PDEX_TRADE_STEPS } from '@screens/DexV2/constants';
import convert from '@src/utils/convert';
import { CONSTANT_COMMONS } from '@src/constants';
import format from '@src/utils/format';
import floor from 'lodash/floor';

export const DEFAULT_FEE_PER_KB_HUMAN_AMOUNT = 0.000000001; // in nano
export const DEFAULT_FEE_PER_KB = DEFAULT_FEE_PER_KB_HUMAN_AMOUNT * 1e9; // in nano
export const MAX_TX_SIZE = 100;
export const MAX_FEE_PER_TX = DEFAULT_FEE_PER_KB * MAX_TX_SIZE;
export const MAX_DEX_FEE = MAX_FEE_PER_TX * MAX_PDEX_TRADE_STEPS;
export const DEFI_TRADING_FEE = 21e9;

export const getMaxAmount = ({
  selectedPrivacy,
  isUseTokenFee,
  feePToken,
  feePrv,
}) => {
  const { amount, isMainCrypto, pDecimals } = selectedPrivacy;
  const fee = isUseTokenFee ? feePToken : feePrv;
  let amountNumber = amount;
  if (isUseTokenFee || isMainCrypto) {
    const newAmount = amountNumber - fee;
    amountNumber = Math.max(newAmount, 0);
  }
  const maxAmount = Math.max(floor(amountNumber, pDecimals), 0);
  const maxAmountText = format.toFixed(
    convert.toHumanAmount(maxAmount, pDecimals),
    pDecimals,
  );
  return {
    maxAmount,
    maxAmountText,
    fee,
  };
};

export const getFeeData = (estimateFee, selectedPrivacy) => {
  const {
    actived,
    minFeePTokenText,
    minFeePrvText,
    maxFeePTokenText,
    maxFeePrvText,
    amountText,
    screen,
    rate,
    minAmount,
    minAmountText,
    feePToken,
    feePrv,
  } = estimateFee;
  const { amount } = selectedPrivacy;
  const isUseTokenFee = actived !== CONSTANT_COMMONS.PRV.id;
  const feeUnit = isUseTokenFee
    ? selectedPrivacy?.externalSymbol || selectedPrivacy.symbol
    : CONSTANT_COMMONS.PRV.symbol;
  const feePDecimals = isUseTokenFee
    ? selectedPrivacy?.pDecimals
    : CONSTANT_COMMONS.PRV.pDecimals;
  const { fee, maxAmount, maxAmountText } = getMaxAmount({
    selectedPrivacy,
    isUseTokenFee,
    feePToken,
    feePrv,
  });
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
    isUsedPRVFee: !isUseTokenFee,
    pDecimals: selectedPrivacy?.pDecimals,
  };
};
