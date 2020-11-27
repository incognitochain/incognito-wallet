import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import {
  ACTION_FETCH_NODES_INFO_FROM_API_FAIL,
  ACTION_FETCHED_NODES_INFO_API,
  ACTION_FETCHING_NODES_INFO_FROM_API,
  ACTION_UPDATE_LIST_NODE_DEVICE,
  ACTION_UPDATE_MISSING_SETUP,
  ACTION_SET_TOTAL_VNODE,
  ACTION_UPDATE_NUMBER_LOADED_VNODE_BLS,
  ACTION_UPDATE_FETCHING,
  ACTION_CLEAR_NODE_DATA,
  UPDATE_WITHDRAW_TXS,
  ACTION_CLEAR_WITHDRAW_TXS,
  ACTION_CLEAR_LIST_NODES,
  ACTION_UPDATE_WITHDRAWING, ACTION_UPDATE_LOADED_NODE
} from '@screens/Node/Node.constant';
import { cloneDeep } from 'lodash';
import { PRV } from '@services/wallet/tokenService';
import { checkNoRewards } from '@screens/Node/Node.utils';

const initMissingSetup = {
  visible: false,
  verifyProductCode: ''
};

const initVNodeOptions = {
  hasVNode:         true,
  vNodeNotHaveBLS:  -1,
};

const initialStateClear = {
  isFetching:     false,
  isFetched:      false,
  isRefreshing:   false,
  noRewards:      true,
  withdrawing:    false,
  vNodeOptions:   initVNodeOptions,
  nodeRewards:    null,
  allTokens:      [PRV],
  missingSetup:   initMissingSetup,
  listDevice:     [], // List node,
  // when node load loadedNodes contain productId = true,
  // If loadedNodes dont contain productId or productId = false, node didn't loaded
  loadedNodes:    {}
};

const initialState = {
  ...initialStateClear,
  withdrawTxs:  {}
};

const nodeReducer = (state = initialState, action) => {
  switch (action.type) {
  // new flow
  case ACTION_UPDATE_LIST_NODE_DEVICE: {
    let { listDevice, isFetching } = action?.payload;
    if (isFetching !== null && isFetching !== undefined) {
      state = {
        ...state,
        isFetching
      };
    }
    return {
      ...state,
      listDevice,
      noRewards: checkNoRewards(state?.nodeRewards, listDevice)
    };
  }
  case ACTION_UPDATE_MISSING_SETUP: {
    const { visible, verifyProductCode } = action?.payload;
    return {
      ...state,
      missingSetup: {
        visible,
        verifyProductCode
      }
    };
  }
  case ACTION_FETCHING_NODES_INFO_FROM_API: {
    const { isRefresh } = action;
    return {
      ...state,
      isFetching: !isRefresh,
      isRefreshing: isRefresh || false,
      isFetched:  false
    };
  }
  case ACTION_FETCH_NODES_INFO_FROM_API_FAIL: {
    return {
      ...state,
      isFetching:   false,
      isFetched:    false,
      isRefreshing: false
    };
  }
  case ACTION_FETCHED_NODES_INFO_API: {
    const {
      listDevice,
      nodeRewards,
      allTokens
    } = action?.payload;
    return {
      ...state,
      isFetching: false,
      isRefreshing: false,
      isFetched: true,
      listDevice: listDevice || [],
      nodeRewards,
      noRewards: checkNoRewards(nodeRewards, listDevice),
      allTokens
    };
  }
  case ACTION_SET_TOTAL_VNODE: {
    const { hasVNode, vNodeNotHaveBLS } = action?.payload;
    const { vNodeOptions }  = state;
    return {
      ...state,
      vNodeOptions: {
        ...vNodeOptions,
        hasVNode,
        vNodeNotHaveBLS
      }
    };
  }
  case ACTION_UPDATE_NUMBER_LOADED_VNODE_BLS: {
    const { vNodeOptions }    = state;
    const { vNodeNotHaveBLS } = vNodeOptions;
    const result = vNodeNotHaveBLS - 1;
    const _vNodeNotHaveBLS = result >= 0 ? result : 0;
    return {
      ...state,
      vNodeOptions: {
        ...vNodeOptions,
        vNodeNotHaveBLS: _vNodeNotHaveBLS,
      }
    };
  }
  case ACTION_UPDATE_FETCHING: {
    const { isFetching } = action;
    return {
      ...state,
      isFetching,
    };
  }
  // When start loading data, clear all older data
  case ACTION_CLEAR_NODE_DATA: {
    return {
      ...state,
      ...cloneDeep(initialStateClear)
    };
  }
  // Clear list nodes when import account | close Node screen
  case ACTION_CLEAR_LIST_NODES: {
    return {
      ...state,
      listDevice: [],
    };
  }
  // Clear list nodes when close Node screen
  case ACTION_CLEAR_WITHDRAW_TXS: {
    return {
      ...state,
      withdrawTxs: {}
    };
  }
  case UPDATE_WITHDRAW_TXS: {
    const withdrawTxs = action?.withdrawTxs;
    return {
      ...state,
      withdrawTxs
    };
  }
  case ACTION_UPDATE_WITHDRAWING: {
    const withdrawing = action?.withdrawing;
    return {
      ...state,
      withdrawing
    };
  }
  case ACTION_UPDATE_LOADED_NODE: {
    const { payload } = action;
    const { loadedNodes }    = state;
    return {
      ...state,
      loadedNodes: Object.assign(loadedNodes, payload || {})
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