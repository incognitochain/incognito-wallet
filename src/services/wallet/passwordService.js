import { CONSTANT_CONFIGS, CONSTANT_KEYS } from '@src/constants';
import storage from '@src/services/storage';
import CryptoJS from 'crypto-js';

const PASSWORD_DURATION_IN_MS = 7 * 24 * 3600 * 1000; // 7 days

export function clearPassword() {
  storage.removeItem(CONSTANT_KEYS.PASSPHRASE_KEY);
}

export async function getPassphrase() {
  // try {
  //   let pass = await storage.getItem(CONSTANT_KEYS.PASSPHRASE_KEY);
  //   // fix for old user < 3.2.6
  //   pass = _.isEmpty(pass)? await storage.getItem(CONSTANT_KEYS.PASSPHRASE_KEY_REVERVE):pass;
  //   if (!pass) return;
  //   pass = CryptoJS.AES.decrypt(
  //     pass,
  //     CONSTANT_CONFIGS.PASSWORD_SECRET_KEY
  //   ).toString(CryptoJS.enc.Utf8);
  //   const [password, expired] = pass.split(':');
  //   if (!password || !expired) return CONSTANT_CONFIGS.PASSPHRASE_WALLET_DEFAULT;
  //
  //   // disabled check expired time
  //   // if (Date.now() > parseInt(expired, 10)) {
  //   //   return;
  //   // }
  //   return password || CONSTANT_CONFIGS.PASSPHRASE_WALLET_DEFAULT;
  // } catch (e) {
  //   return CONSTANT_CONFIGS.PASSPHRASE_WALLET_DEFAULT;
  // }

  return CONSTANT_CONFIGS.PASSPHRASE_WALLET_DEFAULT;
}

export async function hasPassword() {
  return !!(await getPassphrase());
}

export function savePassword(pass) {
  try {
    const expired = Date.now() + PASSWORD_DURATION_IN_MS;
    const toBeSaved = CryptoJS.AES.encrypt(
      `${pass}:${expired}`,
      CONSTANT_CONFIGS.PASSWORD_SECRET_KEY
    ).toString();
    return storage.setItem(CONSTANT_KEYS.PASSPHRASE_KEY, toBeSaved);
  } catch {
    throw new Error('Can not save your password, please try again');
  }
}
