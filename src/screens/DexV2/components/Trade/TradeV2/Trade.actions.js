import {
  ACTION_CLEAR_TRADE_DATA,
  ACTION_UPDATE_INPUT_TOKEN,
  ACTION_UPDATE_LOADING_PAIR,
  ACTION_UPDATE_OUTPUT_TOKEN,
  ACTION_UPDATE_PAIR_DATA,
  ACTION_UPDATE_COUPLE_PAIR,
  ACTION_UPDATE_TRADE_FEE,
  ACTION_UPDATE_TRADE_TEXT_VALUE,
  ACTION_UPDATE_LOADING_INPUT_BOX,
  ACTION_CLEAR_FEE,
  ACTION_UPDATE_SLIPPAGE,
  ACTION_UPDATE_PRIORITY,
  ACTION_RETRY_TRADE_INFO,
  ACTION_UPDATE_BALANCE,
  ACTION_UPDATE_PDEX_HISTORIES,
  ACTION_CLEAR_PDEX_HISTORIES
} from '@screens/DexV2/components/Trade/TradeV2/Trade.constant';
import {
  calculateInputIncognitoNetWork,
  calculateOutputERC20NetWork,
  calculateOutputIncognitoNetWork,
  calculatorFee,
  calculatorOutputWithSlippage,
  checkMethodGetNetworkTrading,
  getOutputTextAndOutputValue,
  filterOutputToken,
  getCouplePair,
  getInputTextAndInputValue,
  getTradingFee,
  calculatorInputERC20Network,
  getInputBalance, calculatorOriginalOutputSlippage, getSlippagePercent,
} from '@screens/DexV2/components/Trade/TradeV2/Trade.utils';
import { debounce, orderBy, uniqBy } from 'lodash';
import { actionLogEvent } from '@screens/Performance';
import { PRIORITY_PDEX, TRADE_LOADING_VALUE } from '@screens/DexV2/components/Trade/TradeV2/Trade.appConstant';
import {accountServices} from '@services/wallet';
import {defaultAccountSelector} from '@src/redux/selectors/account';
import {walletSelector} from '@src/redux/selectors/wallet';
import {LIMIT} from '@screens/DexV2/constants';

/** Change InputToken
 * @param {object} inputToken
 */
export const actionUpdateInputToken = (inputToken) => ({
  type: ACTION_UPDATE_INPUT_TOKEN,
  inputToken
});

/**
 * Change OutputToken data
 * @param {Object} payload
 *
 * @param {Object} payload.outputToken
 * @param {array} payload.outputList
 */
export const actionUpdateOutputToken = (payload) => ({
  type: ACTION_UPDATE_OUTPUT_TOKEN,
  payload
});

/** When use change InputToken, filter outputList pair with InputToken */
export const actionFilterOutputToken = () => async (dispatch, getState) => {
  try {
    const trade = getState()?.trade;
    const {
      inputToken,
      outputToken,
      pairs,
      pairTokens
    } = trade;

    /** List output pair with InputToken */
    const { newOutputToken, outputList } = filterOutputToken({
      inputToken,
      outputToken,
      pairs,
      pairTokens
    });
    dispatch(actionUpdateOutputToken({
      outputToken: newOutputToken,
      outputList
    }));
  } catch (error) {
    console.debug('FILTER OUTPUT LIST', error);
  }
};

/**
 * Loading when reload or first time load screen
 * @param {boolean} loadingPair
 */
export const actionUpdateLoadingPair = (loadingPair) => ({
  type: ACTION_UPDATE_LOADING_PAIR,
  loadingPair
});

/** Unmount screen clear data */
export const actionClearTradeData = () => ({
  type: ACTION_CLEAR_TRADE_DATA,
});

/** Load all Pairs from api @getPairsData */
export const actionUpdatePairData = (payload) => ({
  type: ACTION_UPDATE_PAIR_DATA,
  payload
});

/** Get Pair from InputToken and OutputToken, Pairs */
export const actionUpdateCouplePair = (pair) => ({
  type: ACTION_UPDATE_COUPLE_PAIR,
  pair
});

