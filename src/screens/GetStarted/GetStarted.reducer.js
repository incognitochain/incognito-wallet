import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import { persistReducer } from 'redux-persist';
import { CONSTANT_KEYS } from '@src/constants';
import {
  ACTION_SHOW_WIZARD_FETCHING,
  ACTION_SHOW_WIZARD_FETCHED,
  ACTION_TOGGLE_FOLLOW_DEFAULT_PTOKENS,
  ACTION_TOGGLE_SHOW_WIZARD,
} from './GetStarted.constant';

const initialState = {
  showWizard: {
    isFetching: true,
    isFetched: false,
  },
  followDefaultPTokens: {
    [CONSTANT_KEYS.IS_FOLLOW_DEFAULT_PTOKENS]: false,
  },
  isFollowedDefaultPTokens: false
};

const getStartedReducer = (state = initialState, action) => {
  switch (action.type) {
  case ACTION_SHOW_WIZARD_FETCHING: {
    return {
      ...state,
      showWizard: {
        ...state.showWizard,
        isFetching: true,
      },
    };
  }
  case ACTION_SHOW_WIZARD_FETCHED: {
    return {
      ...state,
      showWizard: {
        ...state.showWizard,
        isFetching: false,
        isFetched: true,
      },
    };
  }
  case ACTION_TOGGLE_SHOW_WIZARD: {
    const { isFetched } = action.payload;
    return {
      ...state,
      showWizard: {
        ...state?.showWizard,
        isFetched,
        isFetching: isFetched ? false : true,
      },
    };
  }
  case ACTION_TOGGLE_FOLLOW_DEFAULT_PTOKENS: {
    const { keySave } = action.payload;
    return {
      ...state,
      followDefaultPTokens: {
        ...state.followDefaultPTokens,
        [keySave]: true,
      },
    };
  }
  default:
    return state;
  }
};

const persistConfig = {
  key: 'getStarted',
  storage: AsyncStorage,
  whitelist: ['showWizard', 'followDefaultPTokens', 'isFollowedDefaultPTokens'],
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persistConfig, getStartedReducer);
