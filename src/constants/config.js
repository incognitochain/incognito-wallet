import { KEY } from '@src/services/wallet/Server';
import {
  API_BASE_URL_MAINNET,
  API_BASE_URL_TESTNET,
  BINANCE_EXPLORER_URL_MAINNET,
  BINANCE_EXPLORER_URL_TESTNET,
  CRYPTO_ICON_URL,
  DEX_BINANCE_TOKEN_URL_MAINNET,
  DEX_BINANCE_TOKEN_URL_TESTNET,
  ETHERSCAN_URL_MAINNET,
  ETHERSCAN_URL_TESTNET,
  EXPLORER_CONSTANT_CHAIN_URL as TEMPLATE_EXPLORER_CONSTANT_CHAIN_URL,
  INCOGNITO_TOKEN_ICON_URL_MAINNET,
  INCOGNITO_TOKEN_ICON_URL_TESTNET,
  MAINNET_SERVER_ADDRESS,
  NODE_URL,
  PASSPHRASE_WALLET_DEFAULT,
  PASSWORD_SECRET_KEY,
  TESTNET_SERVER_ADDRESS,
  TEST_URL,
  USDT_TOKEN_ID_MAINNET,
  USDT_TOKEN_ID_TESTNET,
} from 'react-native-dotenv';
import pkg from '../../package.json';

const TAG = 'Config';
const regex = /<%=.*%>/;


const isMainnet = global.isMainnet??true;

export const prefix_network = isMainnet ?'mainnet':'testnet';
export const MAIN_WEBSITE = 'https://incognito.org/latest?utm_source=mobileapp';
const prefix_Api = isMainnet?'':'test-';

const API_BASE_URL = isMainnet? API_BASE_URL_MAINNET:API_BASE_URL_TESTNET;
const ETHERSCAN_URL = isMainnet ? ETHERSCAN_URL_MAINNET : ETHERSCAN_URL_TESTNET;
const DEX_BINANCE_TOKEN_URL = isMainnet ? DEX_BINANCE_TOKEN_URL_MAINNET : DEX_BINANCE_TOKEN_URL_TESTNET;
const BINANCE_EXPLORER_URL = isMainnet ? BINANCE_EXPLORER_URL_MAINNET : BINANCE_EXPLORER_URL_TESTNET;
const INCOGNITO_TOKEN_ICON_URL = isMainnet? INCOGNITO_TOKEN_ICON_URL_MAINNET:INCOGNITO_TOKEN_ICON_URL_TESTNET;
const BUILD_VERSION = pkg.version;
const EXPLORER_CONSTANT_CHAIN_URL = String(TEMPLATE_EXPLORER_CONSTANT_CHAIN_URL).replace(regex,prefix_network);
const MASTER_NODE_ADDRESS=isMainnet?MAINNET_SERVER_ADDRESS:TESTNET_SERVER_ADDRESS;
const DEFAULT_LIST_SERVER = KEY.DEFAULT_LIST_SERVER;
const USDT_TOKEN_ID = isMainnet ? USDT_TOKEN_ID_MAINNET : USDT_TOKEN_ID_TESTNET;
const TRACK_LOG_URL = 'https://device-network.incognito.org';

const ETH_TOKEN_ID = isMainnet ?
  'ffd8d42dc40a8d166ea4848baf8b5f6e912ad79875f4373070b59392b1756c8f' :
  'ffd8d42dc40a8d166ea4848baf8b5f6e9fe0e9c30d60062eb7d44a8df9e00854';

const OX_EXCHANGE_URL_MAINNET = 'https://api.0x.org/';
const OX_EXCHANGE_URL_TESTNET = 'https://kovan.api.0x.org/';

const OX_EXCHANGE_URL = isMainnet ? OX_EXCHANGE_URL_MAINNET : OX_EXCHANGE_URL_TESTNET;

export default {
  isMainnet,
  CRYPTO_ICON_URL,
  INCOGNITO_TOKEN_ICON_URL,
  API_BASE_URL,
  PASSWORD_SECRET_KEY,
  EXPLORER_CONSTANT_CHAIN_URL,
  DEFAULT_LIST_SERVER,
  PASSPHRASE_WALLET_DEFAULT,
  TEST_URL,
  MASTER_NODE_ADDRESS,
  DEX_BINANCE_TOKEN_URL,
  BUILD_VERSION,
  ETHERSCAN_URL,
  BINANCE_EXPLORER_URL,
  USDT_TOKEN_ID,
  NODE_URL,
  TRACK_LOG_URL,
  MAIN_WEBSITE,
  OX_EXCHANGE_URL,
  ETH_TOKEN_ID,
};