/** Filter pair from InputToken and OutputToken */
export const actionGetCouplePair = () => async (dispatch, getState) => {
  try {
    const trade = getState()?.trade;
    const {
      inputText,
      inputToken,
      outputToken,
      pairs,
    } = trade;
    const params  = { inputToken, outputToken, pairs };
    const pair    = getCouplePair(params);
    dispatch(actionUpdateCouplePair(pair));

    // pair did change, inputText have value, calculator again
    if (inputText) {
      dispatch(actionChangeInputText(inputText));
    }
  } catch (error) {
    console.debug('GETTING PAIR WITH ERROR', error);
  }
};

/** Trade on ERC20 network, loading output when get data  */
export const actionUpdateLoadingBox= (loadingBox) => ({
  type: ACTION_UPDATE_LOADING_INPUT_BOX,
  loadingBox
});

/** Clear fee before calculator fee */
export const actionClearFee = () => ({
  type: ACTION_CLEAR_FEE,
});

/**
 * Update network fee when trade
 * @param {Object} payload     // Include network fee data Fee data
 *
 * @param {number} payload.fee // Fee can change by Priority
 * @param {number} payload.originalFee
 * @param {Object} payload.feeToken
 * @param {Object} payload.originalFeeToken,
 */
export const actionUpdateTradeFee = (payload) => ({
  type: ACTION_UPDATE_TRADE_FEE,
  payload
});

/**
 * Get network fee, PRV have network fee is 400*1e9 PRV
 * Another token calculator network fee
 */
export const actionGetNetworkFee = () => async (dispatch, getState) => {
  try {
    dispatch(actionClearFee());
    const trade   = getState()?.trade;
    const payload = calculatorFee(trade);
    dispatch(actionUpdateTradeFee(payload));
  } catch (error) {
    console.debug('GETTING SINGLE PAIR WITH ERROR', error);
  }
};

/**
 * Update input, output data
 * @param {Object} payload  // Include network fee data Fee data
 *
 * @param {string} payload.inputText // Fee can change by Priority
 * @param {number} payload.inputValue
 * @param {string} payload.outputText
 * @param {number} payload.minimumAmount,
 * @param {Object} payload.quote,
 */
export const actionUpdateTextValue = (payload) => ({
  type: ACTION_UPDATE_TRADE_TEXT_VALUE,
  payload
});

/** Debounce action dispatch */
export const asyncActionDebounced = (payload, closure) => (dispatch, getState) => (
  closure(dispatch, getState, payload)
);

/**
 * Action helper when update text
 * @param {Object} payload
 *
 * @param {Object} payload.newPriorityList
 * @param {number} payload.lastUsedSlippage
 * @param {number} payload.slippage
 */
export const actionUpdateNeededValueWhenChangeText = (payload) => dispatch => {
  try {
    const {
      newPriorityList,
      lastUsedSlippage,
      slippage
    } = payload;

    dispatch(actionUpdatePriority({
      priorityList: newPriorityList
    }));

    if (lastUsedSlippage !== slippage) {
      dispatch(actionUpdateSlippage({
        lastUsedSlippage: slippage
      }));
    }
  } catch (e) {/*Ignored Error*/}
};


/**------------------------------------------------------
 *------------------ START TYPING INPUT -----------------
 * ------------------------------------------------------
 */

/**
 * Debounce function
 * When change Input -> update output
 * Calculator output through PKyber, Uniswap
 */
const debouncedGetOutputERC20Network = debounce(async (dispatch, getState, payload) => {
  try {
    const trade = getState()?.trade;
    const {
      inputToken,
      outputToken,
      lastUsedSlippage,
      slippage
    } = trade;
    const { inputValue } = payload;
    const {
      minimumAmount,
      outputText,
      quote,
      newPriorityList
    } = await calculateOutputERC20NetWork({
      inputToken,
      outputToken,
      inputValue,
      slippage
    });

    dispatch(actionUpdateNeededValueWhenChangeText({
      newPriorityList,
      lastUsedSlippage,
      slippage
    }));

    const outputParams = { minimumAmount, quote, outputText };
    await dispatch(actionUpdateTextValue(outputParams));

  } catch (error) {
    console.debug('GETTING OUTPUT TEXT ERROR', error);
  } finally {
    dispatch(actionUpdateLoadingBox(null));
  }

}, 1000);

