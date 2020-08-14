import formatUtil from '@utils/format';
import config from '@src/constants/config';

export const DEX_CHAIN_ACCOUNT = {
  PaymentAddress: '15pABFiJVeh9D5uiQEhQX4SVibGGbdAVipQxBdxkmDqAJaoG1EdFKHBrNfs'
};
export const PRV_ID = '0000000000000000000000000000000000000000000000000000000000000004';

export const BIG_COINS = {
  PRV: PRV_ID,
  USDT: config.USDT_TOKEN_ID,
  BTC: 'b832e5d3b1f01a4f0623f7fe91d6673461e1f5d37d91fe78c5c2e6183ff39696',
  ETH: 'ffd8d42dc40a8d166ea4848baf8b5f6e912ad79875f4373070b59392b1756c8f',
  BUSD: '9e1142557e63fd20dee7f3c9524ffe0aa41198c494aa8d36447d12e85f0ddce7',
  USDC: '1ff2da446abfebea3ba30385e2ca99b0f0bbeda5c6371f4c23c939672b429a42',
  BNB: 'b2655152784e8639fa19521a7035f331eea1f1e911b2f3200a507ebb4554387b',
  DAI: '3f89c75324b46f13c7b036871060e641d996a24c09b3065835cb1d38b799d6c1',
  SAI: 'd240c61c6066fed0535df9302f1be9f5c9728ef6d01ce88d525c4f6ff9d65a56',
  TUSD: '8c3a61e77061265aaefa1e7160abfe343c2189278dd224bb7da6e7edc6a1d4db',
  TOMO: 'a0a22d131bbfdc892938542f0dbe1a7f2f48e16bc46bf1c5404319335dc1f0df',
  LINK: 'e0926da2436adc42e65ca174e590c7b17040cd0b7bdf35982f0dd7fc067f6bcf',
  BAT: '1fe75e9afa01b85126370a1583c7af9f1a5731625ef076ece396fcc6584c2b44',
  BAND: '2dda855fb4660225882d11136a64ad80effbddfa18a168f78924629b8664a6b3',
  ZRX: 'de395b1914718702687b477703bdd36e52119033a9037bb28f6b33a3d0c2f867',
  FTM: 'd09ad0af0a34ea3e13b772ef9918b71793a18c79b2b75aec42c53b69537029fe',
  ZIL: '880ea0787f6c1555e59e3958a595086b7802fc7a38276bcd80d4525606557fbc',
  MCO: 'caaf286e889a8e0cee122f434d3770385a0fd92d27fcee737405b73c45b4f05f',
  GUSD: '465b0f709844be95d97e1f5c484e79c6c1ac51d28de2a68020e7313d34f644fe',
  PAX: '4a790f603aa2e7afe8b354e63758bb187a4724293d6057a46859c81b7bd0e9fb',
  KCS: '513467653e06af73cd2b2874dd4af948f11f1c6f2689e994c055fd6934349e05',
  OMG: '249ca174b4dce58ea6e1f8eda6e6f74ab6a3de4e4913c4f50c15101001bb467b',
  XMR: 'c01e7dc1d1aba995c19b257412340b057f8ad1482ccb6a9bb0adce61afbf05d4',
  ETH_TESTNET: 'ffd8d42dc40a8d166ea4848baf8b5f6e9fe0e9c30d60062eb7d44a8df9e00854',
};

