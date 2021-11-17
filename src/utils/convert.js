/* eslint-disable import/no-cycle */
import _ from 'lodash';
import { getDecimalSeparator } from '@src/resources/separator';
import BigNumber from 'bignumber.js';
import format from './format';

const checkAmount = (amount) => {
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
      if (!originAmount) {
        return 0;
      }
      const amount = new BigNumber(originAmount).dividedBy(
        new BigNumber('10').pow(Number(decimals) ? decimals : 0),
      );
      if (amount.isNaN()) {
        return 0;
      }
      return amount.toNumber();
    } catch (error) {
      console.log('CONVERT TO HUMAN AMOUNT ERROR', originAmount, decimals);
      return 0;
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
    let originalAmount = 0;
    try {
      const amount = toNumber(humanAmount);
      checkAmount(amount);
      // Use big number to solve float calculation problem
      // For example: 0.5000001 * 1e9 = 500000099.99999994
      // The result should be 500000100
      const decision_rate = Number(decimals) ? 10 ** Number(decimals) : 1;
      if (round) {
        return Math.floor(
          BigNumber(amount)
            .multipliedBy(BigNumber(decision_rate))
            .toNumber(),
        );
      }
      originalAmount = BigNumber(amount)
        .multipliedBy(BigNumber(decision_rate))
        .toNumber();
    } catch (error) {
      originalAmount = 0;
      console.log('toOriginalAmount-error', error);
    }
    return originalAmount;
  },

  toRealTokenValue(tokens, tokenId, value) {
    const token = tokens.find((item) => item.id === tokenId);
    return value / Math.pow(10, token?.pDecimals || 0);
  },

  toNumber,

  toInput(text) {
    if (typeof text !== 'string') {
      return text;
    }

    if (getDecimalSeparator() === ',') {
      text = text.replace(/\./g, '');
    }

    if (getDecimalSeparator() === '.') {
      text = text.replace(/,/g, '');
    }

    return text;
  },

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
  toHumanAmountVer2(humanAmount, decimals) {
    let amount = 0;
    try {
      const originalAmount = this.toOriginalAmount(humanAmount, decimals);
      amount = format.amountVer2(originalAmount, decimals);
      amount = this.toNumber(amount, true);
    } catch (error) {
      console.log('amountFromHumanAmountV2-error', error);
    }
    return amount;
  },
};

export const formatTime = (seconds) => {
  let h = Math.floor(seconds / 3600),
    m = Math.floor(seconds / 60) % 60,
    s = seconds % 60;
  if (h < 10) h = '0' + h;
  if (m < 10) m = '0' + m;
  if (s < 10) s = '0' + s;
  return h + ':' + m + ':' + s;
};
