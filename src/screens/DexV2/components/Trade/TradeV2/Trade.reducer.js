import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
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
  ACTION_CLEAR_PDEX_HISTORIES,
} from '@screens/DexV2/components/Trade/TradeV2/Trade.constant';
import { PRV } from '@services/wallet/tokenService';
import {
  NETWORK_FEE_PRV,
  PRIORITY_KEY,
  PRIORITY_PDEX
} from '@screens/DexV2/components/Trade/TradeV2/Trade.appConstant';

const initPDexPair = {
  loadingPair:  false, // @loading pull request
  pairs:        [],
  tokens:       [],
  pairTokens:   [],
  shares:       [],
  erc20Tokens:  [],
};

export const initFee = {
  fee:              NETWORK_FEE_PRV.fee,
  feeToken:         NETWORK_FEE_PRV.feeToken,

  originalFee:      NETWORK_FEE_PRV.fee,
  originalFeeToken: NETWORK_FEE_PRV.feeToken,

  canChooseFee:     false
};

const priority = {
  priorityList:     PRIORITY_PDEX,
  priority:         PRIORITY_KEY.MEDIUM,
};

const initInput = {
  inputText:    '',
  inputValue:   null,
};

const initOutput = {
  outputText:     '',
  minimumAmount:  0,
  quote:          null,
};

const initTradeInfoPro = {
  slippageText: '1',
  slippage: 1,
  lastUsedSlippage: 1,
};

const initBalance = {
  inputBalance: null,
  inputBalanceText: '',
  prvBalance: null,
  lastInputToken: null,
  lastAccount: null
};

// This state can be clear when screen unmount
const initStateClear = {
  ...initPDexPair,
  ...initFee,
  ...priority,
  ...initTradeInfoPro,
  ...initInput,
  ...initOutput,
  ...initBalance,

  inputToken:   PRV,
  outputToken:  null,
  pair:         [], // Couple Pair,
  outputList:   [], // Change when inputToken change,
  loadingBox:   null,

  pdexHistories: [],
  historiesPage: -1,
  reachedHistories: false,
};

const initialState = {
  ...initStateClear,
};

const tradeReducer = (state = initialState, action) => {
  switch (action.type) {
  case ACTION_CLEAR_TRADE_DATA: {
    return {
      ...state,
      ...initStateClear,
    };
  }
  case ACTION_UPDATE_INPUT_TOKEN: {
    const { inputToken } = action;
    return {
      ...state,
      inputToken,
    };
  }
  case ACTION_UPDATE_OUTPUT_TOKEN: {
    const { outputToken, outputList } = action?.payload;
    if (outputList) {
      state = {
        ...state,
        outputList
      };
    }
    return {
      ...state,
      outputToken,
    };
  }
  case ACTION_UPDATE_LOADING_PAIR: {
    const { loadingPair } = action;
    return {
      ...state,
      loadingPair,
    };
  }
  case ACTION_UPDATE_PAIR_DATA: {
    const {
      pairs,
      tokens,
      pairTokens,
      shares,
      erc20Tokens,
    } = action?.payload;
    return {
      ...state,
      pairs,
      tokens,
      pairTokens,
      shares,
      erc20Tokens,
    };
  }
  case ACTION_UPDATE_COUPLE_PAIR: {
    const { pair } = action;
    return {
      ...state,
      pair,
    };
  }
  case ACTION_UPDATE_TRADE_FEE: {
    const { payload } = action;
    /* fee, feeToken, originalFee, originalFeeToken, canChooseFee*/
    return {
      ...state,
      ...payload
    };
  }
  case ACTION_UPDATE_TRADE_TEXT_VALUE: {
    // @payload can contain
    // @inputText, @inputValue, @outputText, @minimumAmount, @quote
    const { payload } = action;
    return {
      ...state,
      ...payload
    };
  }
  case ACTION_UPDATE_LOADING_INPUT_BOX: {
    const { loadingBox } = action;
    return {
      ...state,
      loadingBox
    };
  }
  case ACTION_CLEAR_FEE: {
    return {
      ...state,
      ...initFee,
      ...priority
    };
  }
  case ACTION_UPDATE_SLIPPAGE: {
    const { payload } = action;
    return {
      ...state,
      ...payload
    };
  }
  case ACTION_UPDATE_PRIORITY: {
    const { payload } = action;
    return {
      ...state,
      ...payload
    };
  }
  case ACTION_RETRY_TRADE_INFO: {
    const {
      originalFee,
      originalFeeToken,
    } = state;
    return {
      ...state,
      ...initTradeInfoPro,
      priority: PRIORITY_KEY.MEDIUM,
      fee: originalFee,
      feeToken: originalFeeToken
    };
  }
  case ACTION_UPDATE_BALANCE: {
    const { payload } = action;
    return {
      ...state,
      ...payload,
    };
  }
  case ACTION_UPDATE_PDEX_HISTORIES: {
    const { payload } = action;
    const { histories, historiesPage, reachedHistories } = payload;
    return {
      ...state,
      pdexHistories: histories,
      historiesPage: historiesPage,
      reachedHistories
    };
  }
  case ACTION_CLEAR_PDEX_HISTORIES: {
    return {
      ...state,
      pdexHistories: [],
      historiesPage: -1,
      reachedHistories: false,
    };
  }
  default:
    return state;
  }
};

const persistConfig = {
  key: 'trade',
  storage: AsyncStorage,
  whitelist: [''],
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persistConfig, tradeReducer);
