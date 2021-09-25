const CRYPTO_SYMBOL = {
  PRV: 'PRV',
  BTC: 'BTC',
  ETH: 'ETH',
  BNB: 'BNB',
  USD: 'USD',
  KCS: 'KCS',
  TOMO: 'TOMO',
  NEO: 'NEO',
  XMR: 'XMR',
  ZEN: 'ZEN',
  ZCL: 'ZCL',
  ZEC: 'ZEC',
  VOT: 'VOT',
  VTC: 'VTC',
  SNG: 'SNG',
  XRP: 'XRP',
  XRB: 'XRB',
  QTUM: 'QTUM',
  PTS: 'PTS',
  PPC: 'PPC',
  GAS: 'GAS',
  NMC: 'NMC',
  MEC: 'MEC',
  LTC: 'LTC',
  KMD: 'KMD',
  HUSH: 'HUSH',
  GRLC: 'GRLC',
  FRC: 'FRC',
  DOGE: 'DOGE',
  DGB: 'DGB',
  DCR: 'DCR',
  CLO: 'CLO',
  BTG: 'BTG',
  BCH: 'BCH',
  BIO: 'BIO',
  BVC: 'BVC',
  BKX: 'BKX',
  AUR: 'AUR',
  ZIL: 'ZIL',
};

const CRYPTO_SYMBOL_UNSHIELD = {
  ETH: 'ETH',
  TOMO: 'TOMO',
  BTC: 'BTC',
  NEO: 'NEO',
  ZEN: 'ZEN',
  ZCL: 'ZCL',
  ZEC: 'ZEC',
  VOT: 'VOT',
  VTC: 'VTC',
  SNG: 'SNG',
  XRP: 'XRP',
  XRB: 'XRB',
  QTUM: 'QTUM',
  PTS: 'PTS',
  PPC: 'PPC',
  GAS: 'GAS',
  NMC: 'NMC',
  MEC: 'MEC',
  LTC: 'LTC',
  KMD: 'KMD',
  HUSH: 'HUSH',
  GRLC: 'GRLC',
  FRC: 'FRC',
  DOGE: 'DOGE',
  DGB: 'DGB',
  DCR: 'DCR',
  CLO: 'CLO',
  BTG: 'BTG',
  BCH: 'BCH',
  BIO: 'BIO',
  BVC: 'BVC',
  BKX: 'BKX',
  AUR: 'AUR',
};

const TOKEN_SYMBOL = {
  pETH: 'pETH',
  pBTC: 'pBTC',
  pBNB: 'pBNB',
  pUSD: 'pUSD',
  pKCS: 'pKCS',
};

const TOKEN_ID = {
  pETH: 'ffd8d42dc40a8d166ea4848baf8b5f6e912ad79875f4373070b59392b1756c8f',
  pBTC: 'b832e5d3b1f01a4f0623f7fe91d6673461e1f5d37d91fe78c5c2e6183ff39696',
  pBNB: 'b2655152784e8639fa19521a7035f331eea1f1e911b2f3200a507ebb4554387b',
  pNEO: '86c45a9fdddc5546e3b4f09dba211b836aefc5d08ed22e7d33cff7f9b8b39c10',
};

const AMOUNT_MAX_FRACTION_DIGITS = 4;

const TRACK_LOG_EVENT = {
  CLICK_STAKING: 'click_staking',
};

const TRACK_LOG_EVENT_STATUS = {
  BEGIN: 'INIT',
  DOING: 'DOING',
  PASS: 'PASS',
  FAIL: 'FAIL',
};

const YEAR_SECONDS = 365 * 24 * 60 * 60;

const PRV_SPECIAL_SYMBOL = 'ℙ';
const USD_SPECIAL_SYMBOL = '$';

const NETWORK_NAME = {
  BINANCE: 'Binance',
  ETHEREUM: 'Ethereum',
  TOMO: 'TomoChain',
  BSC: 'Binance Smart Chain',
  PRV: 'Privacy',
};

export const PRV = {
  id: '0000000000000000000000000000000000000000000000000000000000000004',
  name: 'Privacy',
  displayName: 'Privacy',
  symbol: 'PRV',
  pDecimals: 9,
  hasIcon: true,
  originalSymbol: 'PRV',
  isVerified: true,
};

export const PRV_ID = PRV.id;
const FACTORIES_EVM_NETWORK = [
  NETWORK_NAME.ETHEREUM,
  NETWORK_NAME.TOMO,
  NETWORK_NAME.BSC,
  NETWORK_NAME.PRV,
];

const PRIVATE_TOKEN_CURRENCY_TYPE = {
  ETH: 1,
  BTC: 2,
  ERC20: 3,
  BNB: 4,
  BNB_BEP2: 5,
  USD: 6,
  BSC_BNB: 7,
  BSC_BEP20: 8,

  TOMO: 9,
  ZIL: 10,
  XMR: 11,
  NEO: 12,
  DASH: 13,
  LTC: 14,
  DOGE: 15,
  ZEC: 16,
  DOT: 17,
};

const PRIVATE_TOKEN_CURRENCY_NAME = {
  [PRIVATE_TOKEN_CURRENCY_TYPE.ERC20]: 'ERC20 Ethereum',
  [PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BEP20]: 'BEP20 Smart Chain',
};

