import {CONSTANT_CONFIGS} from '@src/constants';
import Axios from 'axios';
import { getSuffixCode } from '@components/HuntQRCode/HuntQRCode.utils';

export const apiGetQrCodeHunt = (code) => {
  return new Promise((resolve, reject) => {
    const suffixCode = getSuffixCode(code);
    if (!suffixCode) {
      reject();
      return;
    }
    const url = CONSTANT_CONFIGS.HUNT_CONFIG_QR_CODE() + suffixCode;
    Axios.get(url)
      .then(res => res?.data?.Data)
      .then(result => resolve(result))
      .catch(error => reject(error));
  });
};