export const PRIORITY_LIST = [
  BIG_COINS.PRV,
  BIG_COINS.USDC,
  BIG_COINS.USDT,
  BIG_COINS.DAI,
  BIG_COINS.BTC,
  BIG_COINS.ETH_TESTNET,
  BIG_COINS.ETH,
  BIG_COINS.XMR,
  BIG_COINS.BUSD,
  BIG_COINS.TUSD,
  BIG_COINS.GUSD,
  BIG_COINS.SAI,
  BIG_COINS.PAX,
  BIG_COINS.BNB,
  BIG_COINS.MCO,
  BIG_COINS.LINK,
  BIG_COINS.KCS,
  BIG_COINS.OMG,
  BIG_COINS.TOMO,
  BIG_COINS.BAND,
  BIG_COINS.ZRX,
  BIG_COINS.FTM,
  BIG_COINS.ZIL,
];
export const WAIT_TIME = 30000;
export const MESSAGES = {
  BALANCE_INSUFFICIENT: 'Your balance is insufficient.',
  NEGATIVE_NUMBER: 'Please enter an amount greater than 0.',
  NOT_NEGATIVE_NUMBER: 'Please enter a number greater than or equal to 0.',
  GREATER_OR_EQUAL: (number, pDecimals) => `Please enter a number greater than or equal to ${formatUtil.amountFull(number, pDecimals)}.`,
  GREATER: (number, pDecimals) => `Please enter a number greater than ${formatUtil.amountFull(number, pDecimals)}.`,
  SMALLER_THAN_100: 'Please enter a number less than 100.',
  MUST_BE_NUMBER: 'Must be a positive number.',
  TRADE_ERROR: 'We seem to have hit a snag. Please initiate the trade again.',
  TRADE_SUCCESS: 'Your balance will update in a couple of minutes after the trade is finalized.',
  TRADE_SUCCESS_TITLE: 'Trade initiated',
  DEPOSIT_ERROR: 'We seem to have hit a snag. Please try making a deposit again.',
  DEPOSIT_SUCCESS: 'Funds are on the way to your pDEX account. Your balance will update in a couple of minutes.',
  DEPOSIT_SUCCESS_TITLE: 'Deposit in process',
  WITHDRAW_ERROR: 'We seem to have hit a snag. Please try withdrawing again.',
  WITHDRAW_SUCCESS: name => `Funds are on the way to ${name}. The account balance will update in a couple of minutes`,
  WITHDRAW_SUCCESS_TITLE: 'Withdrawal in process',
  NOT_ENOUGH_NETWORK_FEE: 'Your balance is currently insufficient. Please adjust your fee settings and try again.',
  NOT_ENOUGH_PRV_NETWORK_FEE: 'Please top up enough PRV to cover the fee.',
  NOT_ENOUGH_BALANCE_TO_TRADE: (symbol) => `You don't have enough ${symbol} to complete this trade. Please make a deposit.`,
  NOT_ENOUGH_BALANCE: (symbol) => `You don't have enough ${symbol}. Please make a deposit.`,
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  TRADE: 'trade',
  ADD_LIQUIDITY: 'add liquidity',
  REMOVE_LIQUIDITY: 'remove liquidity',
  RETRY_WITHDRAW: 'Withdraw unsuccessful. Please go into withdraw detail in history to retry.',
  WITHDRAW_COMPLETED: 'Withdraw successfully. Your balance will update in a couple of minutes',
  WITHDRAW_BALANCE: 'PDexWithdraw account balance is insufficient',
  SOMETHING_WRONG: 'Something got stuck. Please make the withdrawal again.',
  PENDING_TRANSACTIONS: 'Please wait for your previous transaction to finish processing. Simply try again later.',
  WITHDRAW_PROCESS: 'Withdrawing your funds...\n\nThis may take a couple of minutes. Please do not navigate away from the app.',
  SHARE_INSUFFICIENT: 'Your share is insufficient.',
  MUST_BE_INTEGER: 'Please enter a whole positive number (not a fraction).',
  NOT_ENOUGH_NETWORK_FEE_ADD: 'Please top up PRV to cover the network fee.',
  ADD_LIQUIDITY_PROCESS: 'Adding your pair...\n\nThis may take a couple of minutes. Please do not navigate away from the app.',
  CANCEL_LIQUIDITY_PROCESS: 'Canceling your request...\n\nThis may take a couple of minutes. Please do not navigate away from the app.',
  ACCOUNT_NOT_FOUND: 'Depositing account not found.',
  NOT_ENOUGH_BALANCE_ADD: (symbol) => `Please top up ${symbol} to complete this action.`,
  TX_REJECTED: 'We seem to have hit a snag. Please try again later.',
  REMOVE_LIQUIDITY_SUCCESS_TITLE: 'Liquidity removal initiated',
  REMOVE_LIQUIDITY_SUCCESS: 'Your balance will update a couple of minutes once liquidity removal is complete.',
  ADD_LIQUIDITY_SUCCESS_TITLE: 'Adding a pair',
  ADD_LIQUIDITY_SUCCESS: 'Your pair will be listed in a couple of minutes.',
  CANCEL_ADD_LIQUIDITY_SUCCESS_TITLE: 'Cancelling your request to add a pair.',
  CANCEL_ADD_LIQUIDITY_SUCCESS: 'Your balance will update in a couple of minutes after the request is complete.',
  NO_PAIR: 'You haven\'t added any pairs yet.',
};
export const MILLISECOND = 1;
export const SECOND = 1000 * MILLISECOND;
export const MINUTE = 60 * SECOND;
export const MIN_INPUT = 1;
export const MAX_WAITING_TIME = 5 * MINUTE;
export const MULTIPLY = 2;
export const REMOVE_LIQUIDITY_TX_SIZE = 20;
export const LIMIT_HISTORY = 5;
export const MIN_CANCEL_VALUE = 1;
export const SHORT_WAIT_TIME = 5000;
export const IGNORED_ACCOUNTS = ['pdex', 'pdexwithdraw'];
