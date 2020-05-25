import type from '@src/redux/types/token';
import { unionBy, remove } from 'lodash';
import { CONSTANT_COMMONS } from '@src/constants';
import typeSelectedPrivacy from '@src/redux/types/selectedPrivacy';

const initialState = {
  followed: [],
  pTokens: null,
  internalTokens: null,
  isGettingBalance: [],
  history: {
    isFetching: false,
    isFetched: false,
    histories: [],
    isEmpty: false,
  },
};

const setToken = (list, token) => {
  let newList = [...list];
  try {
    const foundIndex = list.findIndex(t => t.id === token.id);
    if (foundIndex >= 0) {
      newList[foundIndex] = token;
    }
  } catch (e) {
    throw new Error('Save token failed');
  }
  return newList;
};

const removeTokenById = (list, tokenId) => {
  let newList = [...list];
  try {
    newList = remove(newList, t => t.id === tokenId);
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
  const newTokens = tokens?.map(token => {
    const cachedToken = list?.find(t => t.id === token.id);

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
  remove(newList, item => item === tokenSymbol);
  return newList;
};

const reducer = (state = initialState, action) => {
  let newList = [];

  switch (action.type) {
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
      internalTokens: setListToken(state.followed, action.data),
    };
  case type.ADD_FOLLOW_TOKEN_SUCCESS: {
    return {
      ...state,
    };
  }
  case type.ADD_FOLLOW_TOKEN_FAIL: {
    return {
      ...state,
    };
  }
  case type.ACTION_FETCHING_HISTORY: {
    return {
      ...state,
      history: {
        ...state.history,
        isFetching: true,
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
      },
    };
  }
  case type.ACTION_INIT_HISTORY: {
    return {
      ...state,
    };
  }
  case typeSelectedPrivacy.SET: {
    return {
      ...state,
      history: {
        ...initialState.history,
      },
    };
  }
  default:
    return state;
  }
};

export default reducer;
