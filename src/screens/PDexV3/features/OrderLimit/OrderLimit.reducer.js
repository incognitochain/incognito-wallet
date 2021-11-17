import { PRV_ID } from '@src/constants/common';
import { ACCOUNT_CONSTANT } from 'incognito-chain-web-js/build/wallet';
import { ACTION_SET_FOCUS_TOKEN } from '../Swap/Swap.constant';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_SET_POOL_ID,
  ACTION_SET_INITIING,
  ACTION_SET_SELL_TOKEN,
  ACTION_SET_BUY_TOKEN,
  ACTION_SET_FEE_TOKEN,
  ACTION_RESET,
  ACTION_SET_PERCENT,
  ACTION_FETCHED_OPEN_ORDERS,
  ACTION_WITHDRAWING_ORDER,
  ACTION_FETCHED_WITHDRAWING_ORDER_TXS,
  ACTION_FETCH_ORDERING,
  ACTION_FETCHING_ORDERS_HISTORY,
  ACTION_FETCHED_ORDERS_HISTORY,
  ACTION_FETCH_FAIL_ORDERS_HISTORY,
  ACTION_FETCHING_ORDER_DETAIL,
  ACTION_FETCHED_ORDER_DETAIL,
  ACTION_RESET_ORDERS_HISTORY,
} from './OrderLimit.constant';

const initialState = {
  isFetching: false,
  isFetched: false,
  data: {},
  poolId: '',
  buytoken: '',
  selltoken: '',
  feetoken: PRV_ID,
  estimateTrade: null,
  focustoken: '',
  networkfee: ACCOUNT_CONSTANT.MAX_FEE_PER_TX,
  swapingToken: false,
  selecting: false,
  initing: false,
  rate: '',
  percent: 0,
  ordersHistory: {
    isFetching: false,
    isFetched: false,
    data: [],
  },
  withdrawingOrderTxs: [],
  withdrawOrderTxs: [],
  ordering: false,
  orderDetail: {
    order: {},
    fetching: false,
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
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
        order: action.payload,
      },
    };
  }
  case ACTION_RESET_ORDERS_HISTORY: {
    return {
      ...state,
      ordersHistory: { ...initialState.ordersHistory },
    };
  }
  case ACTION_FETCHING_ORDERS_HISTORY: {
    const { ordersHistory } = state;
    return {
      ...state,
      ordersHistory: { ...ordersHistory, isFetching: true },
    };
  }
  case ACTION_FETCHED_ORDERS_HISTORY: {
    const { ordersHistory } = state;
    return {
      ...state,
      ordersHistory: {
        ...ordersHistory,
        isFetching: false,
        isFetched: true,
        data: [...action.payload],
      },
    };
  }
  case ACTION_FETCH_FAIL_ORDERS_HISTORY: {
    const { ordersHistory } = state;
    return {
      ...state,
      ordersHistory: {
        ...ordersHistory,
        isFetched: false,
        isFetching: false,
      },
    };
  }
  case ACTION_FETCH_ORDERING: {
    return {
      ...state,
      ordering: action.payload,
    };
  }
  case ACTION_FETCHED_WITHDRAWING_ORDER_TXS: {
    return {
      ...state,
      withdrawOrderTxs: [...action.payload],
    };
  }
  case ACTION_WITHDRAWING_ORDER: {
    const { withdrawingOrderTxs } = state;
    const requesttx = action.payload;
    const isExited = withdrawingOrderTxs.includes(requesttx);
    return {
      ...state,
      withdrawingOrderTxs: isExited
        ? [...withdrawingOrderTxs].filter((txId) => txId !== requesttx)
        : [requesttx, ...withdrawingOrderTxs],
    };
  }
  case ACTION_FETCHED_OPEN_ORDERS: {
    return {
      ...state,
      orders: [...action.payload],
    };
  }
  case ACTION_FETCHING: {
    return {
      ...state,
      isFetching: true,
    };
  }
  case ACTION_FETCHED: {
    return {
      ...state,
      isFetching: false,
      isFetched: true,
    };
  }
  case ACTION_FETCH_FAIL: {
    return {
      ...state,
      isFetched: false,
      isFetching: false,
    };
  }
  case ACTION_SET_POOL_ID: {
    return {
      ...state,
      poolId: action.payload,
    };
  }
  case ACTION_SET_INITIING: {
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
  case ACTION_RESET: {
    return initialState;
  }
  case ACTION_SET_PERCENT: {
    return {
      ...state,
      percent: action.payload,
    };
  }
  default:
    return state;
  }
};
