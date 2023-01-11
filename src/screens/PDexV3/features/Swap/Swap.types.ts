import { CONSTANT_COMMONS } from '@src/constants';
import { NETWORK_NAME_SUPPORTED } from './Swap.constant';

const INCOGNITO_NETWORK = 0;
const ETH_NETWORK = 1;
const BSC_NETWORK = 2;
const POLYGON_NETWORK = 3;
const FANTOM_NETWORK = 4;
const AURORA_NETWORK = 5;
const AVALANCHE_NETWORK = 6;
const NEAR_NETWORK = 7; // TO DO, change after

export const MAIN_NETWORK = {
  ETH: ETH_NETWORK,
  BSC: BSC_NETWORK,
  POLYGON: POLYGON_NETWORK,
  FANTOM: FANTOM_NETWORK,
  AURORA: AURORA_NETWORK,
  AVALANCHE: AVALANCHE_NETWORK,
  NEAR: NEAR_NETWORK,
};

export type EXCHANGES_NETWROK_ID =
  | typeof INCOGNITO_NETWORK
  | typeof ETH_NETWORK
  | typeof BSC_NETWORK
  | typeof POLYGON_NETWORK
  | typeof FANTOM_NETWORK
  | typeof AURORA_NETWORK
  | typeof AVALANCHE_NETWORK
  | typeof NEAR_NETWORK;

export type KeysPlatformSupported =
  | 'incognito'
  | 'pancake'
  | 'uni'
  | 'uniEther'
  | 'curve'
  | 'spooky'
  | 'joe'
  | 'trisolaris'
  | 'interswap';

type NETWORK_IDS_MAPPING_TYPE = {
  [key: string]: EXCHANGES_NETWROK_ID;
};

export const NETWORK_IDS_MAPPING: NETWORK_IDS_MAPPING_TYPE = {
  [NETWORK_NAME_SUPPORTED.INCOGNITO]: INCOGNITO_NETWORK,
  [NETWORK_NAME_SUPPORTED.ETHEREUM]: ETH_NETWORK,
  [NETWORK_NAME_SUPPORTED.BINANCE_SMART_CHAIN]: BSC_NETWORK,
  [NETWORK_NAME_SUPPORTED.POLYGON]: POLYGON_NETWORK,
  [NETWORK_NAME_SUPPORTED.FANTOM]: FANTOM_NETWORK,
  [NETWORK_NAME_SUPPORTED.AURORA]: AURORA_NETWORK,
  [NETWORK_NAME_SUPPORTED.AVALANCHE]: AVALANCHE_NETWORK,
};

export interface IGroupNetwork {
  [key: string]: number[];
}

export type InterSwapData = {
  midOTA: string;
  midToken: string;
  fistBatchIsPDex: boolean;
  pdexMinAcceptableAmount: string;
  pAppName: string;
  pAppNetwork: string;
  path: {
    logoIcon: string;
    tradePath: string | string[];
  }[];
}

export type ExchangeData = {
  amountIn: number;
  amountInRaw: number;
  amountOut: number;
  amountOutStr: string;
  amountOutRaw: number;
  appName: string;
  exchangeName: string;
  amountOutPreSlippage: string;
  amountOutPreSlippageNumber: number;
  redepositReward: number;
  rate: number;
  rateStr: string;
  fees: {
    amount: number;
    tokenid: string;
    amountInBuyToken: string;
  }[];
  routes: string[] | string;
  incTokenID: string;
  feeAddress: string;
  callContract: string;
  callData: string;
  poolPairs?: string;
  impactAmount: string | number;
  networkID: EXCHANGES_NETWROK_ID;
  networkName: string;
  feeAddressShardID: number;
  platformNameSupported: KeysPlatformSupported;

  // Just support inter swap
  interSwapData: InterSwapData | undefined;
};

export type ExchangeRawDetail = {
  AmountIn: string;
  AmountInRaw: string;
  AmountOut: string;
  AmountOutRaw: string;
  AppName: string;
  AmountOutPreSlippage: string;
  RedepositReward: string;
  Rate: string;
  Fee: {
    amount: number;
    tokenid: string;
    amountInBuyToken: string;
  }[];
  FeeAddress: string;
  FeeAddressShardID: number;
  Paths: string[] | string;
  CallContract: string;
  Calldata: string;
  PoolPairs?: string;
  ImpactAmount: string;
  RouteDebug: string[];

  PAppNetwork: string;
  Details: ExchangeRawDetail[];
  MidOTA: string;
  MidToken: string;
};

export type EstimateRawData = {
  [network: string]: ExchangeRawDetail[];
};

export const NetworkNameShorten = {
  INCOGNITO: 'inc',
  ETHEREUM: 'eth',
  POLYGON: 'plg',
  FANTOM: 'ftm',
  BINANCE_SMART_CHAIN: 'bsc',
  AVALANCHE: 'avax',
  AURORA: 'aurora',
  NEAR: 'near',
};

// export type NetworkNameShorten = 'inc' | 'eth' | 'plg' | 'ftm' | 'bsc';

export const NetworkIdsMapping = {
  [NetworkNameShorten.INCOGNITO]: INCOGNITO_NETWORK,
  [NetworkNameShorten.ETHEREUM]: ETH_NETWORK,
  [NetworkNameShorten.BINANCE_SMART_CHAIN]: BSC_NETWORK,
  [NetworkNameShorten.POLYGON]: POLYGON_NETWORK,
  [NetworkNameShorten.FANTOM]: FANTOM_NETWORK,
  [NetworkNameShorten.AURORA]: AURORA_NETWORK,
  [NetworkNameShorten.AVALANCHE]: AURORA_NETWORK,
  [NetworkNameShorten.NEAR]: NEAR_NETWORK,
};

export const PANCAKE_SUPPORT_NETWORK = [
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BNB,
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BEP20,
];

export const UNISWAP_SUPPORT_NETWORK = [
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.ETH,
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.ERC20,
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.MATIC,
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.POLYGON_ERC20,
];

export const CURVE_SUPPORT_NETWORK = [
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.MATIC,
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.POLYGON_ERC20,
];

export const SPOOKY_SUPPORT_NETWORK = [
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.FTM,
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.FANTOM_ERC20,
];

export const TRISOLARIS_SUPPORT_NETWORK = [
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.AURORA_ETH,
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.AURORA_ERC20,
];

export const JOE_SUPPORT_NETWORK = [
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.AVAX,
  CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.AVAX_ERC20,
];
