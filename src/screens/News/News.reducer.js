import {
  ACTION_FETCHING_NEWS,
  ACTION_FETCHED_NEWS,
  ACTION_FETCH_FAIL_NEWS,
} from './News.constant';

const initialState = {
  isFetching: false,
  isFetched: false,
  data: [],
  isReadAll: true,
};

export default (state = initialState, action) => {
  switch (action.type) {
  case ACTION_FETCHING_NEWS: {
    return {
      ...state,
      isFetching: true,
    };
  }
  case ACTION_FETCHED_NEWS: {
    return {
      ...state,
      isFetching: false,
      isFetched: true,
      ...action.payload,
    };
  }
  case ACTION_FETCH_FAIL_NEWS: {
    return {
      ...state,
      isFetched: false,
      isFetching: false,
    };
  }
  default:
    return state;
  }
};
