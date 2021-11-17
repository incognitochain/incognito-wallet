export const ACTION_FETCHING = '[pDexV3][orderLimit] Fetching data';
export const ACTION_FETCHED = '[pDexV3][orderLimit] Fetched data';
export const ACTION_FETCH_FAIL = '[pDexV3][orderLimit] Fetch fail data';

export const ACTION_SET_POOL_ID = '[pDexV3][orderLimit] Set pool selected';
export const ACTION_SET_INITIING = '[pDexV3][orderLimit] Initing';
export const ACTION_SET_FEE_TOKEN = '[pDexV3][orderLimit] Set fee token';
export const ACTION_SET_SELL_TOKEN = '[pDexV3][orderLimit] Set sell token';
export const ACTION_SET_BUY_TOKEN = '[pDexV3][orderLimit] Set buy token';
export const ACTION_RESET = '[pDexV3][orderLimit] Reset';
export const ACTION_SET_PERCENT = '[pDexV3][orderLimit] Set percent';
export const ACTION_FETCHED_OPEN_ORDERS =
  '[pDexV3][orderLimit] Fetched open orders';
export const ACTION_WITHDRAWING_ORDER = '[pDexV3][orderLimit] Cancel order';
export const ACTION_FETCHED_WITHDRAWING_ORDER_TXS =
  '[pDexV3][orderLimit] Fetched withdrawing order txs';
export const ACTION_FETCH_ORDERING = '[pDexV3][orderLimit] Fetch ordering';
export const formConfigs = {
  formName: 'FORM_ORDER_LIMIT',
  selltoken: 'selltoken',
  buytoken: 'buytoken',
  feetoken: 'feetoken',
  rate: 'rate',
};

export const ACTION_FETCHING_ORDERS_HISTORY =
  '[pDexV3][orderLimit] Fetching history order';

export const ACTION_FETCHED_ORDERS_HISTORY =
  '[pDexV3][orderLimit] Fetched history order';
export const ACTION_FETCH_FAIL_ORDERS_HISTORY =
  '[pDexV3][orderLimit] Fetch fail history order';

export const ACTION_FETCH_ORDER_DETAIL =
  '[pDexV3][orderLimit] Fetch order detail';

export const ACTION_FETCHING_ORDER_DETAIL =
  '[pDexV3][orderLimit] Fetching order detail';

export const ACTION_FETCHED_ORDER_DETAIL =
  '[pDexV3][orderLimit] Fetched order detail';

export const ACTION_RESET_ORDERS_HISTORY =
  '[pDexV3][orderLimit] Reset orders history';

export const ROOT_TAB_SUB_INFO = 'ROOT_TAB_SUB_INFO';
export const TAB_OPEN_ORDER = '[order_limit_sub_info] open order';
export const TAB_ORDER_BOOK = '[order_limit_sub_info] order book';
export const TAB_HISTORY_ID = '[order_limit_sub_info] history order';
