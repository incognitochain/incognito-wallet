import http from '@src/services/http';
import http1 from '@services/http1';
import { CONSTANT_COMMONS } from '@src/constants';
import convert from '@src/utils/convert';
import http4 from '@src/services/http4';

export const genCentralizedWithdrawAddress = ({
  originalAmount,
  requestedAmount,
  paymentAddress,
  walletAddress,
  tokenId,
  currencyType,
  memo,
  signPublicKeyEncode,
}) => {
  if (!paymentAddress) throw new Error('Missing paymentAddress');
  if (!walletAddress) throw new Error('Missing walletAddress');
  if (!tokenId) throw new Error('Missing tokenId');
  if (!Number.isFinite(originalAmount) || originalAmount === 0) {
    throw new Error('Invalid amount');
  }
  const data = {
    CurrencyType: currencyType,
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.WITHDRAW,
    RequestedAmount: String(requestedAmount),
    IncognitoAmount: String(originalAmount),
    PaymentAddress: paymentAddress,
    WalletAddress: walletAddress,
    PrivacyTokenAddress: tokenId,
    SignPublicKeyEncode: signPublicKeyEncode,
    ...(memo ? { Memo: memo } : {}),
  };

  return http.post('ota/generate', data).then((res) => res);
};

export const withdraw = (data) => {
  const {
    isErc20Token,
    isBep20Token,
    isPolygonErc20Token,
    isFantomErc20Token,
    isAvaxErc20Token,
    isAuroraErc20Token,
    isNearToken,
    paymentAddress,
    tokenId,
    burningTxId,
    originalAmount,
    requestedAmount,
    tokenContractID,
    walletAddress,
    currencyType,
    userFeesData,
    isUsedPRVFee,
    fast2x,
    signPublicKeyEncode,
  } = data;
  const parseOriginalAmount = Number(originalAmount);
  if (!burningTxId) throw new Error('Missing burningTxId');
  if (isErc20Token && !tokenContractID) {
    throw new Error('Missing tokenContractID');
  }
  if (!paymentAddress) throw new Error('Missing payment address');
  if (!tokenId) throw new Error('Missing token id');
  if (!Number.isFinite(parseOriginalAmount) || parseOriginalAmount === 0) {
    throw new Error('Invalid amount');
  }
  let payload = {
    CurrencyType: currencyType,
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.WITHDRAW,
    RequestedAmount: String(requestedAmount),
    IncognitoAmount: String(originalAmount),
    PaymentAddress: paymentAddress,
    Erc20TokenAddress: tokenContractID,
    PrivacyTokenAddress: tokenId,
    IncognitoTx: burningTxId,
    WalletAddress: walletAddress,
    ID: userFeesData?.ID,
    UserFeeSelection: isUsedPRVFee ? 2 : 1,
    UserFeeLevel: fast2x ? 2 : 1,
  };
  if (signPublicKeyEncode) {
    payload.SignPublicKeyEncode = signPublicKeyEncode;
  }

  // Ethereum ERC20 Token
  if (
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.ETH ||
    isErc20Token
  ) {
    return http.post('eth/add-tx-withdraw', payload);
  }

  if (
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BNB ||
    isBep20Token
  ) {
    return http.post('bsc/add-tx-withdraw', payload);
  }

  // Polygon Token
  if (
    isPolygonErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.MATIC
  ) {
    return http.post('plg/add-tx-withdraw', payload);
  }

  // Fantom Token
  if (
    isFantomErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.FTM
  ) {
    return http.post('ftm/add-tx-withdraw', payload);
  }

  // Avax Token
  if (
    isAvaxErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.AVAX
  ) {
    return http.post('avax/add-tx-withdraw', payload);
  }

  // Aurora Token
  if (
    isAuroraErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.AURORA_ETH
  ) {
    return http.post('aurora/add-tx-withdraw', payload);
  }

  // Near Token
  if (
    isNearToken ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.NEAR
  ) {
    return http.post('near/add-tx-withdraw', payload);
  }

  return http.post('eta/add-tx-withdraw', payload);
};

export const updatePTokenFee = (data) => {
  const {
    fee,
    paymentAddress,
    isUsedPRVFee,
    fast2x,
    txId,
    signPublicKeyEncode,
  } = data;
  if (!isUsedPRVFee) {
    if (!fee) throw new Error('Missing fee');
    const parseFee = convert.toNumber(fee);
    if (!Number.isFinite(parseFee) || parseFee === 0) {
      throw new Error('Invalid fee');
    }
  }
  if (!paymentAddress) throw new Error('Missing paymentAddress');
  if (!txId) {
    throw new Error('Missing tx id');
  }

  let payload = {
    Address: paymentAddress,
    PrivacyFee: String(isUsedPRVFee ? fee : 0),
    TokenFee: String(isUsedPRVFee ? 0 : fee),
    ID: '',
    UserFeeSelection: isUsedPRVFee ? 2 : 1,
    UserFeeLevel: fast2x ? 2 : 1,
    IncognitoTxToPayOutsideChainFee: txId,
  };

  if (signPublicKeyEncode) {
    payload.SignPublicKeyEncode = signPublicKeyEncode;
  }

  return http.post('ota/update-fee', payload);
};

