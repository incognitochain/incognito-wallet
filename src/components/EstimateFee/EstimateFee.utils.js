import convert from '@src/utils/convert';
import { CONSTANT_COMMONS } from '@src/constants';
import format from '@src/utils/format';
import floor from 'lodash/floor';
import { ACCOUNT_CONSTANT } from 'incognito-chain-web-js/build/wallet';

export const DEFAULT_FEE_PER_KB_HUMAN_AMOUNT = 0.1; // in nano
export const DEFAULT_FEE_PER_KB = DEFAULT_FEE_PER_KB_HUMAN_AMOUNT * 1e9; // in nano
export const MAX_TX_SIZE = 10;
// export const MAX_FEE_PER_TX = DEFAULT_FEE_PER_KB * MAX_TX_SIZE;
export const MAX_FEE_PER_TX = ACCOUNT_CONSTANT.MAX_FEE_PER_TX;
export const INIT_PTOKEN_FEE = 10 * 1e9;
export const MAX_DEX_FEE = ACCOUNT_CONSTANT.MAX_FEE_PER_TX; // Not use...

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

export const getFeeData = (estimateFee, selectedPrivacyData, childSelectedPrivacyData, prvBalanceInfo) => {
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
    totalFees,
  } = estimateFee;
  const { amount } = selectedPrivacyData;
  const { isNeedFaucet } = prvBalanceInfo;
  const isUseTokenFee = actived !== CONSTANT_COMMONS.PRV.id;
  const feeUnit = isUseTokenFee
    ? selectedPrivacyData?.externalSymbol || selectedPrivacyData.symbol
    : CONSTANT_COMMONS.PRV.symbol;
  const feePDecimals = isUseTokenFee
    ? selectedPrivacyData?.pDecimals
    : CONSTANT_COMMONS.PRV.pDecimals;
  const isUnShield = childSelectedPrivacyData?.networkId !== 'INCOGNITO';
  let fee = isUseTokenFee ? feePToken : feePrv;
  // UnShield payment fee by PToken, network fee always PRV
  if (isUnShield) {
    fee = feePrv; // Network fee
  }
  const userFee = isUseTokenFee ? userFeePToken : userFeePrv;
  const totalFeeText = isUseTokenFee ? totalFeePTokenText : totalFeePrvText;
  const totalFee = isUseTokenFee ? totalFeePToken : totalFeePrv;
  const { maxAmount, maxAmountText } = getMaxAmount({
    selectedPrivacy: selectedPrivacyData,
    isUseTokenFee,
    totalFee,
  });
  let titleBtnSubmit = 'Send';
  if (isNeedFaucet) {
    titleBtnSubmit = 'Faucet';
  } else if (isFetching) {
    titleBtnSubmit = 'Calculating fee...';
  }
  const feeText = format.toFixed(
    convert.toHumanAmount(fee, feePDecimals),
    feePDecimals,
  );
  const isETH =
    selectedPrivacyData?.currencyType ===
      CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.ETH ||
    childSelectedPrivacyData?.currencyType ===
      CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.ETH;
  const isBTC =
    selectedPrivacyData?.currencyType ===
      CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BTC ||
    childSelectedPrivacyData?.currencyType ===
      CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BTC;
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
    pDecimals: selectedPrivacyData?.pDecimals,
    titleBtnSubmit,
    isFetching,
    isUnShield,
    isSend: childSelectedPrivacyData?.networkId === 'INCOGNITO',
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
    totalFees
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
    userFee = (Number(userFees?.Level1) || 0);
    const extraFee = Number(userFeesData?.EstimateReceivedAmount?.Fee || 0);
    if (hasMultiLevel && fast2x) {
      userFee = Number(userFees?.Level2);
    }
    const fee = userFee + extraFee;
    totalFee = isUsedPRVFee ? floor(userFee + Number(feeEst)) : fee;
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