export const getOutputIncognitoNetwork = (payload) => async (dispatch, getState) => {
  try {
    const { inputValue, inputText } = payload;
    const { trade } = getState();
    const { pair, inputToken, outputToken, slippage, lastUsedSlippage } = trade;

    const {
      minimumAmount,
      quote,
      outputText
    } = calculateOutputIncognitoNetWork({
      pair,
      inputToken,
      inputValue,
      outputToken,
      slippage,
    });

    dispatch(actionUpdateNeededValueWhenChangeText({
      newPriorityList: PRIORITY_PDEX,
      lastUsedSlippage,
      slippage
    }));

    const outputParams = { inputText, inputValue, minimumAmount, quote, outputText, };
    dispatch(actionUpdateTextValue(outputParams));
  } catch (e) {/*Ignored Error*/}
};

/**
 * Change Input Text, calculator output
 *
 * Method call, If missing, add more
 * @actionGetCouplePair
 * @debouncedLoadInputBalance
 * @handleChoosePriority // Change Priority calculator input again
 * @onRetryTradeInfo
 * @loadPairs
 */
export const actionChangeInputText = (newText) => async (dispatch, getState) => {
  try {
    const trade = getState()?.trade;
    const {
      inputToken,
      outputToken,
      loadingBox,
      fee,
      feeToken,
      priority,
      priorityList,
      slippage
    } = trade;
    const { inputText, inputValue } = getInputTextAndInputValue({
      inputToken,
      fee,
      feeToken,
      priority,
      priorityList,
      newText
    });
    /** input = 0, clear output */
    if (!inputValue || slippage >= 100) {
      debouncedGetOutputERC20Network.cancel();
      dispatch(actionUpdateLoadingBox(null));
      const actionPayload = {
        inputText,
        inputValue,
        minimumAmount: 0,
        quote: null,
        outputText: '0',
      };
      return dispatch(actionUpdateTextValue(actionPayload));
    }

    /** Check what network trade on */
    const {
      validToken,
      isERC20NetWork
    } = checkMethodGetNetworkTrading(inputToken, outputToken);

    /** If @validToken, Can trade */
    if (validToken) {
      if (isERC20NetWork) {
        /** Trade on ERC20 Network */

        if (!loadingBox) dispatch(actionUpdateLoadingBox(TRADE_LOADING_VALUE.OUTPUT));
        debouncedGetOutputERC20Network.cancel();
        dispatch(asyncActionDebounced({ inputValue }, debouncedGetOutputERC20Network));
      } else {
        /** Trade on Incognito Network */
        dispatch(getOutputIncognitoNetwork({ inputValue, inputText }));
        return;
      }
    }
    dispatch(actionUpdateTextValue({ inputText, inputValue }));
  } catch (error) {
    console.debug('GETTING INPUT TEXT ERROR', error);
  }
};

/**-----------------------------------------------
 * -------------- END TYPING INPUT ---------------
 * -----------------------------------------------
 */


/**-------------------------------------------------------
 *------------------ START TYPING OUTPUT -----------------
 * -------------------------------------------------------
 */

export const getInputIncognitoNetwork = (payload) => async (dispatch, getState) => {
  try {
    const { outputValue, outputText } = payload;
    const { trade } = getState();
    const {
      pair,
      inputToken,
      outputToken,
      feeToken,
      fee,
      priority,
      priorityList,
      slippage,
      lastUsedSlippage,
    } = trade;

    const formatOutput = calculatorOriginalOutputSlippage(outputValue, slippage);

    const params = {
      pair,
      inputToken,
      outputValue: formatOutput,
      outputToken,
      feeToken,
      fee,
      priority,
      priorityList,
    };
    const { inputText, inputValue, quote } = calculateInputIncognitoNetWork(params);

    dispatch(actionUpdateNeededValueWhenChangeText({
      newPriorityList: PRIORITY_PDEX,
      lastUsedSlippage,
      slippage
    }));

    const actionParams = {
      inputText,
      inputValue,
      minimumAmount: outputValue,
      outputText,
      quote,
    };

    dispatch(actionUpdateTextValue(actionParams));
  } catch (e) {/*Ignored Error*/}
};

/**
 * Debounce function
 * When change Input -> update output
 * Calculator output through PKyber, Uniswap
 */
