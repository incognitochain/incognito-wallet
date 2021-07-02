import { NativeModules } from 'react-native';
import { ExHandler } from './exception';

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
  'generateBTCMultisigAddress',
];
try {
  console.log('INIT GOMOBILE');
  global.__gobridge__ = Object.assign({}, PrivacyGo);
  global.__gobridge__.ready = true;
  console.log(asyncMethods.forEach((name) => typeof global.__gobridge__[name]));
  console.log('GO modules were loaded');
} catch (e) {
  console.error('GO modules can not loaded');
  new ExHandler(e).showErrorToast();
}
