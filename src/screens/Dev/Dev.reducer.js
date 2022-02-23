import { CONSTANT_KEYS } from '@src/constants';
import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import { persistReducer } from 'redux-persist';
import {
  ACTION_TOGGLE_TEST_MODE_CENTRALIZED,
  ACTION_TOGGLE_TEST_MODE_DECENTRALIZED,
  ACTION_TOGGLE_UTXOS,
  ACTION_DEV_TEST_TOGGLE_HISTORY_DETAIL,
  ACTION_TOGGLE_LOG_APP,
  ACTION_DEV_TEST_TOGGLE_TRADE,
  ACTION_DEV_TEST_TOGGLE_REIMPORT_WALLET,
} from './Dev.constant';

const initialState = {
  storage: {
    [CONSTANT_KEYS.DEV_TEST_MODE_CENTRALIZED]: false,
    [CONSTANT_KEYS.DEV_TEST_MODE_DECENTRALIZED]: false,
    [CONSTANT_KEYS.TOGGLE_UTXOS]: false,
    [CONSTANT_KEYS.DEV_TEST_TOGGLE_HISTORY_DETAIL]: false,
    [CONSTANT_KEYS.DEV_TEST_TOGGLE_LOG_APP]: false,
    [CONSTANT_KEYS.DEV_TEST_TOGGlE_REIMPORT_WALLET]: false,
  },
};

const devReducer = (state = initialState, action) => {
  switch (action.type) {
  case ACTION_TOGGLE_TEST_MODE_CENTRALIZED: {
    const keySave = CONSTANT_KEYS.DEV_TEST_MODE_CENTRALIZED;
    const value = state.storage[keySave];
    return {
      ...state,
      storage: {
        ...state.storage,
        [keySave]: !value,
      },
    };
  }
  case ACTION_TOGGLE_TEST_MODE_DECENTRALIZED: {
    const keySave = CONSTANT_KEYS.DEV_TEST_MODE_DECENTRALIZED;
    const value = state.storage[keySave];
    return {
      ...state,
      storage: {
        ...state.storage,
        [keySave]: !value,
      },
    };
  }
  case ACTION_TOGGLE_UTXOS: {
    const keySave = CONSTANT_KEYS.DEV_TEST_TOGGLE_UTXOS;
    const value = state?.storage[keySave];
    return {
      ...state,
      storage: {
        ...state?.storage,
        [keySave]: !value,
      },
    };
  }
  case ACTION_DEV_TEST_TOGGLE_HISTORY_DETAIL: {
    const keySave = CONSTANT_KEYS.DEV_TEST_TOGGLE_HISTORY_DETAIL;
    const value = state?.storage[keySave];
    return {
      ...state,
      storage: {
        ...state?.storage,
        [keySave]: !value,
      },
    };
  }
  case ACTION_TOGGLE_LOG_APP: {
    const keySave = CONSTANT_KEYS.DEV_TEST_TOGGLE_LOG_APP;
    const value = state?.storage[keySave];
    return {
      ...state,
      storage: {
        ...state?.storage,
        [keySave]: !value,
      },
    };
  }
  case ACTION_DEV_TEST_TOGGLE_TRADE: {
    const keySave = CONSTANT_KEYS.DEV_TEST_TOGGLE_TRADE;
    const value = state?.storage[keySave];
    return {
      ...state,
      storage: {
        ...state?.storage,
        [keySave]: !value,
      },
    };
  }
  case ACTION_DEV_TEST_TOGGLE_REIMPORT_WALLET: {
    const keySave = CONSTANT_KEYS.DEV_TEST_TOGGlE_REIMPORT_WALLET;
    const value = state?.storage[keySave];
    return {
      ...state,
      storage: {
        ...state?.storage,
        [keySave]: !value,
      },
    };
  }
  default:
    return state;
  }
};

const persistConfig = {
  key: 'dev',
  storage: AsyncStorage,
  whitelist: ['storage'],
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persistConfig, devReducer);
