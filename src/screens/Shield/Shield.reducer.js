import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import { persistReducer } from 'redux-persist';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_TOGGLE_GUIDE,
} from './Shield.constant';

const initialState = {
  isFetching: true,
  isFetched: false,
  data: {
    min: null,
    max: null,
    address: '',
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
    };
  }
  case ACTION_FETCHED: {
    return {
      ...state,
      isFetching: false,
      isFetched: true,
      data: { ...action.payload },
    };
  }
  case ACTION_FETCH_FAIL: {
    return {
      ...state,
      isFetched: false,
      isFetching: false,
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
