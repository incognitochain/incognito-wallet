import routeNames from '@src/router/routeNames';
import { CONSTANT_CONFIGS } from '@src/constants';

export const ACTION_NAVIGATE_TO_SELECT_TOKENS =
  '[pDexV3][swap] Navigate to Select Token';
export const ACTION_NAVIGATE_FROM_MARKET =
  '[pDexV3][swap] Navigate form Market Tab';
export const ACTION_RESET_EXCHANGE_SUPPORTED =
  '[pDexV3][swap] Reset Exchange supported';

export const ACTION_FETCHING = '[pDexV3][swap] Fetching data';
export const ACTION_FETCHED = '[pDexV3][swap] Fetched data';
export const ACTION_FETCH_FAIL = '[pDexV3][swap] Fetch fail data';

export const ACTION_SET_SELL_TOKEN = '[pDexV3][swap] Set sell token';
export const ACTION_SET_BUY_TOKEN = '[pDexV3][swap] Set buy token';
export const ACTION_SET_FEE_TOKEN = '[pDexV3][swap] Set fee token';
export const ACTION_SET_FOCUS_TOKEN = '[pDexV3][swap] Set focus token';

export const ACTION_SET_SELECTING_TOKEN = '[pDexV3][swap] Set selecting token';
export const ACTION_SET_SWAPING_TOKEN = '[pDexV3][swap] Set swapingToken token';
export const ACTION_SET_INITIING_SWAP = '[pDexV3][swap] Set initing token';
export const ACTION_ESTIMATE_TRADE_ERROR =
  '[pDexV3][swap] Estimate Trade Error';
export const ACTION_ESTIMATE_COUNT = '[pDexV3][swap] Estimate Count';

export const ACTION_SAVE_UNIFIED_ALERT_STATE_BY_ID =
  '[pDexV3] Save Unified alert state by id';

export const ACTION_SET_PERCENT = '[pDexV3][swap] Set percent';

export const ACTION_RESET = '[pDexV3][swap] Reset';
export const ACTION_FETCH_SWAP = '[pDexV3][swap] Fetching swap';
export const ACTION_FETCHED_LIST_PAIRS = '[pDexV3][swap] Fetched list pairs';

export const ACTION_FETCHING_ORDERS_HISTORY =
  '[pDexV3][swap] Fetching history order';
export const ACTION_FETCHED_ORDERS_HISTORY =
  '[pDexV3][swap] Fetched history order';
export const ACTION_FETCH_FAIL_ORDERS_HISTORY =
  '[pDexV3][swap] Fetch fail history order';
export const ACTION_FETCH_ORDER_DETAIL = '[pDexV3][swap] Fetch order detail';
export const ACTION_FETCHING_ORDER_DETAIL =
  '[pDexV3][swap] Fetching order detail';
export const ACTION_FETCHED_ORDER_DETAIL =
  '[pDexV3][swap] Fetched order detail';
export const ACTION_SET_DEFAULT_PAIR = '[pDexV3][swap] Set default pair';
export const ACTION_TOGGLE_PRO_TAB = '[pDexV3][swap] Toggle pro tab';

export const ACTION_CHANGE_SELECTED_PLATFORM =
  '[pDexV3][swap] Change selected platform';
// export const ACTION_CHANGE_STATUS_VISIBLE_PLATFORM =
//   '[pDexV3][swap] Change status visible platform';

export const ACTION_SAVE_LAST_FIELD = '[pDexV3][swap] Save last field';
export const ACTION_CHANGE_ESTIMATE_DATA =
  '[pDexV3][swap] Change estimate data';
export const ACTION_SET_ERROR = '[pDexV3][swap] Action set error';
export const ACTION_SET_DEFAULT_EXCHANGE =
  '[pDexV3][swap] Set default exchange';
export const ACTION_REMOVE_ERROR =
  '[pDexV3][swap] Action remove error from platforms';
export const ACTION_FREE_HISTORY_ORDERS = '[pDexV3][swap] Free history orders';

export const ACTION_CHANGE_SLIPPAGE = '[pDexV3][swap] Change slippage';

export const ACTION_FETCHING_REWARD_HISTORY =
  '[pDexV3][swap] Fetching reward history';
export const ACTION_FETCHED_REWARD_HISTORY =
  '[pDexV3][swap] Fetched reward history';
export const ACTION_FETCH_FAIL_REWARD_HISTORY =
  '[pDexV3][swap] Fetch fail reward history';

export const ACTION_RESET_DATA = '[pDexV3][swap] Reset data';

export const TAB_SIMPLE_ID = '[swap] simple';
export const TAB_PRO_ID = '[swap] pro';
export const ROOT_TAB_ID = 'ROOT_TAB_SWAP';

export const ROOT_TAB_SUB_INFO = 'ROOT_TAB_SUB_INFO';
export const TAB_HISTORY_ID = '[swap_sub_info] history order';

