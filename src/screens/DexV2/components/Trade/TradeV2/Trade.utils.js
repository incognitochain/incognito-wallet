import { COINS } from '@src/constants';
import _, { isNaN, floor, cloneDeep, ceil, isEmpty } from 'lodash';
import { MAX_DEX_FEE } from '@components/EstimateFee/EstimateFee.utils';
// eslint-disable-next-line import/no-cycle
import {
  calculateOutputValue,
  calculateOutputValueCrossPool,
  calculateInputValueCrossPool,
} from '@screens/DexV2/components/Trade/utils';
import { MAX_PDEX_TRADE_STEPS } from '@screens/DexV2/constants';
import formatUtils from '@utils/format';
import convertUtil from '@utils/convert';
import accountService from '@services/wallet/accountService';
import { PRV } from '@services/wallet/tokenService';
import { apiGetQuote } from '@screens/DexV2';
import { initFee } from '@screens/DexV2/components/Trade/TradeV2/Trade.reducer';
import { PRV_ID } from '@screens/Dex/constants';

/**
 * Slippage percent decision outputValue,
 * Slippage percent is bigger, outputValue is bigger
 */
export const getSlippagePercent = (slippage) => (100 - slippage) / 100;

/**
 * filter outputList match with inputToken base on pairs, pairTokens
 * @param {Object} payload
 *
 * Calculator original outputValue
 * @param {Object}  payload.inputToken
 * @param {Object}  payload.outputToken
 * @param {array}   payload.pairs
 * @param {array}   payload.pairTokens
 *
 * @returns {Object}  output
 * @returns {array}   output.outputList
 * @returns {Object}  output.outputToken
 */
export const filterOutputToken = (payload) => {
  let newOutputToken = null;
  let outputList = [];
  try {
    const { inputToken, outputToken, pairs, pairTokens } = payload;
    newOutputToken = outputToken;

    if (pairs.some((pair) => pair.keys.includes(inputToken?.id))) {
      outputList = pairs
        .map((pair) => {
          const { keys } = pair;

          if (
            inputToken?.id === COINS.PRV_ID ||
            !keys.includes(inputToken?.id)
          ) {
            const id = pair.keys.find((key) => key !== COINS.PRV_ID);
            return pairTokens.find((token) => token.id === id);
          }
          return null;
        })
        .filter((item) => item && item.name && item.symbol);
      const prvToken = pairTokens.find((token) => token.id === COINS.PRV_ID);
      if (inputToken?.id !== COINS.PRV_ID && !outputList.includes(prvToken)) {
        outputList.push(prvToken);
      }
    }

    if (inputToken.address) {
      outputList = outputList.concat(
        pairTokens.filter(
          (token) => token?.address && token?.id !== inputToken?.id,
        ),
      );
    }
    outputList = _(outputList)
      .orderBy(
        [
          'priority',
          'hasIcon',
          (item) => item.symbol && item.symbol.toLowerCase(),
        ],
        ['asc', 'desc', 'desc', 'asc'],
      )
      .uniqBy((item) => item.id)
      .value();

    if (
      outputToken &&
      !outputList.find((item) => item.id === outputToken?.id)
    ) {
      newOutputToken = null;
    }
    newOutputToken = newOutputToken || outputList[0];
    return {
      newOutputToken,
      outputList,
    };
  } catch (error) {
    console.debug('TRADE FILTER OUTPUT LIST', error);
  }
};

/**
 * Get couple pair can trade with PRV from pairs
 * Calculator value can receive when trade
 * @param {Object} payload
 *
 * @param {Object}  payload.inputToken
 * @param {Object}  payload.outputToken
 * @param {array}   payload.pairs
 *
 * Can have 1 or 2 elements
 * If have 1, inputToken or OutputToken is PRV, can convert trade base on PRV
 * If have 2, inputToken & OutputToken != PRV, convert each element trade on PRV
 * @returns {array} output
 */
export const getCouplePair = (payload) => {
  try {
    const { inputToken, outputToken, pairs } = payload;
    if (inputToken && outputToken) {
      // InputToken or OutputToken is PRV
      if (inputToken?.id === COINS.PRV_ID || outputToken?.id === COINS.PRV_ID) {
        const pair = pairs.find(
          (item) =>
            item.keys.includes(inputToken?.id) &&
            item.keys.includes(outputToken?.id),
        );
        return [pair];
      } else {
        // Dont have PRV in InputToken & OutputToken
        const inPair = pairs.find(
          (item) =>
            item.keys.includes(inputToken?.id) &&
            item.keys.includes(COINS.PRV_ID),
        );
        const outPair = pairs.find(
          (item) =>
            item.keys.includes(outputToken?.id) &&
            item.keys.includes(COINS.PRV_ID),
        );
        if (inPair && outPair) {
          return [inPair, outPair];
        }
      }
    }
    return null;
  } catch (error) {
    console.debug('TRADE GET PAIR WITH ERROR', error);
  }
};

