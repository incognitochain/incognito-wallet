import http from '@src/services/http';
import { CONSTANT_COMMONS } from '@src/constants';
import convert from '@src/utils/convert';

export const genCentralizedWithdrawAddress = ({
  amount,
  paymentAddress,
  walletAddress,
  tokenId,
  currencyType,
  memo,
}) => {
  if (!paymentAddress) throw new Error('Missing paymentAddress');
  if (!walletAddress) throw new Error('Missing walletAddress');
  if (!tokenId) throw new Error('Missing tokenId');
  const parseAmount = convert.toNumber(amount);
  if (!Number.isFinite(parseAmount) || parseAmount === 0) {
    throw new Error('Invalid amount');
  }
  return http
    .post('ota/generate', {
      CurrencyType: currencyType,
      AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.WITHDRAW,
      RequestedAmount: String(parseAmount),
      PaymentAddress: paymentAddress,
      WalletAddress: walletAddress,
      PrivacyTokenAddress: tokenId,
      ...(memo ? { Memo: memo } : {}),
    })
    .then(res => res?.Address);
};

const addETHTxWithdraw = ({
  amount,
  originalAmount,
  paymentAddress,
  walletAddress,
  tokenId,
  burningTxId,
  currencyType,
}) => {
  if (!paymentAddress) return throw new Error('Missing paymentAddress');
  if (!tokenId) return throw new Error('Missing tokenId');
  if (!burningTxId) return throw new Error('Missing burningTxId');

  const parseAmount = Number(amount);
  const parseOriginalAmount = Number(originalAmount);

  if (
    !Number.isFinite(parseAmount) ||
    parseAmount === 0 ||
    !Number.isFinite(parseOriginalAmount) ||
    parseOriginalAmount === 0
  ) {
    return throw new Error('Invalid amount');
  }

  return http.post('eta/add-tx-withdraw', {
    CurrencyType: currencyType,
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.WITHDRAW,
    RequestedAmount: String(parseAmount),
    IncognitoAmount: String(originalAmount),
    PaymentAddress: paymentAddress,
    Erc20TokenAddress: '',
    PrivacyTokenAddress: tokenId,
    IncognitoTx: burningTxId,
    WalletAddress: walletAddress ?? paymentAddress,
  });
};

const addERC20TxWithdraw = ({
  amount,
  originalAmount,
  paymentAddress,
  walletAddress,
  tokenContractID,
  tokenId,
  burningTxId,
  currencyType,
}) => {
  if (!paymentAddress) throw new Error('Missing paymentAddress');
  if (!tokenId) throw new Error('Missing tokenId');
  if (!tokenContractID) throw new Error('Missing tokenContractID');
  if (!burningTxId) throw new Error('Missing burningTxId');
  const parseAmount = Number(amount);
  const parseOriginalAmount = Number(originalAmount);
  if (
    !Number.isFinite(parseAmount) ||
    parseAmount === 0 ||
    !Number.isFinite(parseOriginalAmount) ||
    parseOriginalAmount === 0
  ) {
    throw new Error('Invalid amount');
  }
  console.log(
    'CONSTANT_COMMONS.ADDRESS_TYPE.WITHDRAW',
    CONSTANT_COMMONS.ADDRESS_TYPE.WITHDRAW,
  );
  return http.post('eta/add-tx-withdraw', {
    CurrencyType: currencyType,
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.WITHDRAW,
    RequestedAmount: String(parseAmount),
    IncognitoAmount: String(originalAmount),
    PaymentAddress: paymentAddress,
    Erc20TokenAddress: tokenContractID,
    PrivacyTokenAddress: tokenId,
    IncognitoTx: burningTxId,
    WalletAddress: walletAddress ?? paymentAddress,
  });
};

export const withdraw = data => {
  const { isErc20Token, externalSymbol } = data;
  if (isErc20Token) {
    return addERC20TxWithdraw(data);
  } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH) {
    return addETHTxWithdraw(data);
  }
};

export const updatePTokenFee = ({ fee, paymentAddress }) => {
  if (!fee) throw new Error('Missing fee');
  if (!paymentAddress) throw new Error('Missing paymentAddress');
  const parseFee = convert.toNumber(fee);
  if (!Number.isFinite(parseFee) || parseFee === 0) {
    throw new Error('Invalid fee');
  }
  http.post('ota/update-fee', {
    Address: paymentAddress,
    TokenFee: String(fee),
  });
};
