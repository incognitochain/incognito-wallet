import AsyncStorage from '@react-native-community/async-storage';
import { CONSTANT_KEYS } from '@src/constants';
import { persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
} from './Streamline.constant';

const initialState = {
  storage: {
    [CONSTANT_KEYS.UTXOS_DATA]: {
      isFetching: false,
      isFetched: false,
      data: {},
    },
  },
};

const streamlineReducer = (state = initialState, action) => {
  switch (action.type) {
  case ACTION_FETCHING: {
    const keySave = CONSTANT_KEYS.UTXOS_DATA;
    const storage = state?.storage;
    return {
      ...state,
      storage: {
        ...storage,
        [keySave]: {
          ...storage[keySave],
          isFetching: true,
        },
      },
    };
  }
  case ACTION_FETCHED: {
    const keySave = CONSTANT_KEYS.UTXOS_DATA;
    const storage = state?.storage;
    const { address, utxos } = action.payload;
    const data = storage[keySave]?.data;
    return {
      ...state,
      storage: {
        ...storage,
        [keySave]: {
          ...storage[keySave],
          isFetching: false,
          isFetched: true,
          data: { ...data, [address]: [...utxos] },
        },
      },
    };
  }
  case ACTION_FETCH_FAIL: {
    const keySave = CONSTANT_KEYS.UTXOS_DATA;
    const storage = state?.storage;
    return {
      ...state,
      storage: {
        ...storage,
        [keySave]: {
          ...storage[keySave],
          isFetched: false,
          isFetching: false,
        },
      },
    };
  }
  default:
    return state;
  }
};

const persistConfig = {
  key: 'streamline',
  storage: AsyncStorage,
  whitelist: ['storage'],
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persistConfig, streamlineReducer);
