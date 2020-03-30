import formatUtil from '@utils/format';

export const PRV_ID = '0000000000000000000000000000000000000000000000000000000000000004';

export const WAIT_TIME = 30000;
export const SHORT_WAIT_TIME = 3000;
export const MESSAGES = {
  BALANCE_INSUFFICIENT: 'Your balance is insufficient.',
  NEGATIVE_NUMBER: 'Please enter an amount greater than 0.',
  NOT_NEGATIVE_NUMBER: 'Please enter a number greater than or equal to 0.',
  GREATER_OR_EQUAL: (number, pDecimals) => `Please enter a number greater than or equal to ${formatUtil.amountFull(number, pDecimals)}.`,
  SMALLER_THAN_100: 'Please enter a number less than 100.',
  MUST_BE_NUMBER: 'Must be a positive number.',
  TRADE_ERROR: 'We seem to have hit a snag. Please initiate the trade again.',
  TRADE_SUCCESS: 'Your balance will update in a couple of minutes after the trade is finalized.',
  TRADE_SUCCESS_TITLE: 'Trade initiated',
  DEPOSIT_ERROR: 'We seem to have hit a snag. Please try making a deposit again.',
  DEPOSIT_SUCCESS: 'Funds are on the way to your smart contract. Your balance will update in a couple of minutes.',
  DEPOSIT_SUCCESS_TITLE: 'Deposit in process',
  WITHDRAW_ERROR: 'We seem to have hit a snag. Please try withdrawing again.',
  WITHDRAW_SUCCESS: name => `Funds are on the way to ${name}. The account balance will update in a couple of minutes`,
  WITHDRAW_SUCCESS_TITLE: 'Withdrawal in process',
  NOT_ENOUGH_NETWORK_FEE: 'Your balance is currently insufficient. Please adjust your fee settings and try again.',
  NOT_ENOUGH_BALANCE_TO_TRADE: (symbol) => `You don't have enough ${symbol} to complete this trade. Please make a deposit.`,
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  TRADE: 'trade',
  WITHDRAW_SC: 'withdrawSC',
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
  PROCESS: 'Completing this action...\n\nPlease do not navigate away from the app.',
};
export const MILLISECOND = 1;
export const SECOND = 1000 * MILLISECOND;
export const MINUTE = 60 * SECOND;
export const MIN_INPUT = 1;
export const MIN_VALUE = 100;
export const MAX_WAITING_TIME = 5 * MINUTE;
export const MULTIPLY = 6;
export const LIMIT_HISTORY = 5;
export const MIN_CANCEL_VALUE = 1;
export const MAX_LENGTH = 20;

export const KYBER_TRADE_ABI = '[{"inputs":[{"internalType":"contractKyberNetwork","name":"_kyberNetworkProxyContract","type":"address"},{"internalType":"addresspayable","name":"_incognitoSmartContract","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"constant":true,"inputs":[],"name":"ETH_CONTRACT_ADDRESS","outputs":[{"internalType":"contractIERC20","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"contractIERC20","name":"srcToken","type":"address"},{"internalType":"uint256","name":"srcQty","type":"uint256"},{"internalType":"contractIERC20","name":"destToken","type":"address"},{"internalType":"uint256","name":"minConversionRate","type":"uint256"}],"name":"getConversionRates","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"incognitoSmartContract","outputs":[{"internalType":"addresspayable","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"kyberNetworkProxyContract","outputs":[{"internalType":"contractKyberNetwork","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"contractIERC20","name":"srcToken","type":"address"},{"internalType":"uint256","name":"srcQty","type":"uint256"},{"internalType":"contractIERC20","name":"destToken","type":"address"},{"internalType":"uint256","name":"minConversionRate","type":"uint256"}],"name":"trade","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"}]';
export const OX_TRADE_ABI = '[{"inputs":[{"internalType":"address","name":"_wETH","type":"address"},{"internalType":"address","name":"_zeroProxy","type":"address"},{"internalType":"addresspayable","name":"_incognitoSmartContract","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"constant":true,"inputs":[],"name":"ETH_CONTRACT_ADDRESS","outputs":[{"internalType":"contractIERC20","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"incognitoSmartContract","outputs":[{"internalType":"addresspayable","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"contractIERC20","name":"srcToken","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"contractIERC20","name":"destToken","type":"address"},{"internalType":"bytes","name":"callDataHex","type":"bytes"},{"internalType":"address","name":"_forwarder","type":"address"}],"name":"trade","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawWrapETH","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]';
export const OX_TRADE_ADDRESS = '0x8d72EB3fcb1A97E24F0dC27f58AaeFad2383dD03';
export const KYBER_TRADE_ADDRESS = '0xF2E57860116460e3a5fBA3a27DAA0CE5Fc7EBaE4';
