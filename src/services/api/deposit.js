import http from '@src/services/http';
import { CONSTANT_COMMONS } from '@src/constants';

const formatResponse = (res) => ({
  address: res?.Address,
  expiredAt: res?.ExpiredAt,
  decentralized: res?.Decentralized,
  estimateFee: res?.EstimateFee,
  tokenFee: res?.TokenFee,
});

export const genCentralizedDepositAddress = ({
  paymentAddress,
  walletAddress,
  tokenId,
  currencyType,
  signPublicKeyEncode,
}) => {
  if (!paymentAddress) return throw new Error('Missing paymentAddress');
  if (!walletAddress) return throw new Error('Missing walletAddress');
  if (!tokenId) return throw new Error('Missing tokenId');

  // const parseAmount = Number(amount);

  // if (!Number.isFinite(parseAmount) || parseAmount === 0) {
  //   return throw new Error('Invalid amount');
  // }

  let body = {
    CurrencyType: currencyType,
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.DEPOSIT,
    RequestedAmount: undefined,
    PaymentAddress: paymentAddress,
    WalletAddress: walletAddress ?? paymentAddress,
    PrivacyTokenAddress: tokenId,
    NewShieldDecentralized: 1,
  };

  if (signPublicKeyEncode) {
    body.SignPublicKeyEncode = signPublicKeyEncode;
  }

  return http.post('ota/generate', body).then(formatResponse);
};

export const genETHDepositAddress = ({
  paymentAddress,
  walletAddress,
  tokenId,
  currencyType,
  signPublicKeyEncode,
}) => {
  if (!paymentAddress) return throw new Error('Missing paymentAddress');
  if (!walletAddress) return throw new Error('Missing walletAddress');
  if (!tokenId) return throw new Error('Missing tokenId');

  // const parseAmount = Number(amount);

  // if (!Number.isFinite(parseAmount) || parseAmount === 0) {
  //   return throw new Error('Invalid amount');
  // }

  let body = {
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.DEPOSIT,
    WalletAddress: walletAddress ?? paymentAddress,
    PrivacyTokenAddress: tokenId,
  };
  if (signPublicKeyEncode) {
    body.SignPublicKeyEncode = signPublicKeyEncode;
  }
  return http.post('eth/generate', body).then(formatResponse);
};

export const genERC20DepositAddress = ({
  paymentAddress,
  walletAddress,
  tokenId,
  tokenContractID,
  currencyType,
  signPublicKeyEncode,
}) => {
  if (!paymentAddress) return throw new Error('Missing paymentAddress');
  if (!walletAddress) return throw new Error('Missing walletAddress');
  if (!tokenId) return throw new Error('Missing tokenId');
  if (!tokenContractID) return throw new Error('Missing tokenContractID');

  // const parseAmount = Number(amount);

  // if (!Number.isFinite(parseAmount) || parseAmount === 0) {
  //   return throw new Error('Invalid amount');
  // }

  let body = {
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.DEPOSIT,
    WalletAddress: walletAddress ?? paymentAddress,
    PrivacyTokenAddress: tokenId,
  };

  if (signPublicKeyEncode) {
    body.SignPublicKeyEncode = signPublicKeyEncode;
  }

  return http.post('eth/generate', body).then(formatResponse);
};

export const genBSCDepositAddress = ({
  paymentAddress,
  walletAddress,
  tokenId,
  currencyType,
  signPublicKeyEncode,
}) => {
  if (!paymentAddress) return throw new Error('Missing paymentAddress');
  if (!walletAddress) return throw new Error('Missing walletAddress');
  if (!tokenId) return throw new Error('Missing tokenId');

  let body = {
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.DEPOSIT,
    WalletAddress: walletAddress ?? paymentAddress,
    PrivacyTokenAddress: tokenId,
  };
  if (signPublicKeyEncode) {
    body.SignPublicKeyEncode = signPublicKeyEncode;
  }
  return http.post('bsc/generate', body).then(formatResponse);
};

