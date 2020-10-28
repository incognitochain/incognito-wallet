import {persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import {
  ACTION_FETCH_FULL_INFO_FAIL, ACTION_FETCHED_FULL_INFO, ACTION_FETCHING_FULL_INFO,
  ACTION_UPDATE_FETCHING,
  ACTION_UPDATE_LIST_NODE_DEVICE, ACTION_UPDATE_WITH_DRAWING
} from '@screens/Node/Node.constant';
import {PRV} from '@services/wallet/tokenService';

const initCommittees = {
  AutoStaking: [],
  ShardPendingValidator: {},
  CandidateShardWaitingForNextRandom: [],
  CandidateShardWaitingForCurrentRandom: [],
  ShardCommittee: {}
};
const initAllTokens = [PRV];

const initialState = {
  isFetching: false,
  withdrawing: false,
  listDevice: [], //List node device
  committees: initCommittees,
  nodeRewards: {},
  allTokens: initAllTokens
};

const nodeReducer = (state = initialState, action) => {
  switch (action.type) {
  case ACTION_UPDATE_LIST_NODE_DEVICE: {
    const { listDevice, isFetching } = action?.payload;
    if (isFetching !== null && isFetching !== undefined) {
      state = {
        ...state,
        isFetching
      };
    }
    return {
      ...state,
      listDevice: listDevice || [],
      withdrawing: false
    };
  }
  case ACTION_UPDATE_FETCHING: {
    const { isFetching } = action;
    return {
      ...state,
      isFetching,
    };
  }
  case ACTION_FETCHING_FULL_INFO: {
    return {
      ...state,
      isFetching: true,
    };
  }
  case ACTION_FETCH_FULL_INFO_FAIL: {
    return {
      ...state,
      isFetching: false,
    };
  }
  case ACTION_FETCHED_FULL_INFO: {
    const { committees, nodeRewards, allTokens } = action?.payload;
    return {
      ...state,
      isFetching: false,
      committees,
      nodeRewards,
      allTokens
    };
  }
  case ACTION_UPDATE_WITH_DRAWING: {
    const { withdrawing } = action;
    return {
      ...state,
      withdrawing
    };
  }
  default:
    return state;
  }
};

const persistConfig = {
  key: 'node',
  storage: AsyncStorage,
  whitelist: [''],
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persistConfig, nodeReducer);