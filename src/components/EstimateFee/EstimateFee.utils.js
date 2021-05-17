import { MAX_PDEX_TRADE_STEPS } from '@screens/DexV2/constants';
import convert from '@src/utils/convert';
import { CONSTANT_COMMONS } from '@src/constants';
import format from '@src/utils/format';
import floor from 'lodash/floor';

export const DEFAULT_FEE_PER_KB_HUMAN_AMOUNT = 0.000000001; // in nano
export const DEFAULT_FEE_PER_KB = DEFAULT_FEE_PER_KB_HUMAN_AMOUNT * 1e9; // in nano
export const MAX_TX_SIZE = 10;
export const MAX_FEE_PER_TX = DEFAULT_FEE_PER_KB * MAX_TX_SIZE;
// export const MAX_DEX_FEE = MAX_FEE_PER_TX * MAX_PDEX_TRADE_STEPS;
export const MAX_DEX_FEE = 100;

export const getMaxAmount = ({ selectedPrivacy, isUseTokenFee, totalFee }) => {
  const { amount, isMainCrypto, pDecimals } = selectedPrivacy;
  let amountNumber = amount;
  if (isUseTokenFee || isMainCrypto) {
    const newAmount = amountNumber - totalFee;
    amountNumber = Math.max(newAmount, 0);
  }
  const maxAmount = Math.max(floor(amountNumber), 0);
  const maxAmountText = format.toFixed(
    convert.toHumanAmount(maxAmount, pDecimals),
    pDecimals,
  );
  return {
    maxAmount,
    maxAmountText,
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
    isFetching,
    isAddressValidated,
    isValidETHAddress,
    userFees,
    isFetched,
    totalFeePrv,
    userFeePrv,
    totalFeePrvText,
    totalFeePToken,
    userFeePToken,
    totalFeePTokenText,
    feePrv,
    feePToken,
    types,
    fast2x,
    feePrvText,
    feePTokenText,
  } = estimateFee;
  const { amount } = selectedPrivacy;
  const isUseTokenFee = actived !== CONSTANT_COMMONS.PRV.id;
  const feeUnit = isUseTokenFee
    ? selectedPrivacy?.externalSymbol || selectedPrivacy.symbol
    : CONSTANT_COMMONS.PRV.symbol;
  const feePDecimals = isUseTokenFee
    ? selectedPrivacy?.pDecimals
    : CONSTANT_COMMONS.PRV.pDecimals;
  const fee = isUseTokenFee ? feePToken : feePrv;
  const userFee = isUseTokenFee ? userFeePToken : userFeePrv;
  const totalFeeText = isUseTokenFee ? totalFeePTokenText : totalFeePrvText;
  const totalFee = isUseTokenFee ? totalFeePToken : totalFeePrv;
  const { maxAmount, maxAmountText } = getMaxAmount({
    selectedPrivacy,
    isUseTokenFee,
    totalFee,
  });
  let titleBtnSubmit =
    screen === 'Send' ? 'Send anonymously' : 'Unshield my crypto';
  if (isFetching) {
    titleBtnSubmit = 'Calculating fee...';
  }
  const feeText = format.toFixed(
    convert.toHumanAmount(fee, feePDecimals),
    feePDecimals,
  );
  const isETH =
    selectedPrivacy?.externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH;
  const isBTC =
    selectedPrivacy?.externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BTC;
  // const editableInput = !isFetching && !userFees.isFetching;
  const editableInput = true;
  return {
    isUseTokenFee,
    fee,
    feeText,
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
    titleBtnSubmit,
    isFetching,
    isUnShield: screen === 'UnShield',
    isSend: screen === 'Send',
    isAddressValidated,
    isValidETHAddress,
    isETH,
    userFees,
    isFetched,
    userFee,
    totalFee,
    totalFeeText,
    types,
    actived,
    fast2x,
    feePrv,
    feePToken,
    feePrvText,
    feePTokenText,
    isBTC,
    hasMultiLevel: userFees?.hasMultiLevel,
    editableInput,
  };
};

export const getTotalFee = ({
  fast2x = false,
  userFeesData = {},
  feeEst = 0,
  pDecimals,
  isUsedPRVFee,
  hasMultiLevel = false,
}) => {
  let totalFee, totalFeeText, userFee;
  try {
    const userFees = isUsedPRVFee
      ? userFeesData?.PrivacyFees
      : userFeesData?.TokenFees;
    userFee = Number(userFees?.Level1) || 0;
    if (hasMultiLevel) {
      userFee = Number(fast2x ? userFees?.Level2 : userFees?.Level1);
    }
    totalFee = floor(userFee + Number(feeEst));
    totalFeeText = format.toFixed(
      convert.toHumanAmount(totalFee, pDecimals),
      pDecimals,
    );
  } catch (error) {
    throw error;
  }
  return { totalFee, totalFeeText, userFee };
};

export const hasMultiLevelUsersFee = (data) =>
  !!data?.PrivacyFees?.Level2 || !!data?.TokenFees?.Level2;