export const genPolygonDepositAddress = ({
  paymentAddress,
  walletAddress,
  tokenId,
  currencyType,
  signPublicKeyEncode,
}) => {
  if (!paymentAddress) return throw new Error('Missing paymentAddress');
  if (!walletAddress) return throw new Error('Missing walletAddress');
  if (!tokenId) return throw new Error('Missing tokenId');

  let body = {
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.DEPOSIT,
    WalletAddress: walletAddress ?? paymentAddress,
    PrivacyTokenAddress: tokenId,
  };
  if (signPublicKeyEncode) {
    body.SignPublicKeyEncode = signPublicKeyEncode;
  }
  return http.post('plg/generate', body).then(formatResponse);
};

export const genFantomDepositAddress = ({
  paymentAddress,
  walletAddress,
  tokenId,
  currencyType,
  signPublicKeyEncode,
}) => {
  if (!paymentAddress) return throw new Error('Missing paymentAddress');
  if (!walletAddress) return throw new Error('Missing walletAddress');
  if (!tokenId) return throw new Error('Missing tokenId');

  let body = {
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.DEPOSIT,
    WalletAddress: walletAddress ?? paymentAddress,
    PrivacyTokenAddress: tokenId,
  };
  if (signPublicKeyEncode) {
    body.SignPublicKeyEncode = signPublicKeyEncode;
  }
  return http.post('ftm/generate', body).then(formatResponse);
};

export const genAvaxDepositAddress = ({
  paymentAddress,
  walletAddress,
  tokenId,
  currencyType,
  signPublicKeyEncode,
}) => {
  if (!paymentAddress) return throw new Error('Missing paymentAddress');
  if (!walletAddress) return throw new Error('Missing walletAddress');
  if (!tokenId) return throw new Error('Missing tokenId');

  let body = {
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.DEPOSIT,
    WalletAddress: walletAddress ?? paymentAddress,
    PrivacyTokenAddress: tokenId,
  };
  if (signPublicKeyEncode) {
    body.SignPublicKeyEncode = signPublicKeyEncode;
  }
  return http.post('avax/generate', body).then(formatResponse);
};

export const genAuroraDepositAddress = ({
  paymentAddress,
  walletAddress,
  tokenId,
  currencyType,
  signPublicKeyEncode,
}) => {
  if (!paymentAddress) return throw new Error('Missing paymentAddress');
  if (!walletAddress) return throw new Error('Missing walletAddress');
  if (!tokenId) return throw new Error('Missing tokenId');

  let body = {
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.DEPOSIT,
    WalletAddress: walletAddress ?? paymentAddress,
    PrivacyTokenAddress: tokenId,
  };
  if (signPublicKeyEncode) {
    body.SignPublicKeyEncode = signPublicKeyEncode;
  }
  return http.post('aurora/generate', body).then(formatResponse);
};

export const genNearDepositAddress = ({
  paymentAddress,
  walletAddress,
  tokenId,
  currencyType,
  signPublicKeyEncode,
}) => {
  if (!paymentAddress) return throw new Error('Missing paymentAddress');
  if (!walletAddress) return throw new Error('Missing walletAddress');
  if (!tokenId) return throw new Error('Missing tokenId');

  let body = {
    AddressType: CONSTANT_COMMONS.ADDRESS_TYPE.DEPOSIT,
    WalletAddress: walletAddress ?? paymentAddress,
    PrivacyTokenAddress: tokenId,
  };
  if (signPublicKeyEncode) {
    body.SignPublicKeyEncode = signPublicKeyEncode;
  }
  return http.post('near/generate', body).then(formatResponse);
};

export const checkShieldRefundInfo = ({ decentralized, shieldID }) => {
  if (!decentralized || !shieldID) return;
  let body = {
    Decentralized: decentralized, // 2(eth), 3(bsc), 4(plg), 5(fantom)
    ID: shieldID, // ID of shield
  };

  return http.post('service/blacklist/refund-info', body);
};

export const submitShieldRefund = ({ decentralized, shieldID }) => {
  if (!decentralized || !shieldID) return;
  let body = {
    Decentralized: decentralized, // 2(eth), 3(bsc), 4(plg), 5(fantom)
    ID: shieldID, // ID of shield
  };

  return http.post('service/blacklist/refund-now', body);
};
