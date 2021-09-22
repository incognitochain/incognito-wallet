import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import { persistReducer } from 'redux-persist';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_TOGGLE_GUIDE,
  ACTION_RESET,
} from './Shield.constant';

const initialState = {
  isFetching: false,
  isFetched: false,
  isFetchFailed: false,
  isPortalCompatible: true,
  data: {
    min: null,
    max: null,
    address: '',
    expiredAt: '',
    decentralized: undefined,
    tokenFee: 0,
    estimateFee: 0,
    isPortal: false,
  },
  storage: {
    guide: false,
  },
};

const shieldReducer = (state = initialState, action) => {
  switch (action.type) {
  case ACTION_FETCHING: {
    return {
      ...state,
      isFetching: true,
      isFetchFailed: false,
    };
  }
  case ACTION_FETCHED: {
    return {
      ...state,
      isFetching: false,
      isFetched: true,
      isFetchFailed: false,
      data: { ...action.payload },
    };
  }
  case ACTION_FETCH_FAIL: {
    return {
      ...state,
      isFetched: false,
      isFetching: false,
      isFetchFailed: true,
      isPortalCompatible: action.isPortalCompatible,
    };
  }
  case ACTION_TOGGLE_GUIDE: {
    return {
      ...state,
      storage: {
        ...state.storage,
        guide: true,
      },
    };
  }
  case ACTION_RESET: {
    return {
      ...initialState,
      storage: state.storage,
    };
  }
  default:
    return state;
  }
};

const persistConfig = {
  key: 'stake',
  storage: AsyncStorage,
  whitelist: ['storage'],
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persistConfig, shieldReducer);