export const ROOT_TAB_SWAP_HISTORY = 'ROOT_TAB_SWAP_HISTORY';
export const TAB_SWAP_HISTORY_ID = 'swap_sub_info] swap history';
export const TAB_REWARD_HISTORY_ID = '[swap_sub_info] reward history';

export const ACTION_SET_BEST_RATE_EXCHANGE =
  '[pDexV3][swap] Set Best Rate Exchange';
export const ACTION_SET_EXCHANGE_SUPPORT_LIST =
  '[pDexV3][swap] Set Exchange support list';
export const ACTION_SET_RESET_SLIPPAGE =
  '[pDexV3][swap] ACTION_SET_RESET_SLIPPAGE';

export const SCREENS_TO_SHOW_REWARD_HISTORY_TAB = [
  routeNames.PrivacyAppsPancake,
  routeNames.PrivacyAppsUni,
  routeNames.PrivacyAppsCurve,
  routeNames.PrivacyAppsSpooky,
];

export const formConfigs = {
  formName: 'FORM_SWAP',
  selltoken: 'selltoken',
  buytoken: 'buytoken',
  slippagetolerance: 'slippagetolerance',
  feetoken: 'feetoken',
};

export const KEYS_PLATFORMS_SUPPORTED = {
  incognito: 'incognito',
  pancake: 'pancake',
  uniswap: 'uniswap',
  uni: 'uni',
  curve: 'curve',
  spooky: 'spooky',
  uniEther: 'uniEther',
  joe: 'joe',
  trisolaris: 'trisolaris',
  interswap: 'interswap',
};

export const KEYS_PLATFORMS_SUPPORTED_NETWORKS = {
  incognito: ['bsc', 'plg', 'eth', 'inc'],
  pancake: ['bsc'],
  uni: ['plg'],
  curve: ['plg'],
};

export const NETWORK_NAME_SUPPORTED = {
  INCOGNITO: 'inc',
  ETHEREUM: 'eth',
  POLYGON: 'plg',
  FANTOM: 'ftm',
  BINANCE_SMART_CHAIN: 'bsc',
  AURORA: 'aurora',
  AVALANCHE: 'avax',
  NEAR: 'near',
  INTER_SWAP: 'interswap'
};

export const PLATFORMS_SUPPORTED = [
  {
    id: KEYS_PLATFORMS_SUPPORTED.incognito,
    title: 'Incognito',
    desc: '',
    visible: true,
    isSelected: true,
  },
  {
    id: KEYS_PLATFORMS_SUPPORTED.pancake,
    title: 'PancakeSwap',
    desc: '',
    visible: true,
    isSelected: false,
  },
  {
    id: KEYS_PLATFORMS_SUPPORTED.uni,
    title: 'Uniswap (Polygon)',
    desc: '',
    visible: true,
    isSelected: false,
  },
  {
    id: KEYS_PLATFORMS_SUPPORTED.uniEther,
    title: 'Uniswap (Ethereum)',
    desc: '',
    visible: true,
    isSelected: false,
  },
  {
    id: KEYS_PLATFORMS_SUPPORTED.curve,
    title: 'Curve',
    desc: '',
    visible: true,
    isSelected: false,
  },
  {
    id: KEYS_PLATFORMS_SUPPORTED.spooky,
    title: 'Spooky',
    desc: '',
    visible: true,
    isSelected: false,
  },

  {
    id: KEYS_PLATFORMS_SUPPORTED.joe,
    title: 'Joe',
    desc: '',
    visible: true,
    isSelected: false,
  },

  {
    id: KEYS_PLATFORMS_SUPPORTED.trisolaris,
    title: 'Trisolaris',
    desc: '',
    visible: true,
    isSelected: false,
  },
  {
    id: KEYS_PLATFORMS_SUPPORTED.interswap,
    title: 'Inter-liquidity pools',
    desc: '',
    visible: true,
    isSelected: true,
  },
];

const isMainnet = global.isMainnet;

export const CALL_CONTRACT = {
  UNI_ETH: isMainnet
    ? '0xe38e54B2d6B1FCdfaAe8B674bF36ca62429fdBDe'
    : '0xf31D49B636C24a854Eabe9BB05e85baA7411A380',

  PANCAKE_BSC: isMainnet
    ? '0x95Cd8898917c7216Da0517aAB6A115d7A7b6CA90'
    : '0x0e2923c21E2C5A2BDD18aa460B3FdDDDaDb0aE18',

  CURVE_PLG: isMainnet ? '0x55b08b7c1ecdc1931660b18fe2d46ce7b20613e2' : '',

  UNI_PLG: isMainnet
    ? '0xCC8c88e9Dae72fa07aC077933a2E73d146FECdf0'
    : '0xAe85BB3D2ED209736E4d236DcE24624EA1A04249',

  SPOOKY_FTM: isMainnet
    ? '0x6e6Cc30856eB766557418d58af6ED8eaB767940d'
    : '0x14D0cf3bC307aA15DA40Aa4c8cc2A2a81eF96B3a',

  JOE_AVAX: isMainnet
    ? '0xb247b4ae0a267f30e5de9548ca7bf7ad64f70ed0'
    : '0xd17E836453f7DaF2F2d6F8dFdd56449bc97446F4',

  TRISOLARIS_AURORA: isMainnet
    ? '0x6e6Cc30856eB766557418d58af6ED8eaB767940d'
    : '0xA17b90be4A5F79076c770384332515359D2F6A88',
};

