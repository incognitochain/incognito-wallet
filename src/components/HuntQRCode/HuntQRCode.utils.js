import { CONSTANT_COMMONS } from '@src/constants';

const ENUM_QR_CODE = {
  SHIELD_UNSHIELD: 1,
  SEND_RECEIVE: 2,
  PROVIDE: 3
};

export const getSuffixCode = (code) => {
  let suffixCode = null;
  switch (code) {
  case CONSTANT_COMMONS.HISTORY.TYPE.UNSHIELD:
  case CONSTANT_COMMONS.HISTORY.TYPE.SHIELD:
    suffixCode = ENUM_QR_CODE.SHIELD_UNSHIELD;
    break;
  case CONSTANT_COMMONS.HISTORY.TYPE.SEND:
  case CONSTANT_COMMONS.HISTORY.TYPE.RECEIVE:
    suffixCode = ENUM_QR_CODE.SEND_RECEIVE;
    break;
  case CONSTANT_COMMONS.HISTORY.TYPE.PROVIDE:
    suffixCode = ENUM_QR_CODE.PROVIDE;
    break;
  }
  return suffixCode;
};