import { ACTION_NAMES } from '@screens/Dex/Liquidity.actionsName';
import { HEADER_TABS, INPUT_FIELDS, USER_FEES, TRANSACTION_FEE } from '@screens/Dex/Liquidity.constants';
import { PRV } from '@src/constants/common';
import convertUtil from '@utils/convert';

const initialResetState = {
  tabName: HEADER_TABS.Remove,
  historyTabName: HEADER_TABS.Remove,
  isLoading: false,
  isFiltering: false,
};

const initialHistories = {
  storageHistories: [],
  apiHistories: [],
  originalContributes: [],
  offset: -1,
  isEnd: false
};

const initialField = {
  inputToken: PRV,
  inputValue: convertUtil.toOriginalAmount(1, PRV.pDecimals),
  inputText: '1',
  inputBalance: undefined,

  outputToken: undefined,
  outputValue: 0,
  outputText: '',
  outputList: [],
  outputBalance: undefined,

  pair: undefined,
};

const initialState = {
  ...initialResetState,
  pdeState: {
    pairs: [],
    tokens: [],
    userPairs: [],
    feePairs: [],
  },
  [INPUT_FIELDS.ADD_POOL]: {
    ...initialField,
    ...initialHistories,
    fee: USER_FEES,
  },
  [INPUT_FIELDS.REMOVE_POOL]: {
    ...initialField,
    ...initialHistories,
    totalShare: undefined,
    share: 0,
    fee: TRANSACTION_FEE,
    maxInputShare: 0,
    maxInputShareOriginal: 0,
    maxOutputShare: 0,
    sharePercent: 0,
  },
  [INPUT_FIELDS.WITHDRAW]: {
    ...initialField,
    ...initialHistories,
    totalShare: undefined,
    inputToken: undefined,
    withdrawFeeValue: convertUtil.toOriginalAmount(1, PRV.pDecimals),
    withdrawFeeText: '1',
    share: 0,
    fee: TRANSACTION_FEE,
  }
};

const LiquidityReducer = (state = initialState, action) => {
  switch (action.type) {
  case ACTION_NAMES.CHANGE_TAB: {
    const { tabName } = action;
    return {
      ...state,
      tabName
    };
  }
  case ACTION_NAMES.CHANGE_LOADING: {
    const { isLoading } = action;
    return {
      ...state,
      isLoading
    };
  }
  case ACTION_NAMES.UPDATE_PDE_STATE: {
    const { pdeState } = action;
    return {
      ...state,
      pdeState
    };
  }
  case ACTION_NAMES.UPDATE_OUTPUT: {
    const { name, outputList, pair, outputToken } = action.payload;
    return {
      ...state,
      [name]: {
        ...state[name],
        outputList,
        pair,
        outputToken,
      }
    };
  }
  case ACTION_NAMES.UPDATE_INPUT_FIELD: {
    const payload = action.payload;
    return {
      ...state,
      [payload?.name]: Object.assign(state[payload?.name], payload)
    };
  }
  case ACTION_NAMES.CHANGE_FILTERING: {
    const { isFiltering } = action;
    return {
      ...state,
      isFiltering,
    };
  }

  case ACTION_NAMES.CHANGE_HISTORY_TAB: {
    const { tabName } = action;
    return {
      ...state,
      historyTabName: tabName,
    };
  }
  case ACTION_NAMES.CLEAR_HISTORY: {
    const { clearTab } = action;
    if (!clearTab) {
      return {
        ...state,
        [INPUT_FIELDS.ADD_POOL]: {
          ...state[INPUT_FIELDS.ADD_POOL],
          ...initialHistories,
        },
        [INPUT_FIELDS.REMOVE_POOL]: {
          ...state[INPUT_FIELDS.REMOVE_POOL],
          ...initialHistories,
        },
        [INPUT_FIELDS.WITHDRAW]: {
          ...state[INPUT_FIELDS.WITHDRAW],
          ...initialHistories,
        }
      };
    }
    return {
      ...state,
      [clearTab]: {
        ...state[clearTab],
        ...initialHistories,
      },
    };
  }
  default:
    return state;
  }
};

export default LiquidityReducer;
