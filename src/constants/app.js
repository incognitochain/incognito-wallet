const STATUS = {
  INIT: 'INIT',
  READY: 'READY',
  WALLET_IS_NOT_LOADED: 'WALLET_IS_NOT_LOADED',
  ACCOUNT_IS_NOT_LOADED: 'ACCOUNT_IS_NOT_LOADED'
};

const DISABLED = {
  APP:        'app',
  TRADE:      'trade',
  BUY_NODE:   'buynode',
  SHIELD:     'shield',
  SEND:       'send',
  UNSHIELD_DECENTRALIZED: 'unshield-decentralized',
  UNSHIELD_CENTRALIZED:   'unshield-centralized',
  SHIELD_DECENTRALIZED:   'shield-decentralized',
  SHIELD_CENTRALIZED:     'shield-centralized',
  CONVERT_COINS_VER1:     'convert_coins_ver1',
  WALLET:                 'wallet',
  MINT:                   'mint_coin',
  CONVERT_COIN_VER1:      'convert_coins_ver1',
  NODE:                   'node',
  PROVIDE:                'pool',
  LIQUIDITY:              'invest',
  COMMUNITY:              'community',
  STAKING_PDEX3:          'staking',
  EXPLORER:               'explorer',
  FAUCET:                 'faucet_prv',
  KEY_CHAIN:              'keychain',
  SETTING:                'setting',
  HOME:                   'home'
};

const FEATURES_ROUTE_MAP = {
  'Wallet':   'wallet',
  'Stake':    'pool',
  'Dex':      'invest',
  'Node':     'node',
};

const FEATURES_TYPE_MAP = {
  'balance-update':     'wallet',
  'reward-node':        'node',
  'deposit-update':     'wallet',
  'withdraw-coin':      'wallet',
  'unstake-success':    'node',
  'withdraw-success':   'wallet',
};

const STATUS_MESSAGE = {
  PENDING:    'Pending',
  COMPLETE:   'Complete',
  FAILED:     'Failed',
  EXPIRED:    'Expired'
};

const CAPTCHA_KEY = '6LeZpsUaAAAAAChIj86fhwS5fa1krkQ4QPEkcQv9';

const CAPTCHA_DOMAIN = 'https://incognito.org';

export default {
  STATUS,
  DISABLED,
  STATUS_MESSAGE,
  FEATURES_ROUTE_MAP,
  FEATURES_TYPE_MAP,
  CAPTCHA_KEY,
  CAPTCHA_DOMAIN,
};