const debouncedGetInputERC20 = debounce(async (dispatch, getState, payload) => {
  try {
    const trade = getState()?.trade;
    const {
      inputToken,
      outputToken,
      lastUsedSlippage,
      slippage,
    } = trade;
    const { outputValue } = payload;
    const formatOutput = calculatorOriginalOutputSlippage(outputValue, slippage);

    const {
      inputValue,
      inputText,
      quote,
      newPriorityList,
    } = await calculatorInputERC20Network({
      inputToken,
      outputToken,
      outputValue: formatOutput,
    });

    dispatch(actionUpdateNeededValueWhenChangeText({
      newPriorityList,
      lastUsedSlippage,
      slippage
    }));

    const inputParams = { inputValue, inputText, quote };
    await dispatch(actionUpdateTextValue(inputParams));

  } catch (error) {
    console.debug('GETTING INPUT TEXT ERROR', error);
  } finally {
    dispatch(actionUpdateLoadingBox(null));
  }

}, 1000);

/** Change Output Text, calculator input */
export const actionChangeOutputText = (newText) => async (dispatch, getState) => {
  try {
    const trade = getState()?.trade;
    const {
      inputToken,
      outputToken,
      loadingBox,
      slippage
    } = trade;

    if (!newText || slippage >= 100) {
      debouncedGetInputERC20.cancel();
      dispatch(actionUpdateLoadingBox(null));
      return dispatch(actionUpdateTextValue({
        outputText: newText,
        inputText: '',
        inputValue: 0
      }));
    }

    const  {
      validToken,
      isERC20NetWork
    } = checkMethodGetNetworkTrading(inputToken, outputToken);

    /** New Output */
    const {
      outputText,
      outputValue,
    } = getOutputTextAndOutputValue({ newText, outputToken });
    /** -----------  */

    /** If @validToken, Can trade */
    if (validToken) {
      if (isERC20NetWork) {
        /** Trade on ERC20 Network */
        if (!loadingBox) dispatch(actionUpdateLoadingBox(TRADE_LOADING_VALUE.INPUT));
        debouncedGetInputERC20.cancel();
        dispatch(asyncActionDebounced({ outputValue, outputText }, debouncedGetInputERC20));
      } else {
        /** Trade on Incognito Network */
        dispatch(getInputIncognitoNetwork({ outputValue, outputText }));
        return;
      }
    }
    dispatch(actionUpdateTextValue({ outputText, minimumAmount: outputValue }));

  } catch (error) {
    console.debug('CHANGE OUTPUT TEXT ERROR', error);
  }
};

/**-----------------------------------------------
 * -------------- END TYPING OUTPUT --------------
 * -----------------------------------------------
 */

/** LoggerView Help QC can test trade data */
export const actionLogTradeData = () => async (dispatch, getState) => {
  try {
    const trade = getState()?.trade;
    const {
      inputText,
      inputValue,
      outputText,
      minimumAmount,
      originalFee,
      originalFeeToken,
      fee,
      feeToken,
      priority,
      priorityList,
      slippage,
      lastUsedSlippage,
      quote
    } = trade;
    const log = {
      inputText,
      inputValue,
      outputText,
      outputValue: minimumAmount,
      fee: `${fee} ${feeToken?.symbol}`,
      tradingFee: `${getTradingFee(priority, priorityList)} PRV`,
      originalFee: `${originalFee} ${originalFeeToken?.symbol}`,
      slippage: slippage,
      lastSlippage: lastUsedSlippage,
      slippagePercent: getSlippagePercent(slippage),
      priority,
      priorityList: JSON.stringify(priorityList),
      expectAmount: quote?.expectAmount,
      maxAmountOut: quote?.maxAmountOut,
    };
    dispatch(actionLogEvent({ desc: log }));
  } catch (e) {/*Ignored*/}
};

/**
 * Slippage calculator minimum amount user accept can be received when trade
 * @param {Object} payload
 *
 * @param {string} payload.slippageText
 * @param {number} payload.slippage // current slippage
 * @param {number} payload.lastUsedSlippage // previous slippage, base on calculator original slippage
 */
export const actionUpdateSlippage = (payload) => ({
  type: ACTION_UPDATE_SLIPPAGE,
  payload
});

/**
 * When change slippage, if newSlippageValue != lastSlippageValue,
 * Calculator output
 */
export const actionChangeSlippage = (newSlippageValue, lastSlippageValue) => async (dispatch, getState) => {
  try {
    const trade = getState()?.trade;
    const { minimumAmount, outputToken, inputText } = trade;

    const paramsCalculatorOutput = {
      newSlippageValue,
      lastSlippageValue,
      outputValue: minimumAmount,
      outputToken
    };

    const {
      outputValue: newOutputValue,
      outputText: newOutputText
    } = calculatorOutputWithSlippage(paramsCalculatorOutput);

    if (newSlippageValue !== 100 && newOutputValue === 0) {
      dispatch(actionChangeInputText(inputText));
      return;
    }

    // Update lastUsedSlippage when calculator output value success
    dispatch(actionUpdateSlippage( { lastUsedSlippage: newSlippageValue }));

    // Did calculator new output Value, update data
    dispatch(actionUpdateTextValue({
      outputText: newOutputText,
      minimumAmount: newOutputValue
    }));

  } catch (error) {
    console.debug('CHANGE SLIPPAGE WITH ERROR: ', error);
  }
};

