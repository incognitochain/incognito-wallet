import { genNamspace } from '@src/utils/reduxUtils';

const n = genNamspace('UNISWAP');

// define types here
const TYPES = {
  GET_HISTORIES: n('GET_HISTORIES'),
  GET_HISTORY_STATUS: n('GET_HISTORY_STATUS'),
  ADD_HISTORY: n('ADD_HISTORY'),
  UPDATE_HISTORY: n('UPDATE_HISTORY'),
  DELETE_HISTORY: n('DELETE_HISTORY'),
  UPDATE_PAIRS: n('UPDATE_PAIRS'),
};

export default TYPES;
