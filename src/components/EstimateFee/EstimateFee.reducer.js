import { CONSTANT_COMMONS } from '@src/constants';
import {
  ACTION_FETCHING_FEE,
  ACTION_FETCHED_FEE,
  ACTION_FETCH_FAIL_FEE,
  ACTION_ADD_FEE_TYPE,
  ACTION_CHANGE_FEE_TYPE,
  ACTION_FETCHED_PTOKEN_FEE,
  ACTION_FETCHED_MIN_PTOKEN_FEE,
  ACTION_CHANGE_FEE,
  ACTION_INIT,
  ACTION_INIT_FETCHED,
} from './EstimateFee.constant';
import { MAX_FEE_PER_TX } from './EstimateFee.utils';

const initialState = {
  isFetching: false,
  isFetched: false,
  minFeePrv: null,
  minFeePrvText: null,
  feePrv: null,
  feePrvText: '',
  maxFeePrv: null,
  maxFeePrvText: null,
  feePToken: null,
  feePTokenText: '',
  feeBurnPToken: null,
  feeBurnPTokenText: '',
  minFeePToken: null,
  minFeePTokenText: '',
  maxFeePToken: null,
  maxFeePTokenText: '',
  amount: null,
  amountText: '',
  minAmount: null,
  minAmountText: '',
  init: false,
  screen: '',
  types: [
    {
      tokenId: CONSTANT_COMMONS.PRV.id,
      symbol: CONSTANT_COMMONS.PRV.symbol,
    },
  ],
  actived: CONSTANT_COMMONS.PRV.id,
};

export default (state = initialState, action) => {
  switch (action.type) {
  case ACTION_INIT: {
    return {
      ...initialState,
    };
  }
  case ACTION_INIT_FETCHED: {
    return {
      ...state,
      ...action.payload,
      init: true,
    };
  }
  case ACTION_FETCHED_MIN_PTOKEN_FEE: {
    return {
      ...state,
      ...action.payload,
    };
  }
  case ACTION_FETCHING_FEE: {
    return {
      ...state,
      isFetching: true,
    };
  }
  case ACTION_FETCHED_FEE: {
    return {
      ...state,
      isFetching: false,
      isFetched: true,
      ...action.payload,
    };
  }
  case ACTION_FETCH_FAIL_FEE: {
    return {
      ...state,
      isFetched: false,
      isFetching: false,
      feePrv: MAX_FEE_PER_TX,
    };
  }
  case ACTION_ADD_FEE_TYPE: {
    const { tokenId } = action.payload;
    if (tokenId === CONSTANT_COMMONS.PRV.id) {
      return state;
    }
    return {
      ...state,
      types: [...initialState.types, action.payload],
    };
  }
  case ACTION_CHANGE_FEE_TYPE: {
    return {
      ...state,
      actived: action.payload,
    };
  }
  case ACTION_FETCHED_PTOKEN_FEE: {
    return {
      ...state,
      ...action.payload,
    };
  }
  case ACTION_CHANGE_FEE: {
    const { field, value } = action.payload;
    return {
      ...state,
      [field]: value,
    };
  }
  default:
    return state;
  }
};
