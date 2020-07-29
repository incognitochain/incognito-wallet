import {
  PASSPHRASE_WALLET_DEFAULT,
  PASSWORD_SECRET_KEY,
} from 'react-native-dotenv';
import { MAINNET_FULLNODE, TESTNET_FULLNODE } from '@services/wallet/Server';
import pkg from '../../package.json';

const isMainnet = global.isMainnet ?? true;

export const MAIN_WEBSITE = 'https://we.incognito.org';

const API_BASE_URL = isMainnet
  ? 'https://api-service.incognito.org'
  : 'https://staging-api-service.incognito.org';
const API_BASE_URL2 = isMainnet
  ? 'https://device-network.incognito.org/'
  : 'https://device-network-staging.incognito.org/';
const ETHERSCAN_URL = isMainnet
  ? 'https://etherscan.io'
  : 'https://kovan.etherscan.io';
const DEX_BINANCE_TOKEN_URL = isMainnet
  ? 'https://dex.binance.org/api/v1/tokens'
  : 'https://testnet-dex.binance.org/api/v1/tokens';
const BINANCE_EXPLORER_URL = isMainnet
  ? 'https://explorer.binance.org'
  : 'https://testnet-explorer.binance.org';
const INCOGNITO_TOKEN_ICON_URL = isMainnet
  ? 'https://storage.googleapis.com/incognito/wallet/tokens/icons'
  : 'https://storage.googleapis.com/incognito/wallet-testnet/tokens/icons';
const BUILD_VERSION = pkg.version;
const EXPLORER_CONSTANT_CHAIN_URL = isMainnet
  ? 'https://mainnet.incognito.org'
  : 'https://testnet.incognito.org';
const MASTER_NODE_ADDRESS = isMainnet ? MAINNET_FULLNODE : TESTNET_FULLNODE;
const NODE_URL = 'https://node.incognito.org/node.html';
const USDT_TOKEN_ID = isMainnet
  ? '716fd1009e2a1669caacc36891e707bfdf02590f96ebd897548e8963c95ebac0'
  : '880ea0787f6c1555e59e3958a595086b7802fc7a38276bcd80d4525606557fbc';
const TRACK_LOG_URL = isMainnet
  ? 'https://device-network.incognito.org'
  : 'https://device-network-staging.incognito.org';

const ETH_TOKEN_ID = isMainnet
  ? 'ffd8d42dc40a8d166ea4848baf8b5f6e912ad79875f4373070b59392b1756c8f'
  : 'ffd8d42dc40a8d166ea4848baf8b5f6e9fe0e9c30d60062eb7d44a8df9e00854';

const CRYPTO_ICON_URL =
  'https://s3.amazonaws.com/incognito-org/wallet/cryptocurrency-icons/32@2x/color';

const HOME_CONFIG_DATA = global.homeConfig !== 'staging'
  ? 'https://api-data.incognito.org/v2/home-configs'
  : 'https://api-data-staging.incognito.org/v2/home-configs';

export default {
  isMainnet,
  CRYPTO_ICON_URL,
  INCOGNITO_TOKEN_ICON_URL,
  API_BASE_URL,
  PASSWORD_SECRET_KEY,
  EXPLORER_CONSTANT_CHAIN_URL,
  PASSPHRASE_WALLET_DEFAULT,
  MASTER_NODE_ADDRESS,
  DEX_BINANCE_TOKEN_URL,
  BUILD_VERSION,
  ETHERSCAN_URL,
  BINANCE_EXPLORER_URL,
  USDT_TOKEN_ID,
  NODE_URL,
  TRACK_LOG_URL,
  MAIN_WEBSITE,
  ETH_TOKEN_ID,
  MAINNET_FULLNODE,
  TESTNET_FULLNODE,
  HOME_CONFIG_DATA,
  API_BASE_URL2,
};
