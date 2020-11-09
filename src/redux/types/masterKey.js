import { genNamspace } from '@src/utils/reduxUtils';

const n = genNamspace('MASTER_KEY');

// define types here
const TYPES = {
  LOAD_ALL: n('LOAD_ALL'),
  SWITCH: n('SWITCH'),
  CREATE: n('CREATE'),
  REMOVE: n('REMOVE'),
  UPDATE: n('UPDATE'),
  IMPORT: n('IMPORT'),
  INIT: n('INIT'),
  LOAD_ALL_ACCOUNTS: n('LOAD_ALL_ACCOUNTS'),
};

export default TYPES;
