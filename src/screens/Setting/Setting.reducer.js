import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import { persistReducer } from 'redux-persist';
import {
  ACTION_FETCHED_SERVER,
  ACTION_FETCHED_DEVICES,
  ACTION_TOGGLE_DECIMAL_DIGITS,
  ACTION_TOGGLE_CURRENCY,
  ACTION_UPDATE_SHOW_WALLET_BALANCE,
  ACTION_TOGGLE_BACKUP_ALL_KEYS,
  ACTION_TOGGLE_USE_PRV_TO_PAY_FEE,
} from './Setting.constant';

const initialState = {
  defaultServerId: 1,
  devices: [],
  server: null,
  decimalDigits: true,
  isToggleUSD: true,
  showWalletBalance: false,
  toggleBackupAllKeys: true,
  usePRVToPayFee: false,
};

const settingReducer = (state = initialState, action) => {
  switch (action.type) {
  case ACTION_TOGGLE_USE_PRV_TO_PAY_FEE: {
    return {
      ...state,
      usePRVToPayFee: !state.usePRVToPayFee,
    };
  }
  case ACTION_TOGGLE_BACKUP_ALL_KEYS: {
    return {
      ...state,
      toggleBackupAllKeys: action.payload,
    };
  }
  case ACTION_FETCHED_DEVICES: {
    return {
      ...state,
      devices: [...action.payload],
    };
  }
  case ACTION_FETCHED_SERVER: {
    return {
      ...state,
      server: { ...action.payload },
    };
  }
  case ACTION_TOGGLE_DECIMAL_DIGITS: {
    return {
      ...state,
      decimalDigits: !state?.decimalDigits,
    };
  }
  case ACTION_TOGGLE_CURRENCY: {
    return {
      ...state,
      isToggleUSD: !state?.isToggleUSD,
    };
  }
  case ACTION_UPDATE_SHOW_WALLET_BALANCE: {
    return {
      ...state,
      showWalletBalance: !state?.showWalletBalance,
    };
  }
  default:
    return state;
  }
};

const persistConfig = {
  key: 'setting',
  storage: AsyncStorage,
  whitelist: [
    'decimalDigits',
    'isToggleUSD',
    'toggleBackupAllKeys',
    'usePRVToPayFee',
  ],
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persistConfig, settingReducer);