/** Network fee, fee minimum required to make 1 transaction */
export const calculatorFee = (payload) => {
  try {
    const { inputToken, outputToken, pairs } = payload;

    const prvFee = MAX_DEX_FEE;
    const prvFeeToken = COINS.PRV;

    // Input or Output is PRV, network fee = 400 *1e9 PRV
    if (inputToken?.id === COINS.PRV_ID || outputToken?.id !== COINS.PRV_ID) {
      return cloneDeep(initFee);
    }

    // Check can pair with PRV
    const prvPair = (pairs || []).find(
      (item) =>
        item.keys.includes(inputToken?.id) &&
        item.keys.includes(COINS.PRV_ID) &&
        item[COINS.PRV_ID] > 10000 * 1e9,
    );

    // Network fee is pToken, minus to inputText
    if (inputToken?.id !== COINS.PRV_ID && prvPair) {
      const outputValue = Math.max(
        calculateOutputValue(prvPair, prvFeeToken, prvFee, inputToken),
        MAX_PDEX_TRADE_STEPS * 20,
      );
      return {
        fee: outputValue,
        feeToken: inputToken,
        originalFee: outputValue,
        originalFeeToken: inputToken,
        canChooseFee: true,
      };
    }
    return cloneDeep(initFee);
  } catch (error) {
    console.debug('TRADE ESTIMATE FEE: ', error);
  }
};

/**
 * Type Input, clear separator
 *
 * @param {string} inputText
 * @param {number} pDecimal
 */
export const getText = (inputText, pDecimal) => {
  try {
    if (inputText.includes('e-')) {
      inputText = formatUtils.toFixed(
        convertUtil.toNumber(inputText, true),
        pDecimal,
      );
    }
    if (inputText.toString() === 'NaN') {
      inputText = '';
    }
    return inputText;
  } catch (error) {
    console.debug('TRADE GET INPUT TEXT WITH ERROR: ', error);
  }
};

/** From InputText, calculator InputValue, can be minus fee */
export const getInputValue = (payload) => {
  try {
    const {
      inputText,
      inputToken,
      fee,
      feeToken,
      priority,
      priorityList,
    } = payload;
    if (feeToken && inputText) {
      const number = convertUtil.toNumber(inputText, true);
      if (!isNaN(number) && number > 0) {
        const originalAmount = convertUtil.toOriginalAmount(
          number,
          inputToken?.pDecimals,
          inputToken.pDecimals !== 0,
        );
        const sumFee = sumTradingFeeAndNetworkFee({
          fee,
          feeToken,
          priority,
          priorityList,
        });
        return feeToken?.id === inputToken?.id
          ? originalAmount - sumFee
          : originalAmount;
      }
    }
    return 0;
  } catch (error) {
    console.debug('TRADE GET INPUT VALUE WITH ERROR: ', error);
  }
};

/**
 * Get InputText & InputValue when type input
 *
 * @param {Object} payload
 * @param {string} payload.newText
 * @param {Object} payload.inputToken
 * @param {number} payload.fee
 * @param {Object} payload.feeToken
 * @param {string} payload.priority
 * @param {Object} payload.priorityList
 */
export const getInputTextAndInputValue = (payload) => {
  try {
    const {
      inputToken,
      fee,
      feeToken,
      priority,
      priorityList,
      newText,
    } = payload;
    const inputText = feeToken ? getText(newText, inputToken?.pDecimals) : '';
    const inputValue =
      feeToken && inputText
        ? getInputValue({
          feeToken,
          inputText,
          inputToken,
          fee,
          priority,
          priorityList,
        })
        : 0;
    return {
      inputText,
      inputValue,
    };
  } catch (error) {
    console.debug('TRADE GET INPUT TEXT & VALUE WITH ERROR: ', error);
  }
};

export const calculateOutputIncognitoNetWork = (payload) => {
  try {
    const { pair, inputToken, inputValue, outputToken, slippage } = payload;
    const outputValue = calculateOutputValueCrossPool(
      pair,
      inputToken,
      inputValue,
      outputToken,
    );

    const minimumAmount = floor(outputValue * getSlippagePercent(slippage));

    let outputText = formatUtils.amountFull(
      minimumAmount,
      outputToken?.pDecimals,
    );

    if (outputValue === 0 || minimumAmount === 0 || isNaN(minimumAmount)) {
      outputText = 0;
    }

    outputText = outputText + '';

    return {
      minimumAmount,
      quote: null,
      outputText,
    };
  } catch (error) {
    console.debug('TRADE CALCULATOR TRADE STAGE INCOGNITO ERROR: ', error);
  }
};

