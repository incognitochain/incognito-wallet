import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel1 from 'redux-persist/es/stateReconciler/autoMergeLevel1';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import { persistReducer } from 'redux-persist';
import { PRV_ID } from '@src/constants/common';
import { ACCOUNT_CONSTANT } from 'incognito-chain-web-js/build/wallet';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_SET_SELL_TOKEN,
  ACTION_SET_BUY_TOKEN,
  ACTION_SET_FEE_TOKEN,
  ACTION_SET_FOCUS_TOKEN,
  ACTION_SET_SELECTING_TOKEN,
  ACTION_SET_SWAPING_TOKEN,
  ACTION_SET_INITIING_SWAP,
  ACTION_RESET,
  ACTION_SET_PERCENT,
  ACTION_FETCH_SWAP,
  ACTION_FETCHED_LIST_PAIRS,
  ACTION_FETCHING_ORDERS_HISTORY,
  ACTION_FETCHED_ORDERS_HISTORY,
  ACTION_FETCH_FAIL_ORDERS_HISTORY,
  ACTION_FETCHING_ORDER_DETAIL,
  ACTION_FETCHED_ORDER_DETAIL,
  ACTION_SET_DEFAULT_PAIR,
  ACTION_TOGGLE_PRO_TAB,
  PLATFORMS_SUPPORTED,
  KEYS_PLATFORMS_SUPPORTED,
  ACTION_CHANGE_SELECTED_PLATFORM,
  ACTION_SAVE_LAST_FIELD,
  ACTION_CHANGE_ESTIMATE_DATA,
  ACTION_SET_DEFAULT_EXCHANGE,
  ACTION_FREE_HISTORY_ORDERS,
  ACTION_SET_ERROR,
  ACTION_REMOVE_ERROR,
  ACTION_CHANGE_SLIPPAGE,
  ACTION_FETCHING_REWARD_HISTORY,
  ACTION_FETCHED_REWARD_HISTORY,
  ACTION_FETCH_FAIL_REWARD_HISTORY,
  ACTION_RESET_DATA,
  ACTION_SET_BEST_RATE_EXCHANGE,
  ACTION_SET_EXCHANGE_SUPPORT_LIST,
  ACTION_SET_RESET_SLIPPAGE,
  ACTION_ESTIMATE_TRADE_ERROR,
  ACTION_NAVIGATE_FROM_MARKET,
  ACTION_RESET_EXCHANGE_SUPPORTED,
  ACTION_SAVE_UNIFIED_ALERT_STATE_BY_ID,
  ACTION_ESTIMATE_COUNT,
  ACTION_NAVIGATE_TO_SELECT_TOKENS
} from './Swap.constant';

