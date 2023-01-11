const ANALYTIC_ENDPOINT = global.isMainnet
  ? 'https://churn-api-coinservice.incognito.org/churn'
  : 'https://churn-api-coinservice-staging.incognito.org/churn';
const ANALYTIC_DATA_TYPE = {
  SHIELD: 1,
  UNSHIELD: 2,
  SEND: 3,
  TRADE: 4,
  OPEN_APP: 5,
  ORDER: 6,
  EARN_NOW: 7,
  CONTRIBUTE_LP: 8,
  CONTRIBUTE_NEW_LP: 9,
  PANCAKE: 10,
  UNISWAP: 11,
  CURVE: 12,
  TRADE_PANCAKE: 13,
  TRADE_UNISWAP: 14,
  TRADE_CURVE: 15,
  CANCEL_ORDER: 16,
  REMOVE_LP: 17,
  SPOOKY: 18,
  TRADE_SPOOKY: 19,
  JOE: 20,
  TRADE_JOE: 21,
  TRISOLARIS: 22,
  TRADE_TRISOLARIS: 23,
  INTER_SWAP: 24,
  TRADE_INTER_SWAP: 25
};

export default {
  ANALYTIC_ENDPOINT,
  ANALYTIC_DATA_TYPE,
};
