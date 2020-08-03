import { KEY_SAVE } from '@src/utils/LocalDatabase';
import persistReducer from 'redux-persist/es/persistReducer';
import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import isArray from 'lodash/isArray';
import {
  ACTION_ADD_STORAGE_DATA,
  ACTION_REMOVE_STORAGE_DATA,
} from './UnShield.constant';

const initialState = {
  storage: {
    [KEY_SAVE.WITHDRAWAL_DATA_DECENTRALIZED]: {
      txs: [],
    },
  },
};

const unShieldReducer = (state = initialState, action) => {
  switch (action.type) {
  case ACTION_ADD_STORAGE_DATA: {
    const { keySave, tx } = action.payload;
    const storage = state?.storage[keySave];
    const { txs } = storage;
    if (!isArray(txs) || !tx) {
      return state;
    }
    if (keySave === KEY_SAVE.WITHDRAWAL_DATA_DECENTRALIZED) {
      return {
        ...state,
        storage: {
          ...state?.storage,
          [keySave]: {
            ...storage,
            txs: [...txs, tx],
          },
        },
      };
    }
    return state;
  }
  case ACTION_REMOVE_STORAGE_DATA: {
    const { keySave, burningTxId } = action.payload;
    const storage = state?.storage[keySave];
    const { txs } = storage;
    if (!isArray(txs) || !burningTxId) {
      return state;
    }
    if (keySave === KEY_SAVE.WITHDRAWAL_DATA_DECENTRALIZED) {
      return {
        ...state,
        storage: {
          ...state?.storage,
          [keySave]: {
            ...storage,
            txs: [...txs.filter((tx) => tx?.burningTxId !== burningTxId)],
          },
        },
      };
    }
    return state;
  }
  default:
    return state;
  }
};

const persistConfig = {
  key: 'unShield',
  storage: AsyncStorage,
  whitelist: ['storage'],
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persistConfig, unShieldReducer);
