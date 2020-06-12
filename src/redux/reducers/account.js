import type from '@src/redux/types/account';
import _ from 'lodash';

const TAG = 'reducers-account';
const initialState = {
  list: [],
  defaultAccountName: '',
  isGettingBalance: [],
  switch: false,
  create: false,
  import: false,
};

const setAccount = (list, account) => {
  let newList = [...list];
  // console.log(TAG,'setAccount account = ',account);
  try {
    const foundIndex = list.findIndex((a) => a.name === account.name);
    if (foundIndex >= 0) {
      console.log(TAG, 'setAccount 01');
      newList[foundIndex] = account;
    } else {
      newList.push(account);
    }
  } catch (e) {
    console.error(e);
  }
  // console.log(TAG,'setAccount end  = ',newList);
  return newList;
};

const removeByPrivateKey = (list, privateKey) => {
  const newList = [...list];
  try {
    _.remove(newList, (_item) => _item.PrivateKey === privateKey);
  } catch (e) {
    console.error(e);
  }
  return newList;
};

const setGettingBalance = (list, accountName) => {
  const newList = [...list];
  return newList.includes(accountName) ? newList : [...newList, accountName];
};

const removeGettingBalance = (list, accountName) => {
  const newList = [...list];
  _.remove(newList, (item) => item === accountName);
  return newList;
};

const reducer = (state = initialState, action) => {
  let newList = [];

  switch (action.type) {
  case type.SET:
    newList = setAccount(state.list, action.data);
    return {
      ...state,
      list: newList,
    };
  case type.SET_LIST:
    return {
      ...state,
      list: [...action.data],
    };
  case type.REMOVE_BY_PRIVATE_KEY:
    newList = removeByPrivateKey(state.list, action.data);
    return {
      ...state,
      list: newList,
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
  case type.SET_DEFAULT_ACCOUNT:
    return {
      ...state,
      defaultAccountName: action.data?.name,
    };
  case type.ACTION_SWITCH_ACCOUNT_FETCHING: {
    return {
      ...state,
      switch: true,
    };
  }
  case type.ACTION_SWITCH_ACCOUNT_FETCHED: {
    return {
      ...state,
      switch: false,
    };
  }
  case type.ACTION_SWITCH_ACCOUNT_FETCH_FAIL: {
    return {
      ...state,
      switch: false,
    };
  }
  case type.ACTION_FETCHING_CREATE_ACCOUNT: {
    return {
      ...state,
      create: true,
    };
  }
  case type.ACTION_FETCHED_CREATE_ACCOUNT: {
    return {
      ...state,
      create: false,
    };
  }
  case type.ACTION_FETCH_FAIL_CREATE_ACCOUNT: {
    return {
      ...state,
      create: false,
    };
  }
  case type.ACTION_FETCHING_IMPORT_ACCOUNT: {
    return {
      ...state,
      import: true,
    };
  }
  case type.ACTION_FETCHED_IMPORT_ACCOUNT: {
    return {
      ...state,
      import: false,
    };
  }
  case type.ACTION_FETCH_FAIL_IMPORT_ACCOUNT: {
    return {
      ...state,
      import: false,
    };
  }
  default:
    return state;
  }
};

export default reducer;