const RESPONSE_PRV_TYPES = [271, 273];

export default {
  // old varibles, maybe remove later
  STAKING_TYPES: {
    SHARD: 0,
    BEACON: 1,
  },
  STAKING_AMOUNT: 200,
  STAKING_MIN_FEE: 0.01,
  STAKING_ADDRESS:
    '1NHp2EKw7ALdXUzBfoRJvKrBBM9nkejyDcHVPvUjDcWRyG22dHHyiBKQGL1c',
  DEFRAGMENT_DEFAULT_AMOUNT: 1,
  DEFRAGMENT_MIN_FEE: 0.01,
  DEFRAGMENT_SET_DEFAULT_PRIVACY: true,

  AMOUNT_MAX_FRACTION_DIGITS,

  // for new app
  ETH_TOKEN_ADDRESS: '0x0000000000000000000000000000000000000000',
  CRYPTO_SYMBOL,
  CRYPTO_SYMBOL_UNSHIELD,
  TOKEN_SYMBOL,
  TOKEN_ID,
  PRV_TOKEN_ID:
    '0000000000000000000000000000000000000000000000000000000000000004',
  DECIMALS: {
    MAIN_CRYPTO_CURRENCY: 9,
    [CRYPTO_SYMBOL.PRV]: 9,
  },
  TOKEN_TX_TYPE: {
    INIT: 0,
    SEND: 1,
  },
  ADDRESS_TYPE: {
    DEPOSIT: 1,
    WITHDRAW: 2,
  },
  PRIVATE_TOKEN_CURRENCY_TYPE,
  PRIVATE_TOKEN_CURRENCY_NAME,
  PRIVATE_TOKEN_TYPE: {
    COIN: 0,
    TOKEN: 1, // including ERC20, BEP1, BEP2,...
  },
  HISTORY: {
    TYPE: {
      SHIELD: 1, // same with PRIVATE_TOKEN_HISTORY_ADDRESS_TYPE.DEPOSIT
      UNSHIELD: 2, // same with PRIVATE_TOKEN_HISTORY_ADDRESS_TYPE.WITHDRAW
      SEND: 3, // custom
      RECEIVE: 4, // custom,
      PROVIDE: -999,
    },
    STATUS_TEXT: {
      SUCCESS: 'SUCCESS',
      FAILED: 'FAILED',
      PENDING: 'PENDING',
      EXPIRED: 'EXPIRED',
    },
    META_DATA_TYPE: {
      44: 'Node withdraw',
      63: 'Stake',
      90: 'Add liquidity',
      93: 'Remove liquidity',
      27: 'Unshield',
      127: 'Unstake',
      240: 'Unshield',
    },
    STATUS_CODE: {
      PENDING: 0,
    },
    //shield decentralized
    STATUS_CODE_SHIELD_DECENTRALIZED: {
      PENDING: 0,
      PROCESSING: [1, 2, 3, 4, 5],
      COMPLETE: 7,
      TIMED_OUT: 14,
      RETRYING: 6,
    },
    //shield centralized
    STATUS_CODE_SHIELD_CENTRALIZED: {
      PENDING: 0,
      PROCESSING: [1, 2],
      COMPLETE: [3, 5],
      TIMED_OUT: [14, 16],
      EXPIRED: [16],
      INVALID_AMOUNT: [17]
    },
    //unshield decentralized
    STATUS_CODE_UNSHIELD_DECENTRALIZED: {
      PROCESSING: [8, 11],
      FAILED: [9, 15],
      COMPLETE: 12,
      RETRYING: [10, 13],
      TIMED_OUT: 14,
    },
    //unshield centralized
    STATUS_CODE_UNSHIELD_CENTRALIZED: {
      PENDING: 0,
      PROCESSING: [6, 7, 8, 9],
      COMPLETE: 10,
      RETRYING: 15,
      TIMED_OUT: 16,
    },
    TYPE_HISTORY_RECEIVE: {
      41: 'Unstake Node',
      45: 'Node withdraw',
      81: 'Shield', //decentralized
      94: 'Remove liquidity',
      95: 'Add liquidity',
      96: 'Shield Amount',
      25: 'Shield', //centralized
      92: 'Trade',
    },
  },
  TRACK_LOG_EVENT,
  TRACK_LOG_EVENT_STATUS,
  PRV,
  PRV_ID,
  USDT: {
    id: '716fd1009e2a1669caacc36891e707bfdf02590f96ebd897548e8963c95ebac0',
    pDecimals: 9,
    name: 'Tether',
    symbol: 'pUSDT',
  },
  YEAR_SECONDS,
  PRV_SPECIAL_SYMBOL,
  USD_SPECIAL_SYMBOL,
  NETWORK_NAME,
  FACTORIES_EVM_NETWORK,
  CURRENCY_TYPE_BRIDGE: [
    PRIVATE_TOKEN_CURRENCY_TYPE.ETH,
    PRIVATE_TOKEN_CURRENCY_TYPE.ERC20,
    PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BNB,
    PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BEP20,
  ],
  RESPONSE_PRV_TYPES,
};