export const estimateUserFees = (data) => {
  const {
    paymentAddress,
    tokenId,
    originalAmount,
    requestedAmount,
    tokenContractID,
    walletAddress,
    currencyType,
    isErc20Token,
    isBep20Token,
    isPolygonErc20Token,
    isFantomErc20Token,
    isAvaxErc20Token,
    isAuroraErc20Token,
    isNearToken,
    signPublicKeyEncode,
    unifiedTokenId,
  } = data;
  if (
    (isBep20Token ||
      isErc20Token ||
      isPolygonErc20Token ||
      isFantomErc20Token ||
      isAvaxErc20Token ||
      isAuroraErc20Token ||
      isNearToken) &&
    !tokenContractID
  ) {
    throw new Error('Missing tokenContractID');
  }
  if (!paymentAddress) throw new Error('Missing payment address');
  if (!tokenId) throw new Error('Missing token id');
  const parseOriginalAmount = Number(originalAmount);
  if (!Number.isFinite(parseOriginalAmount) || parseOriginalAmount === 0) {
    throw new Error('Invalid amount');
  }

  let payload = {
    RequestedAmount: String(requestedAmount),
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.WITHDRAW,
    IncognitoAmount: String(originalAmount),
    PaymentAddress: paymentAddress,
    PrivacyTokenAddress: tokenId,
    WalletAddress: walletAddress,
    IncognitoTx: '',
    UnifiedTokenID: unifiedTokenId,
  };

  if (signPublicKeyEncode) {
    payload.SignPublicKeyEncode = signPublicKeyEncode;
  }

  // Ethereum ERC20 Token
  if (
    isErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.ETH
  ) {
    return http.post('eth/estimate-fees', payload);
  }

  // Binance Smart Chain Token
  if (
    isBep20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BNB
  ) {
    return http.post('bsc/estimate-fees', payload);
  }

  // Polygon Token
  if (
    isPolygonErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.MATIC
  ) {
    return http.post('plg/estimate-fees', payload);
  }

  // Fantom Token
  if (
    isFantomErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.FTM
  ) {
    return http.post('ftm/estimate-fees', payload);
  }

  // Avax Token
  if (
    isAvaxErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.AVAX
  ) {
    return http.post('avax/estimate-fees', payload);
  }

  // Aurora Token
  if (
    isAuroraErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.AURORA_ETH
  ) {
    return http.post('aurora/estimate-fees', payload);
  }

  // Near Token
  if (
    isNearToken ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.NEAR
  ) {
    return http.post('near/estimate-fees', payload);
  }

  return http.post('eta/estimate-fees', payload);
};

export const estimateFeeDecentralized = (data) => {
  const {
    tokenId,
    originalAmount,
    tokenContractID,
    currencyType,
    isErc20Token,
    isBep20Token,
    isPolygonErc20Token,
    isFantomErc20Token,
    isAvaxErc20Token,
    isAuroraErc20Token,
    isNearToken,
  } = data;
  if (
    (isBep20Token ||
      isErc20Token ||
      isPolygonErc20Token ||
      isFantomErc20Token ||
      isAvaxErc20Token ||
      isAuroraErc20Token ||
      isNearToken) &&
    !tokenContractID
  ) {
    throw new Error('Missing tokenContractID');
  }
  if (!tokenId) throw new Error('Missing token id');
  const parseOriginalAmount = Number(originalAmount);
  if (!Number.isFinite(parseOriginalAmount) || parseOriginalAmount === 0) {
    throw new Error('Invalid amount');
  }

  let network = '';
  let amount = originalAmount || 0;
  let tokenid = tokenId;

  // Ethereum ERC20 Token
  if (
    isErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.ETH
  ) {
    network = 'eth';
  }

  // Binance Smart Chain Token
  if (
    isBep20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BNB
  ) {
    network = 'bsc';
  }

  // Polygon Token
  if (
    isPolygonErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.MATIC
  ) {
    network = 'plg';
  }

  // Fantom Token
  if (
    isFantomErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.FTM
  ) {
    network = 'ftm';
  }

  // Avax Token
  if (
    isAvaxErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.AVAX
  ) {
    network = 'avax';
  }

  // Aurora Token
  if (
    isAuroraErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.AURORA_ETH
  ) {
    network = 'aurora';
  }

  // Near Token
  if (
    isNearToken ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.NEAR
  ) {
    network = 'near';
  }

  // return http.post('eta/estimate-fees', payload);

  // using new Estimate Fee from Lam
  // Ex....
  // network  => bsc
  // amount   => 10000  (amount * pDecimal)
  // tokenid  => 000000000004

  // console.log('[estimateFeeDecentralized] API payload: ', {
  //   network,
  //   amount,
  //   tokenid,
  // });

  let url = `unshield/estimatefee?network=${network}&amount=${amount}&tokenid=${tokenid}`;
  return http4.get(url);
};

export const submitUnShieldTx = async (data) => {
  const { rawTx, feeRefundOTA } = data;
  if (!rawTx) throw new Error('Missing rawTx');
  if (!feeRefundOTA) throw new Error('Missing feeRefundOTA');
  try {
    const params = {
      TxRaw: rawTx,
      FeeRefundOTA: feeRefundOTA,
    };
    console.log('[submitUnShieldTx]  params ', params);
    const data = await http4.post('unshield/submittx', params);
    console.log('[submitUnShieldTx]  response ', data);
    return data;
  } catch (error) {
    console.log('[submitUnShieldTx]  error ', {
      error,
    });
    throw error;
  }
};