const initialState = {
  isFetching: false,
  isFetched: false,
  data: {
    [KEYS_PLATFORMS_SUPPORTED.incognito]: {
      // incognito
      feePrv: {},
      feeToken: {},
      error: null,
    },
    [KEYS_PLATFORMS_SUPPORTED.pancake]: {
      // pancake
      feePrv: {},
      feeToken: {},
      error: null,
    },
    [KEYS_PLATFORMS_SUPPORTED.uni]: {
      // uni
      feePrv: {},
      feeToken: {},
      error: null,
    },
    [KEYS_PLATFORMS_SUPPORTED.uniEther]: {
      // uniEther
      feePrv: {},
      feeToken: {},
      error: null,
    },
    [KEYS_PLATFORMS_SUPPORTED.curve]: {
      // curve
      feePrv: {},
      feeToken: {},
      error: null,
    },
    [KEYS_PLATFORMS_SUPPORTED.spooky]: {
      // spooky
      feePrv: {},
      feeToken: {},
      error: null,
    },
    [KEYS_PLATFORMS_SUPPORTED.joe]: {
      // joe
      feePrv: {},
      feeToken: {},
      error: null,
    },
    [KEYS_PLATFORMS_SUPPORTED.trisolaris]: {
      // trisolaris
      feePrv: {},
      feeToken: {},
      error: null,
    },
    [KEYS_PLATFORMS_SUPPORTED.interswap]: {
      // trisolaris
      feePrv: {},
      feeToken: {},
      error: null,
    },
  },
  buytoken: '',
  selltoken: '',
  feetoken: PRV_ID,
  estimateTrade: null,
  focustoken: '',
  networkfee: ACCOUNT_CONSTANT.MAX_FEE_PER_TX,
  swapingToken: false,
  selecting: false,
  initing: false,
  percent: 0,
  swaping: false,
  pairs: [],
  swapHistory: {
    isFetching: false,
    isFetched: false,
    data: [],
  },
  orderDetail: {
    order: {},
    fetching: false,
  },
  toggleProTab: false,
  pDEXPairs: [],
  pancakeTokens: [],
  uniTokens: [],
  curveTokens: [],
  interswapTokens: [],
  platforms: [...PLATFORMS_SUPPORTED],
  field: '',
  useMax: false,
  defaultExchange: KEYS_PLATFORMS_SUPPORTED.incognito,
  isPrivacyApp: false,
  error: null,
  slippage: '0.5',
  resetSlippage1: false,
  rewardHistories: [],
  isUsePRVToPayFee: true,
  bestRateExchange: null,
  exchangeSupportsList: [],
  network: null,
  estimateTradeError: null,
  isNavigateFromMarketTab: false,
  unifiedInforAlertHash: {},
  estimateCount: 1,
  isNavigateToSelection: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CHANGE_SLIPPAGE: {
      return {
        ...state,
        slippage: action.payload,
      };
    }
    case ACTION_REMOVE_ERROR: {
      const { data } = state;
      const newData = Object.keys(data).reduce((obj, key) => {
        obj[key].error = null;
        return obj;
      }, {});
      return {
        ...state,
        data: Object.assign({}, newData),
      };
    }
    case ACTION_SET_ERROR: {
      const { platformId, error } = action.payload;
      const { data } = state;
      const newState = {
        ...state,
        data: { ...data, [platformId]: { ...data[platformId], error } },
      };
      return newState;
    }
    case ACTION_FREE_HISTORY_ORDERS: {
      return {
        ...state,
        swapHistory: Object.assign({}, initialState.swapHistory),
      };
    }
    case ACTION_SET_DEFAULT_EXCHANGE: {
      let _isPrivacyApp = state.isPrivacyApp;
      const {
        exchange,
        isPrivacyApp = _isPrivacyApp,
        network,
      } = action.payload;
      return {
        ...state,
        defaultExchange: exchange,
        platforms: state.platforms.map((platform) =>
          isPrivacyApp && exchange === platform.id
            ? { ...platform, visible: true }
            : { ...platform, visible: false },
        ),
        network,
        isPrivacyApp,
      };
    }
    case ACTION_SAVE_LAST_FIELD: {
      return {
        ...state,
        field: action.payload,
      };
    }
    case ACTION_CHANGE_SELECTED_PLATFORM: {
      const platformID = action.payload;
      let feetoken = state.feetoken;
      switch (platformID) {
        case KEYS_PLATFORMS_SUPPORTED.pancake:
          feetoken = PRV_ID;
          break;
        case KEYS_PLATFORMS_SUPPORTED.uni:
        case KEYS_PLATFORMS_SUPPORTED.uniEther:
          feetoken = PRV_ID;
          break;
        case KEYS_PLATFORMS_SUPPORTED.curve:
          feetoken = PRV_ID;
          break;
        default:
          break;
      }
      const newState = {
        ...state,
        platforms: [...state.platforms].map((platform) => ({
          ...platform,
          isSelected: platformID === platform.id,
        })),
        // feetoken,
      };
      return newState;
    }
    case ACTION_TOGGLE_PRO_TAB: {
      return {
        ...state,
        toggleProTab: action.payload,
      };
    }
    case ACTION_SET_DEFAULT_PAIR: {
      const { selltoken, buytoken } = action.payload;
      return {
        ...state,
        selltoken,
        buytoken,
      };
    }
    case ACTION_FETCHING_ORDER_DETAIL: {
      const { orderDetail } = state;
      return {
        ...state,
        orderDetail: {
          ...orderDetail,
          fetching: true,
        },
      };
    }
    case ACTION_FETCHED_ORDER_DETAIL: {
      const { orderDetail } = state;
      return {
        ...state,
        orderDetail: {
          ...orderDetail,
          fetching: false,
          order: { ...action.payload },
        },
      };
    }
    case ACTION_FETCHING_ORDERS_HISTORY: {
      const { swapHistory } = state;
      return {
        ...state,
        swapHistory: { ...swapHistory, isFetching: true },
      };
    }
    case ACTION_FETCHED_ORDERS_HISTORY: {
      const { swapHistory } = state;
      return {
        ...state,
        swapHistory: {
          ...swapHistory,
          isFetching: false,
          isFetched: true,
          data: [...action.payload],
        },
      };
    }
    case ACTION_FETCH_FAIL_ORDERS_HISTORY: {
      const { swapHistory } = state;
      return {
        ...state,
        swapHistory: {
          ...swapHistory,
          isFetched: false,
          isFetching: false,
        },
      };
    }
    case ACTION_FETCHED_LIST_PAIRS: {
      const {
        pairs,
        pDEXPairs,
        pancakeTokens,
        uniTokens,
        curveTokens,
        spookyTokens,
        joeTokens,
        trisolarisTokens,
        interswapTokens,
      } = action.payload;
      return {
        ...state,
        pairs,
        pDEXPairs,
        pancakeTokens,
        uniTokens,
        curveTokens,
        spookyTokens,
        joeTokens,
        trisolarisTokens,
        interswapTokens,
      };
    }
    case ACTION_FETCH_SWAP: {
      return {
        ...state,
        swaping: action.payload,
      };
    }
    case ACTION_SET_PERCENT: {
      return {
        ...state,
        percent: action.payload,
      };
    }
    case ACTION_RESET: {
      return Object.assign(
        {},
        {
          ...initialState,
          slippage: state.slippage,
          resetSlippage1: state.resetSlippage1,
        },
      );
    }
    case ACTION_RESET_DATA: {
      return {
        ...state,
        data: Object.assign({}, initialState.data),
      };
    }
    case ACTION_FETCHING: {
      return {
        ...state,
        isFetching: action.payload,
        // data: Object.assign({}, initialState.data),
      };
    }
    case ACTION_FETCHED: {
      return {
        ...state,
        isFetched: action.payload,
        isFetching: false,
      };
    }
    case ACTION_CHANGE_ESTIMATE_DATA: {
      const payload = action.payload;
      const newState = {
        ...state,
        data: { ...state.data, ...payload },
      };
      return newState;
    }
    case ACTION_FETCH_FAIL: {
      return {
        ...state,
        isFetched: false,
        isFetching: false,
      };
    }
    case ACTION_SET_INITIING_SWAP: {
      return {
        ...state,
        initing: action.payload,
      };
    }
    case ACTION_SET_SELL_TOKEN: {
      return {
        ...state,
        selltoken: action.payload,
      };
    }
    case ACTION_SET_BUY_TOKEN: {
      return {
        ...state,
        buytoken: action.payload,
      };
    }
    case ACTION_SET_FEE_TOKEN: {
      return {
        ...state,
        feetoken: action.payload,
      };
    }
    case ACTION_SET_FOCUS_TOKEN: {
      return {
        ...state,
        focustoken: action.payload,
      };
    }
    case ACTION_SET_SELECTING_TOKEN: {
      return {
        ...state,
        selecting: action.payload,
      };
    }
    case ACTION_SET_SWAPING_TOKEN: {
      return {
        ...state,
        swapingToken: action.payload,
      };
    }
    case ACTION_FETCHED_REWARD_HISTORY: {
      return {
        ...state,
        rewardHistories: action.payload,
      };
    }
    case ACTION_FETCH_FAIL_REWARD_HISTORY: {
      return {
        ...state,
      };
    }
    case ACTION_SET_BEST_RATE_EXCHANGE: {
      return {
        ...state,
        bestRateExchange: action.payload,
      };
    }
    case ACTION_SET_EXCHANGE_SUPPORT_LIST: {
      return {
        ...state,
        exchangeSupportsList: action.payload,
      };
    }
    case ACTION_SET_RESET_SLIPPAGE: {
      return {
        ...state,
        resetSlippage1: true,
      };
    }
    case ACTION_ESTIMATE_TRADE_ERROR: {
      return {
        ...state,
        estimateTradeError: action.payload,
      };
    }

    case ACTION_NAVIGATE_FROM_MARKET: {
      return {
        ...state,
        isNavigateFromMarketTab: action.payload,
      };
    }

    case ACTION_NAVIGATE_TO_SELECT_TOKENS: {
      return {
        ...state,
        isNavigateToSelection: action.payload,
      };
    }

    case ACTION_RESET_EXCHANGE_SUPPORTED: {
      return {
        ...state,
        exchangeSupportsList: [],
      };
    }

    case ACTION_SAVE_UNIFIED_ALERT_STATE_BY_ID: {
      const { paymentAddress, timeStamp, answer } = action.payload;
      const newUnifiedInforAlertHash = { ...state.unifiedInforAlertHash };
      newUnifiedInforAlertHash[paymentAddress] = {
        timeStamp,
        answer,
      };
      return {
        ...state,
        unifiedInforAlertHash: newUnifiedInforAlertHash,
      };
    }
    case ACTION_ESTIMATE_COUNT: {
      const { estimateCount } = state;
      const count = action.payload;
      return {
        ...state,
        estimateCount: count ? count : estimateCount + 1,
      };
    }
    default:
      return state;
  }
};

const persistConfig = {
  key: 'swap',
  storage: AsyncStorage,
  whitelist: ['slippage', 'resetSlippage1', 'unifiedInforAlertHash'],
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persistConfig, reducer);
