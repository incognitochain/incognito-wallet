import { NativeModules } from 'react-native';
import {getNodeTime} from '@services/wallet/RpcClientService';

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

const log = (...args) => console.log('GOMODULE', ...args);

try {
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
  ];
  const syncMethods = [
    'scalarMultBase',
    'generateKeyFromSeed'
  ];

  asyncMethods.forEach(methodName => {
    global[methodName] = (data) => {
      return new Promise(async (resolve, reject) => {
        try {
          log(`${methodName} called with params`, data);

          if (requiredTimeMethods.includes(methodName)) {
            const time = await getNodeTime();
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