/**
 *  Priority higher make trade process faster, it is trading fee
 *  @param {object} payload
 *
 *  @param {string} payload.priority     // current priority user choose
 *  @param {object} payload.priorityList // priority options with different trading fee
 */
export const actionUpdatePriority = (payload) => ({
  type: ACTION_UPDATE_PRIORITY,
  payload
});

/** Retry clear data, calculator input again */
export const actionRetryTradeInfo = () => ({
  type: ACTION_RETRY_TRADE_INFO,
});

/**
 *  Load account Balance
 *  @param {object} payload
 *
 *  @param {string} payload.prvBalance
 *  @param {object} payload.inputBalance
 *  @param {object} payload.inputBalanceText
 *  @param {object} payload.inputBalance
 *  @param {object} payload.inputBalanceText
 */
export const actionUpdateBalance = (payload) => ({
  type: ACTION_UPDATE_BALANCE,
  payload
});

export const actionLoadInputBalance = (payload) => async (dispatch, getState) => {
  try {
    const { account, wallet } = payload;
    const trade = getState()?.trade;
    const {
      inputFee,
      inputToken,
      lastInputToken,
      lastAccount,
      outputText,
    } = trade;

    const {
      newInputText,
      prvBalance,
      inputBalance,
      inputBalanceText
    } = await getInputBalance({
      account,
      inputToken,
      wallet,
      inputFee
    });

    const tokenChange =
      lastInputToken !== inputToken
      || lastAccount !== account
      || (newInputText && (!outputText || outputText === '0'));

    if (tokenChange) {
      dispatch(actionChangeInputText(newInputText));
    }

    dispatch(actionUpdateBalance({
      prvBalance,
      inputBalance,
      inputBalanceText,
      lastInputToken: inputToken,
      lastAccount: account,
    }));

  } catch (error) {
    console.debug('TRADE LOAD INPUT BALANCE WITH ERROR: ', error);
  }
};

export const actionClearPDexHistory = () => ({
  type: ACTION_CLEAR_PDEX_HISTORIES,
});

const actionUpdatePDexHistory = (payload) => ({
  type: ACTION_UPDATE_PDEX_HISTORIES,
  payload
});

export const actionGetPDexHistory = ({ limit } = {}) => async (dispatch, getState) => {
  try {
    const state = getState();
    const account = defaultAccountSelector(state);
    const wallet = walletSelector(state);
    let { pdexHistories: oldHistories, historiesPage } = state.trade;

    const limitPage = limit || LIMIT;
    const page = historiesPage + 1;
    const offset = page * limitPage;

    const tasks = [
      await accountServices.getPDexHistories({
        account,
        wallet,
        limit: limitPage,
        offset,
      }),
      await accountServices.getPDexStorageHistories({
        account,
        wallet,
      })
    ];
    let [newHistories, storageHistories] = await Promise.all(tasks);
    const oldIds = oldHistories.map(item => item.requestTx);
    newHistories = newHistories.filter(item => !oldIds.includes(item.requestTx));
    let apiHistories = uniqBy(
      oldHistories.concat(newHistories.filter(item => !oldIds.includes(item.requestTx))),
      item => item.requestTx
    );

    const pendingStorage = [];
    storageHistories.forEach(history => {
      const notHave = apiHistories.some(item => item?.requestTx === history?.requestTx);
      if (!notHave) {
        pendingStorage.push(history);
      }
    });

    const mergeHistory = orderBy(
      apiHistories.concat(pendingStorage),
      [
        'requesttime',
      ],
      ['desc'],
    );

    console.log('mergeHistory: ', mergeHistory);

    dispatch(actionUpdatePDexHistory({
      histories: mergeHistory,
      historiesPage: page,
      reachedHistories: newHistories.length < limitPage
    }));
  } catch (error) {
    console.log('GET PDEX HISTORIES ERROR: ', error);
    // error
  }
};
