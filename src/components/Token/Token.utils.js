import convert from '@utils/convert';
import format from '@utils/format';
import Fuse from 'fuse.js';
import toLower from 'lodash/toLower';

export const handleFilterTokenByKeySearch = ({ tokens, keySearch }) => {
  let _keySearch = toLower(keySearch?.trim());
  const options = {
    includeScore: false,
    keys: [
      'displayName',
      'name',
      'networkName',
      'symbol',
      'pSymbol',
      'contractId',
      'tokenId',
    ],
  };
  const fuse = new Fuse(tokens, options);
  const result = fuse.search(_keySearch).map((result) => result.item);
  return result;
};

export const formatPrice = (price, toNumber = false) => {
  const pDecimals = 9;
  const originalAmount = convert.toOriginalAmount(price, pDecimals, true) || 0;
  const result = format.amountVer2(originalAmount, pDecimals);
  return toNumber ? convert.toNumber(result, true) : result;
};

export const formatAmount = (
  price,
  amount,
  pDecimals,
  togglePDecimals,
  decimalDigits,
  toNumber = false,
) => {
  // format Amount to origin
  const priceFormat = formatPrice(price, true) || 0;

  // format amount with has decimalDigits
  // const formatAmount = format.amount(amount, pDecimals, true, decimalDigits);
  const formatAmount = format.amountVer2(amount, pDecimals);

  const totalAmountNumber = convert.toNumber(formatAmount, true) * priceFormat;

  const amountOriginalFormat =
    convert.toOriginalAmount(totalAmountNumber, togglePDecimals, true) || 0;

  const amountBaseToggle = format.amount(
    amountOriginalFormat,
    togglePDecimals,
    true,
    decimalDigits,
  );

  return toNumber ? convert.toNumber(amountBaseToggle, true) : amountBaseToggle;
};
