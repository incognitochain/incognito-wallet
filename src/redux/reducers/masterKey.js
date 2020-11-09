import _ from 'lodash';
import types from '@src/redux/types/masterKey';
import LocalDatabase from '@src/utils/LocalDatabase';
import storage from '@services/storage';

const initialState = {
  list: [],
  accounts: [],
};

function createMasterKey(newMasterKey, list) {
  const newList = _.uniqBy([...list, newMasterKey]
    , item => item.name
  );
  LocalDatabase.setMasterKeyList(newList);

  return newList;
}

function updateMasterKey(newMasterKey, list) {
  const newList = list.map(item => {
    const found = item.name === newMasterKey.name;

    if (found) {
      return newMasterKey;
    }

    return item;
  });

  LocalDatabase.setMasterKeyList(newList);

  return newList;
}

function switchMasterKey(name, list) {
  const newList = list.map(item => {
    item.isActive = item.name === name;
    return item;
  });

  LocalDatabase.setMasterKeyList(newList);

  return newList;
}

function removeMasterKey(name, list) {
  const newList = _.remove(list, item => item.name !== name);

  list.forEach(async item => {
    const wallet = await item.loadWallet();

    await wallet.clearCached(storage);

    await storage.removeItem(item.getStorageName());
  });

  LocalDatabase.setMasterKeyList(newList);

  return newList;
}

function saveMasterKeys(list) {
  LocalDatabase.setMasterKeyList(list);
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
  case types.LOAD_ALL:
    return {
      ...state,
      list: action.payload,
    };
  case types.INIT: {
    saveMasterKeys(action.payload);
    return {
      ...state,
      list: action.payload,
    };
  }
  case types.IMPORT:
  case types.CREATE: {
    return {
      ...state,
      list: createMasterKey(action.payload, state.list)
    };
  }
  case types.SWITCH:
    return {
      ...state,
      list: switchMasterKey(action.payload, state.list),
    };
  case types.UPDATE:
    return {
      ...state,
      list: updateMasterKey(action.payload, state.list),
    };
  case types.REMOVE:
    return {
      ...state,
      list: removeMasterKey(action.payload, state.list),
    };
  case types.LOAD_ALL_ACCOUNTS:
    return {
      ...state,
      accounts: [...action.payload],
    };
  default:
    return state;
  }
};

export default reducer;
