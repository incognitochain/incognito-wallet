import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import { persistReducer } from 'redux-persist';
import { camelCaseKeys } from '@src/utils';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
} from './Profile.constant';

const initialState = {
  isFetching: true,
  isFetched: false,
  data: {},
};

const profileReducer = (state = initialState, action) => {
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
      data: camelCaseKeys(action.payload),
    };
  }
  case ACTION_FETCH_FAIL: {
    return {
      ...state,
      isFetched: false,
      isFetching: false,
    };
  }
  default:
    return state;
  }
};

const persistConfig = {
  key: 'profile',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persistConfig, profileReducer);
