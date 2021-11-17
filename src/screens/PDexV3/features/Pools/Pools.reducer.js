import AsyncStorage from '@react-native-community/async-storage';
import {persistReducer} from 'redux-persist';
import autoMergeLevel1 from 'redux-persist/es/stateReconciler/autoMergeLevel1';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_FETCHED_TRADING_VOLUME_24H,
  ACTION_FETCHED_LIST_POOLS,
  ACTION_FETCHED_LIST_POOLS_DETAIL,
  ACTION_FETCHED_LIST_POOLS_FOLLOWING,
  ACTION_FREE_LIST_POOL,
  ACTION_RESET,
} from './Pools.constant';

const initialState = {
  isFetching: true,
  isFetched: false,
  tradingVolume24h: 0,
  pairID: undefined,
  listPools: [],
  listPoolsFollowing: [],
  followIds: [],
};

const poolReducer = (state = initialState, action) => {
  switch (action.type) {
  case ACTION_RESET: {
    return { ...initialState };
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
  case ACTION_FETCHED_TRADING_VOLUME_24H: {
    return {
      ...state,
      tradingVolume24h: action.payload,
    };
  }
  case ACTION_FETCHED_LIST_POOLS: {
    return {
      ...state,
      listPools: action.payload,
    };
  }
  case ACTION_FREE_LIST_POOL: {
    return {
      ...state,
      listPools: [],
    };
  }
  case ACTION_FETCHED_LIST_POOLS_DETAIL: {
    return {
      ...state,
      listPoolsDetail: action.payload,
    };
  }
  case ACTION_FETCHED_LIST_POOLS_FOLLOWING: {
    const { followIds } = action.payload;
    return {
      ...state,
      followIds: followIds || [],
    };
  }
  default:
    return state;
  }
};

const persistConfig = {
  key: 'pools',
  storage: AsyncStorage,
  whitelist: ['listPools'],
  stateReconciler: autoMergeLevel1,
};

export default persistReducer(persistConfig, poolReducer);
