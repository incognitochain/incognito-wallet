import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_SET_SHARE_DETAIL,
  ACTION_SET_POOL_MODAL,
  ACTION_FREE_MODAL,
} from './Portfolio.constant';

const initialState = {
  isFetching: false,
  isFetched: false,
  data: [],
  shareDetails: [],
  modal: {
    poolId: undefined
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
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
      data: action.payload,
    };
  }
  case ACTION_FETCH_FAIL: {
    return {
      ...state,
      isFetched: false,
      isFetching: false,
    };
  }
  case ACTION_SET_SHARE_DETAIL: {
    return {
      ...state,
      shareDetails: action.payload
    };
  }
  case ACTION_SET_POOL_MODAL: {
    const { poolId } = action.payload;
    return {
      ...state,
      modal: {
        poolId
      }
    };
  }
  case ACTION_FREE_MODAL: {
    return {
      ...state,
      modal: {
        poolId: undefined
      }
    };
  }
  default:
    return state;
  }
};
