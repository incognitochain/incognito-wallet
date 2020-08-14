import { NativeModules } from 'react-native';

const PrivacyGo = NativeModules.PrivacyGo;
const requiredTimeMethods = [
  'initPrivacyTx',
  'stopAutoStaking',
  'staking',
  'initPrivacyTokenTx',
  'initBurningRequestTx',
  'initWithdrawRewardTx',
  'initPRVContributionTx',
  'initPTokenContributionTx',
  'initPRVTradeTx',
  'initPTokenTradeTx',
  'withdrawDexTx',
];
const asyncMethods = [
  'deriveSerialNumber',
  'randomScalars',
  'initPrivacyTx',
  'initPrivacyTokenTx',
  'initBurningRequestTx',
  'initWithdrawRewardTx',
  'staking',
  'generateBLSKeyPairFromSeed',
  'initPRVContributionTx',
  'initPTokenContributionTx',
  'initPRVTradeTx',
  'initPTokenTradeTx',
  'withdrawDexTx',
  'hybridDecryptionASM',
  'hybridEncryptionASM',
  'stopAutoStaking',
  'generateIncognitoContractAddress',
  'withdrawSmartContractBalance',
  'sign0x',
  'signKyber',
  'getSignPublicKey',
  'signPoolWithdraw',
];
const syncMethods = [
  'scalarMultBase',
  'generateKeyFromSeed'
];

const log = (...args) => null;

try {
  asyncMethods.forEach(methodName => {
    global[methodName] = (data, time) => {
      return new Promise(async (resolve, reject) => {
        try {
          log(`${methodName} called with params`, data);

          if (requiredTimeMethods.includes(methodName)) {
            PrivacyGo[methodName](data, time, function(error, result) {
              if (error) {
                reject(error);
              }

              log(`${methodName} called successfully with result`, result);
              return resolve(result);
            });
          } else {
            PrivacyGo[methodName](data, function (error, result) {
              if (error) {
                reject(error);
              }

              log(`${methodName} called successfully with result`, result);
              return resolve(result);
            });
          }
        } catch (e) {
          log(`${methodName} called with error`, e);
          reject(e);
        }
      });
    };
  });

  syncMethods.forEach(methodName => {
    global[methodName] = (input) => {
      log(`${methodName} called with params`, input);

      const rs = PrivacyGo[methodName](input);
      log(`${methodName} called successfully with result`, rs);

      if (rs === null) {
        throw new Error(`${methodName} go module called with error`);
      }
      return rs;
    };
  });

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
    }
  };

  return global.signPoolWithdraw(JSON.stringify(args));
};

/**
 * Get sign public key
 * @param {string} privateKey
 * @returns {Promise<string>} signPublicKeyEncode
 */
export const getSignPublicKey = (privateKey) => {
  if (!privateKey) {
    throw new Error('Private key is missing');
  }

  const args = {
    data: {
      privateKey,
    }
  };

  return global.getSignPublicKey(JSON.stringify(args));
};
