import type from '@src/redux/types/token';
import { unionBy, remove } from 'lodash';
import typeSelectedPrivacy from '@src/redux/types/selectedPrivacy';

export const LIMIT_RECEIVE_HISTORY_ITEM = 20;
export const MAX_LIMIT_RECEIVE_HISTORY_ITEM = 50;

const initialState = {
  followed: [],
  pTokens: [],
  internalTokens: [],
  isGettingBalance: [],
  history: {
    isFetching: false,
    isFetched: false,
    histories: [],
    isEmpty: false,
    refreshing: true,
  },
  toggleUnVerified: false,
  receiveHistory: {
    isFetching: false,
    isFetched: false,
    data: [],
    oversize: false,
    page: 0,
    limit: LIMIT_RECEIVE_HISTORY_ITEM,
    refreshing: true,
    tokenId: null,
    notEnoughData: false,
  },
};

const setToken = (list, token) => {
  let newList = [...list];
  try {
    const foundIndex = list.findIndex((t) => t.id === token.id);
    if (foundIndex >= 0) {
      newList[foundIndex] = { ...newList[foundIndex], ...token };
    } else {
      newList.push(token);
    }
  } catch (e) {
    throw new Error('Save token failed');
  }
  return newList;
};

const removeTokenById = (list, tokenId) => {
  let newList = [...list];
  try {
    newList = remove(newList, (t) => t.id === tokenId);
  } catch (e) {
    throw new Error('Remove token failed');
  }
  return newList;
};

const setBulkToken = (list, tokens) => {
  let newList = [...list];
  try {
    newList = unionBy(tokens, list, 'id');
  } catch (e) {
    throw new Error('Save tokens failed');
  }
  return newList;
};

const setListToken = (list, tokens) => {
  const newTokens = tokens?.map((token) => {
    const cachedToken = list?.find((t) => t.id === token.id);

    // if cached token (in redux store) has its amount, keep it!
    if (cachedToken?.amount) {
      token.amount = cachedToken.amount;
    }
    return token;
  });

  return newTokens;
};

const setGettingBalance = (list, tokenSymbol) => {
  const newList = [...list];
  return newList.includes(tokenSymbol) ? newList : [...newList, tokenSymbol];
};

const removeGettingBalance = (list, tokenSymbol) => {
  const newList = [...list];
  remove(newList, (item) => item === tokenSymbol);
  return newList;
};

const reducer = (state = initialState, action) => {
  let newList = [];

  switch (action.type) {
    case type.ADD_PTOKEN:
      newList = [...state.pTokens, action.data];
      return {
        ...state,
        pTokens: newList,
      };
  case type.SET:
    newList = setToken(state.followed, action.data);
    return {
      ...state,
      followed: newList,
    };
  case type.SET_BULK:
    newList = setBulkToken(state.followed, action.data);
    return {
      ...state,
      followed: newList,
    };
  case type.GET_BALANCE:
    return {
      ...state,
      isGettingBalance: setGettingBalance(
        state.isGettingBalance,
        action.data,
      ),
    };
  case type.GET_BALANCE_FINISH:
    return {
      ...state,
      isGettingBalance: removeGettingBalance(
        state.isGettingBalance,
        action.data,
      ),
    };
  case type.REMOVE_BY_ID:
    newList = removeTokenById(state.followed, action.data);
    return {
      ...state,
      followed: newList,
    };
  case type.SET_LIST:
    newList = setListToken(state.followed, action.data);
    return {
      ...state,
      followed: newList,
    };
  case type.SET_PTOKEN_LIST:
    return {
      ...state,
      pTokens: setListToken(state.followed, action.data),
    };
  case type.SET_INTERNAL_LIST:
    return {
      ...state,
      // TEST_REMOVE_LOGIC
      // internalTokens: setListToken(state.followed, action.data),
      internalTokens: []
    };
  case type.ACTION_FETCHING_HISTORY: {
    return {
      ...state,
      history: {
        ...state.history,
        isFetching: true,
        refreshing: action?.payload?.refreshing || false,
      },
    };
  }
  case type.ACTION_FETCHED_HISTORY: {
    return {
      ...state,
      history: {
        ...state.history,
        isFetching: false,
        isFetched: true,
        histories: [...action.payload],
        isEmpty: action.payload.length === 0,
        refreshing: false,
      },
    };
  }
  case type.ACTION_FETCH_FAIL_HISTORY: {
    return {
      ...state,
      history: {
        ...state.history,
        isFetching: false,
        isFetched: false,
        refreshing: false,
      },
    };
  }
  case type.ACTION_FREE_HISTORY: {
    return {
      ...state,
      history: { ...initialState.history },
    };
  }
  case typeSelectedPrivacy.SET: {
    return {
      ...state,
      history: {
        ...initialState.history,
      },
      receiveHistory: {
        ...initialState.receiveHistory,
        tokenId: action?.data,
      },
    };
  }
  case type.ACTION_TOGGLE_UNVERIFIED_TOKEN: {
    return {
      ...state,
      toggleUnVerified: !state.toggleUnVerified,
    };
  }
  //
  case type.ACTION_FREE_RECEIVE_HISTORY: {
    return {
      ...state,
      receiveHistory: {
        ...initialState?.receiveHistory,
      },
    };
  }
  case type.ACTION_FETCHING_RECEIVE_HISTORY: {
    return {
      ...state,
      receiveHistory: {
        ...state.receiveHistory,
        isFetching: true,
        refreshing: action?.payload?.refreshing || false,
        notEnoughData: false,
      },
    };
  }
  case type.ACTION_FETCHED_RECEIVE_HISTORY: {
    const { nextPage, data, oversize, refreshing, notEnoughData } = action?.payload;
    return {
      ...state,
      receiveHistory: {
        ...state.receiveHistory,
        isFetching: false,
        isFetched: true,
        data: [...data],
        page: refreshing ? state?.receiveHistory?.page : nextPage,
        oversize,
        refreshing: false,
        notEnoughData,
      },
    };
  }
  case type.ACTION_FETCH_FAIL_RECEIVE_HISTORY: {
    return {
      ...state,
      receiveHistory: {
        ...state.receiveHistory,
        isFetching: false,
        isFetched: false,
        refreshing: false,
        notEnoughData: false,
      },
    };
  }
  default:
    return state;
  }
};

export default reducer;
