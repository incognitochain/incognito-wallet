import { NativeModules } from 'react-native';

const PrivacyGo = NativeModules.PrivacyGo;
const asyncMethods = [
  'createTransaction',
  'createConvertTx',
  'newKeySetFromPrivate',
  'decryptCoin',
  'createCoin',
  'generateBLSKeyPairFromSeed',
  'hybridEncrypt',
  'hybridDecrypt',
  'initPrivacyTx',
  'staking',
  'stopAutoStaking',
  'initPrivacyTokenTx',
  'initBurningRequestTx',
  'initWithdrawRewardTx',
  'generateKeyFromSeed',
  'scalarMultBase',
  'randomScalars',
  'getSignPublicKey',
  'signPoolWithdraw',
  'verifySign',
  'initPRVContributionTx',
  'initPTokenContributionTx',
  'initPRVTradeTx',
  'initPTokenTradeTx',
  'withdrawDexTx',
  'hybridEncryptionASM',
  'hybridDecryptionASM',
  'estimateTxSize',
];
try {
  global.__gobridge__ = Object.assign({}, PrivacyGo);
  global.__gobridge__.ready = true;
  console.log(asyncMethods.forEach((name) => typeof global.__gobridge__[name]));
  console.log('GO modules were loaded');
} catch {
  console.error('GO modules can not loaded');
}

/**
 * Sign staking pool withdraw
 * @param {string} privateKey
 * @param {string} paymentAddress
 * @param {string | number} amount
 * @returns {Promise<string>} signatureEncode
 */
export const signPoolWithdraw = (privateKey, paymentAddress, amount) => {
  if (!privateKey) {
    throw new Error('Private key is missing');
  }

  if (!paymentAddress) {
    throw new Error('Payment address is missing');
  }

  if (!Number.isInteger(Number.parseInt(amount))) {
    throw new Error('Amount is invalid');
  }

  const args = {
    data: {
      privateKey,
      paymentAddress,
      amount: amount.toString(),
    },
  };

  return global.signPoolWithdraw(JSON.stringify(args));
};
