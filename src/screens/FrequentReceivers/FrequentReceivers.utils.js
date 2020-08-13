import { includes } from 'lodash';
import { validator } from '@src/components/core/reduxForm';
import { CONSTANT_COMMONS } from '@src/constants';
import walletValidator from 'wallet-address-validator';

const RECENTLY_MAX = 3;
const MIN_RECEIVER_TO_REACH_RECENTLY = 5;

export const isFieldExist = (
  field = '',
  value = '',
  message = '',
  receivers = [],
) => {
  const isExist = receivers.some((item) => item[field] === value);
  if (isExist) {
    return {
      error: true,
      message,
    };
  }
  return {
    error: false,
    message: '',
  };
};

export const getRecently = (receivers = []) =>
  receivers.length >= MIN_RECEIVER_TO_REACH_RECENTLY
    ? receivers
      .filter((receiver) => !!receiver?.recently)
      .sort((a, b) => b.recently - a.recently)
      .slice(0, RECENTLY_MAX)
    : [];

export const filterAddressByKey = (receivers = [], keySearch = '') =>
  receivers?.filter(
    (item) =>
      includes(item?.name.toLowerCase(), keySearch) ||
      includes(item?.address.toLowerCase(), keySearch),
  );

export const getExternalSymbol = (address) => {
  let externalSymbol = '';
  try {
    if (validator.isZILAddress(address)) {
      return CONSTANT_COMMONS.CRYPTO_SYMBOL.ZIL;
    }
    if (validator.isBNBAddress(address)) {
      return CONSTANT_COMMONS.CRYPTO_SYMBOL.BNB;
    }
    for (const SYMBOL in CONSTANT_COMMONS.CRYPTO_SYMBOL_UNSHIELD) {
      let symbol = CONSTANT_COMMONS.CRYPTO_SYMBOL_UNSHIELD[SYMBOL];
      if (symbol === CONSTANT_COMMONS.CRYPTO_SYMBOL_UNSHIELD.TOMO) {
        symbol = CONSTANT_COMMONS.CRYPTO_SYMBOL_UNSHIELD.ETH;
      }
      if (walletValidator.validate(address, symbol, 'both')) {
        return symbol;
      }
    }
  } catch (error) {
    console.debug(error);
  }
  return externalSymbol;
};