/**
 * Trade on ERC20_NETWORK, typing Input
 *
 * @param {Object} payload
 * @param {Object} payload.inputToken
 * @param {Object} payload.outputToken
 * @param {number} payload.inputValue
 * @param {number} payload.slippage
 *
 * @return {Object} response
 * @return {number} response.minimumAmount
 * @return {string} response.outputText
 * @return {Object} response.quote
 */
export const calculateOutputERC20NetWork = async (payload) => {
  const { inputToken, outputToken, inputValue, slippage } = payload;

  let minimumAmount = 0;
  let outputText = '0';
  let quote = null;
  let newPriorityList = {};

  try {
    quote = await apiGetQuote({
      inputToken,
      outputToken,
      protocol: 'Kyber',
      amountIn: inputValue,
    });

    const { maxAmountOut, priorityList } = quote;
    newPriorityList = priorityList;
    minimumAmount = floor(maxAmountOut * getSlippagePercent(slippage));
    if (minimumAmount !== 0 && !isNaN(minimumAmount)) {
      outputText = formatUtils.amountFull(
        minimumAmount,
        outputToken?.pDecimals,
      );
    }
    return {
      minimumAmount,
      outputText,
      quote,
      newPriorityList,
    };
  } catch (error) {
    return {
      minimumAmount: 0,
      outputText: '0',
      quote: null,
      newPriorityList,
    };
  }
};

/** Check can trade in Incognito or ERC20 network */
export const checkMethodGetNetworkTrading = (inputToken, outputToken) => ({
  validToken: inputToken && outputToken && inputToken?.id !== outputToken?.id,
  isERC20NetWork: inputToken.address && outputToken.address,
});

/**
 * Get Balance
 *
 * @param {Object} payload
 * @param {Object} payload.account
 * @param {Object} payload.inputToken
 * @param {Object} payload.wallet
 * @param {Object} payload.tokenChange
 * @param {Object} payload.inputFee
 *
 *
 * @return {Object} response
 * @return {number} response.newInputText
 * @return {number} response.prvBalance
 * @return {number} response.inputBalance
 * @return {string} response.inputBalanceText
 * */
export const getInputBalance = async (payload) => {
  const { account, inputToken, wallet, inputFee } = payload;
  const token = inputToken;
  const balance = await accountService.getBalance(account, wallet, token.id);

  if (inputToken?.id !== token.id) {
    return;
  }

  let prvBalance = balance;
  if (token !== PRV) {
    prvBalance = await accountService.getBalance(account, wallet);
  }

  let newInputText = '';
  if (balance || balance > inputFee) {
    let humanAmount = convertUtil.toHumanAmount(balance, inputToken?.pDecimals);
    if (humanAmount < 1) {
      newInputText = formatUtils
        .toFixed(humanAmount, inputToken?.pDecimals)
        .toString();
    } else {
      newInputText = '1';
    }
  }
  return {
    newInputText,
    prvBalance,
    inputBalance: balance,
    inputBalanceText: formatUtils.amountFull(balance, token?.pDecimals),
  };
};

/**
 * Get OutputText & OutputValue when type output
 *
 * @param {Object} payload
 * @param {string} payload.newText
 * @param {Object} payload.outputToken
 */
export const getOutputTextAndOutputValue = (payload) => {
  try {
    const { newText, outputToken } = payload;

    const outputText = getText(newText, outputToken?.pDecimals);
    const outputNumber = convertUtil.toNumber(outputText, true);
    const outputValue = convertUtil.toOriginalAmount(
      outputNumber,
      outputToken?.pDecimals,
      outputToken.pDecimals !== 0,
    );
    return {
      outputText,
      outputValue,
    };
  } catch (e) {
    console.debug('CONVERT TO ORIGINAL OUTPUT WITH ERROR: ', e);
    return {
      outputText: '0',
      outputValue: 0,
    };
  }
};

/**
 * if network fee and trading fee same token type,
 * sum network fee and trading fee
 * trading fee always is PRV
 * */
export const sumTradingFeeAndNetworkFee = (payload) => {
  const { fee, feeToken, priority, priorityList } = payload;
  const tradingFee = getTradingFee(priority, priorityList);
  if (feeToken?.id !== PRV_ID) return fee;
  return tradingFee + fee;
};

