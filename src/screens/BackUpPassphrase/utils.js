import { CustomError, ErrorCode } from '@services/exception';
import { wordList } from 'incognito-chain-web-js/build/wallet';

const NAME_PATTERN = /^[A-Za-z0-9]*$/;
const VALID_WORDS = [
  'key',
  'child',
  'artifact',
  'typical',
  'saturate',
  'seed',
];

const allWords = [...wordList, ...VALID_WORDS];

export const validateName = (name, list) => {
  if (name.length === 0 || !NAME_PATTERN.test(name)) {
    throw new CustomError(ErrorCode.invalid_master_key_name);
  }

  const existed = list.find(item => item.name.toLowerCase() === name.toLowerCase());

  if (existed) {
    throw new CustomError(ErrorCode.master_key_name_existed);
  }
};

export const validateMnemonic = (mnemonic) => {
  if (mnemonic.split(' ').length !== 12){
    return false;
  }

  return mnemonic.split(' ').every(word => allWords.includes(word));
};

export const validateMnemonicWithOtherKeys = (mnemonic, list) => {
  if (mnemonic.length === 0 || !validateMnemonic(mnemonic)) {
    throw new CustomError(ErrorCode.invalid_mnemonic);
  }

  const existed = list.find(item => item.mnemonic === mnemonic);

  if (existed) {
    throw new CustomError(ErrorCode.duplicate_mnemonic);
  }
};

