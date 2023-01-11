import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_FREE,
  ACTION_SET_SELECTED_TX,
  ACTION_FETCHING_TX,
  ACTION_FETCHED_TX,
  ACTION_FREE_HISTORY_DETAIL,
} from '@src/redux/actions/history';

const initialState = {
  isFetching: false,
  isFetched: false,
  txsTransactor: [],
  txsReceiver: [],
  txsPToken: [],
  txsPortal: [],
  txsUnshield: [],
  detail: {
    fetching: false,
    tx: null,
  },
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
    const { txsTransactor, txsReceiver, txsPToken, txsPortal, txsUnshield } = action.payload;
    return {
      ...state,
      isFetching: false,
      isFetched: true,
      txsTransactor: [...txsTransactor],
      txsReceiver: [...txsReceiver],
      txsPToken: [...txsPToken], 
      txsPortal: [...txsPortal], 
      txsUnshield: [...txsUnshield],
    };
  }
  case ACTION_FETCH_FAIL: {
    return {
      ...state,
      isFetched: false,
      isFetching: false,
    };
  }
  case ACTION_FREE: {
    return { ...initialState };
  }
  case ACTION_SET_SELECTED_TX: {
    return {
      ...state,
      detail: {
        ...state.detail,
        tx: { ...action.payload },
      },
    };
  }
  case ACTION_FETCHING_TX: {
    return {
      ...state,
      detail: {
        ...state.detail,
        fetching: true,
      },
    };
  }
  case ACTION_FETCHED_TX: {
    return {
      ...state,
      detail: {
        ...state.detail,
        tx: { ...action.payload },
        fetching: false,
      },
    };
  }
  case ACTION_FREE_HISTORY_DETAIL: {
    return {
      ...state,
      txsTransactor: [],
      txsReceiver: [],
      txsPToken: [],
      txsPortal: [],
      txsUnshield: [],
    };
  }
  default:
    return state;
  }
};