export const getExchangeDataWithCallContract = ({ callContract, pAppNetwork }) => {
  let name = 'Incognito';
  let exchangeScan = CONSTANT_CONFIGS.EXPLORER_CONSTANT_CHAIN_URL;
  if (pAppNetwork) {
    name = 'Inter-liquidity pools';
    switch (pAppNetwork) {
      case NETWORK_NAME_SUPPORTED.ETHEREUM:
        exchangeScan = CONSTANT_CONFIGS.ETHERSCAN_URL;
        break;
      case NETWORK_NAME_SUPPORTED.BINANCE_SMART_CHAIN:
        exchangeScan = CONSTANT_CONFIGS.BSCSCAN_URL;
        break;
      case NETWORK_NAME_SUPPORTED.POLYGON:
        exchangeScan = CONSTANT_CONFIGS.POLYGONSCAN_URL;
        break;
      case NETWORK_NAME_SUPPORTED.FANTOM:
        exchangeScan = CONSTANT_CONFIGS.FANTOMSCAN_URL;
        break;
      case NETWORK_NAME_SUPPORTED.AVALANCHE:
        exchangeScan = CONSTANT_CONFIGS.AVAXSCAN_URL;
        break;
      case NETWORK_NAME_SUPPORTED.AURORA:
        exchangeScan = CONSTANT_CONFIGS.AURORASCAN_URL;
        break;
    }
  } else {
    if (CALL_CONTRACT.UNI_ETH.includes(callContract)) {
      name = 'Uniswap (ETH)';
      exchangeScan = CONSTANT_CONFIGS.ETHERSCAN_URL;
    } else if (CALL_CONTRACT.PANCAKE_BSC.includes(callContract)) {
      name = 'Pancake';
      exchangeScan = CONSTANT_CONFIGS.BSCSCAN_URL;
    } else if (CALL_CONTRACT.UNI_PLG.includes(callContract)) {
      name = 'Uniswap (PLG)';
      exchangeScan = CONSTANT_CONFIGS.POLYGONSCAN_URL;
    } else if (CALL_CONTRACT.SPOOKY_FTM.includes(callContract)) {
      name = 'Spooky';
      exchangeScan = CONSTANT_CONFIGS.FANTOMSCAN_URL;
    } else if (CALL_CONTRACT.CURVE_PLG.includes(callContract)) {
      name = 'Curve';
      exchangeScan = CONSTANT_CONFIGS.POLYGONSCAN_URL;
    } else if (CALL_CONTRACT.JOE_AVAX.includes(callContract)) {
      name = 'Joe';
      exchangeScan = CONSTANT_CONFIGS.AVAXSCAN_URL;
    } else if (CALL_CONTRACT.TRISOLARIS_AURORA.includes(callContract)) {
      name = 'Trisolaris';
      exchangeScan = CONSTANT_CONFIGS.AURORASCAN_URL;
    }
  }

  return { name, exchangeScan };
};

export const RULE_SORT = {
  key: ['isPRV', 'isPUnifiedToken', 'network', 'symbol'],
  value: ['desc', 'desc', 'asc', 'asc'],
};

export const RULE_SEARCH = ['displayName', 'name', 'symbol', 'pSymbol'];
// milliseconds * seconds * minutes * hours = 1 day
export const ONE_DAY = 24 * 60 * 60 * 1000; // 1 day
// export const ONE_DAY = 1 * 60 * 1000; //1 minute

export const ESTIMATE_COUNT_MAX = 2;

export const SWAP_DEFAULT_FAIR = {
  selltoken: '076a4423fa20922526bd50b0d7b0dc1c593ce16e15ba141ede5fb5a28aa3f229', // USDT_UNIFIED
  buytoken: '0000000000000000000000000000000000000000000000000000000000000004', // PRV
  // selltoken: '26df4d1bca9fd1a8871a24b9b84fc97f3dd62ca8809975c6d971d1b79d1d9f31', // MATIC_UNIFIED
  // buytoken: 'c01e7dc1d1aba995c19b257412340b057f8ad1482ccb6a9bb0adce61afbf05d4', // XMR
};