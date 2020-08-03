import {
  ACTION_FETCHING_NEWS,
  ACTION_FETCHED_NEWS,
  ACTION_FETCH_FAIL_NEWS,
  ACTION_CHECK_UNREAD_NEWS,
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
    const { data } = action.payload;
    return {
      ...state,
      isFetching: false,
      isFetched: true,
      data: [...data],
    };
  }
  case ACTION_FETCH_FAIL_NEWS: {
    return {
      ...state,
      isFetched: false,
      isFetching: false,
    };
  }
  case ACTION_CHECK_UNREAD_NEWS: {
    return {
      ...state,
      isReadAll: action.payload,
    };
  }
  default:
    return state;
  }
};
