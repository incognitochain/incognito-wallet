import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_FETCHED_TRADING_VOLUME_24H,
  ACTION_FETCHED_LIST_POOLS,
  ACTION_FETCHED_LIST_POOLS_FOLLOWING,
  ACTION_FREE_LIST_POOL, ACTION_SET_SEARCH_TEXT,
} from './Pools.constant';

const initialState = {
  isFetching: true,
  isFetched: false,
  tradingVolume24h: 0,
  pairID: undefined,
  listPools: [],
  followIds: [],
  searchText: ''
};

export default (state = initialState, action) => {
  switch (action.type) {
  case ACTION_FETCHING: {
    const { isFetching } = action.payload;
    return {
      ...state,
      isFetching,
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
      listPools: []
    };
  }
  case ACTION_FETCHED_LIST_POOLS_FOLLOWING: {
    const { followIds } = action.payload;
    return {
      ...state,
      followIds: followIds || [],
    };
  }
  case ACTION_SET_SEARCH_TEXT: {
    const { searchText } = action.payload;
    return {
      ...state,
      searchText,
    };
  }
  default:
    return state;
  }
};
