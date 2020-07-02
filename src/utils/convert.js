import _ from 'lodash';
import { getDecimalSeparator } from '@src/resources/separator';
import BigNumber from 'bignumber.js';

const checkAmount = amount => {
  if (!Number.isFinite(amount))
    throw new Error('Can not format invalid amount');
};

const replaceDecimals = (text, autoCorrect = false) => {
  if (typeof text !== 'string') {
    return text;
  }

  if (
    getDecimalSeparator() === ',' &&
    !text?.includes?.('e+') &&
    !text?.includes?.('e-')
  ) {
    text = text.replace(/\./g, '_');
    text = text.replace(/,/g, '.');
    text = text.replace(/_/g, ',');
  }

  if (autoCorrect) {
    text = text.replace(/,/g, '');
  }

  return text;
};

const toNumber = (text, autoCorrect = false) => {
  const number = replaceDecimals(text, autoCorrect);

  return _.toNumber(number);
};

export default {
  /**
   *
   * @param {number} originAmount
   * @param {number} decimals
   * Convert original amount (usualy get from backend) to human readable amount or display on frontend
   */
  toHumanAmount(originAmount, decimals) {
    try {
      const amount = toNumber(originAmount);
      checkAmount(amount);

      const decision_rate = Number(decimals) ? 10 ** Number(decimals) : 1;
      return amount / decision_rate;
    } catch {
      return originAmount;
    }
    /**
     *
     * @param {number} humanAmount
     * @param {number} decimals
     * @param {boolean} round
     * Convert human readable amount (display on frontend) to original amount
     */
  },
  toOriginalAmount(humanAmount, decimals, round = true) {
    const amount = toNumber(humanAmount);
    checkAmount(amount);

    const decision_rate = Number(decimals) ? 10 ** Number(decimals) : 1;
    if (round) {
      return Math.floor(amount * decision_rate);
    }

    return amount * decision_rate;
  },

  toRealTokenValue(tokens, tokenId, value) {
    const token = tokens.find(item => item.id === tokenId);
    return value / Math.pow(10, token?.pDecimals || 0);
  },

  toNumber,

  toHash(text) {
    let hash = 0,
      i,
      chr;
    if (text.length === 0) return '';
    for (i = 0; i < text.length; i++) {
      chr = text.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
  },

  toPDecimals(number, token) {
    return BigNumber(replaceDecimals(number, true))
      .dividedBy(BigNumber(10).pow(token.decimals))
      .multipliedBy(BigNumber(10).pow(token.pDecimals))
      .dividedToIntegerBy(1)
      .toNumber();
  },

  toDecimals(number, token) {
    return BigNumber(replaceDecimals(number, true))
      .dividedBy(BigNumber(10).pow(token.pDecimals))
      .multipliedBy(BigNumber(10).pow(token.decimals))
      .dividedToIntegerBy(1)
      .toFixed(0);
  },
};

export const formatTime = seconds => {
  let h = Math.floor(seconds / 3600),
    m = Math.floor(seconds / 60) % 60,
    s = seconds % 60;
  if (h < 10) h = '0' + h;
  if (m < 10) m = '0' + m;
  if (s < 10) s = '0' + s;
  return h + ':' + m + ':' + s;
};