/**
 * Change output, trade on Incognito Network,
 * calculator input base on pool size, new output user typing.
 * @param {Object} payload
 *
 * @param {Object} payload.pair
 * @param {Object} payload.inputToken
 * @param {Object} payload.outputToken
 * @param {Object} payload.feeToken
 * @param {number} payload.fee
 * @param {string} payload.priority
 * @param {Object} payload.priorityList
 *
 * @return {number} inputValue
 * @return {string} inputText
 * @return {object} quote
 */
export const calculateInputIncognitoNetWork = (payload) => {
  try {
    const {
      pair,
      inputToken,
      outputValue,
      outputToken,
      feeToken,
      fee,
      priority,
      priorityList,
    } = payload;

    // Calculator inputValue base on pool size
    const inputValue = calculateInputValueCrossPool(
      pair,
      inputToken,
      outputValue,
      outputToken,
    );

    let totalFee = 0;
    // fee token === input token, minus fee on input text
    if (
      inputValue !== 0 &&
      !isNaN(inputValue) &&
      feeToken?.id === inputToken?.id
    ) {
      const paramsCalculatorFee = { fee, feeToken, priority, priorityList };
      totalFee = sumTradingFeeAndNetworkFee(paramsCalculatorFee);
    }
    // input text display in UI, did add fee
    let inputText = formatUtils.amountFull(
      inputValue + totalFee,
      inputToken?.pDecimals,
    );

    if (inputValue === 0 || isNaN(inputValue)) {
      inputText = 0;
    }

    inputText = inputText + '';

    return {
      inputValue,
      inputText,
      quote: null,
    };
  } catch (error) {
    console.debug('TRADE CALCULATOR INCOGNITO NETWORK ERROR: ', error);
  }
};

export const calculatorInputERC20Network = async (payload) => {
  const { inputToken, outputToken, outputValue } = payload;

  let inputValue = 0;
  let inputText = '0';
  let quote = null;
  let newPriorityList = {};

  try {
    quote = await apiGetQuote({
      inputToken,
      outputToken,
      protocol: 'Kyber',
      amountOut: outputValue,
    });

    const { maxAmountIn, priorityList } = quote;

    newPriorityList = priorityList;

    if (maxAmountIn !== 0 && !isNaN(maxAmountIn)) {
      inputValue =
        ceil(
          formatUtils.convertDecimalsToPDecimals({
            number: maxAmountIn,
            decimals: inputToken.decimals,
            pDecimals: inputToken.pDecimals,
          }),
        ) || 0;
      inputText =
        formatUtils.amountFull(inputValue, inputToken?.pDecimals) || '0';
    }

    return {
      inputValue,
      inputText,
      quote,
      newPriorityList,
    };
  } catch (e) {
    console.debug('CALCULATOR INPUT ERC20 NETWORK WITH ERROR: ', e);
    return {
      inputValue: 0,
      inputText: '0',
      quote: null,
      newPriorityList,
    };
  }
};

/**
 * Calculator new outputValue, outputText base on new Slippage, used Slippage
 * @param {Object} payload
 *
 * have original outputValue, calculator new outputValue base on new Slippage
 * @param {number} payload.newSlippageValue
 *
 * Calculator original outputValue
 * @param {number} payload.lastSlippageValue
 *
 * Current output value, will change when calculator
 * @param {number} payload.outputValue
 * @param {number} payload.outputToken
 *
 * @returns {Object} output
 * @returns {number} output.outputValue
 * @returns {string} output.outputText
 */
export const calculatorOutputWithSlippage = (payload) => {
  try {
    const {
      newSlippageValue,
      lastSlippageValue,
      outputValue,
      outputToken,
    } = payload;

    const lastPercent = getSlippagePercent(lastSlippageValue);
    const newPercent = getSlippagePercent(newSlippageValue);

    const originalOutput = ceil(outputValue / lastPercent) || 0;
    const currentOutput = floor(originalOutput * newPercent) || 0;

    const currentOutputText =
      formatUtils.amountFull(currentOutput, outputToken?.pDecimals) || '0';

    return {
      outputValue: currentOutput,
      outputText: currentOutputText,
    };
  } catch (error) {
    console.debug('TRADE CALCULATOR OUTPUT SLIPPAGE ERROR: ', error);
  }
};

/**
 * Trading fee
 * @returns {number}
 */
export const getTradingFee = (priority, priorityList) => {
  if (!priority || !priorityList) return 0;
  return priorityList[priority]?.tradingFee;
};

export const validInput = (text) => !isEmpty(text) && text !== '0';

/**
 * Change Output, get original output with slippage
 *
 * @param {number} outputValue
 * @param {number} slippage
 */
export const calculatorOriginalOutputSlippage = (outputValue, slippage) =>
  ceil(outputValue / getSlippagePercent(slippage));
