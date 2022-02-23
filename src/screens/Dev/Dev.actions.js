import {
  ACTION_TOGGLE_TEST_MODE_CENTRALIZED,
  ACTION_TOGGLE_TEST_MODE_DECENTRALIZED,
  ACTION_TOGGLE_UTXOS,
  ACTION_DEV_TEST_TOGGLE_HISTORY_DETAIL,
  ACTION_TOGGLE_LOG_APP,
  ACTION_DEV_TEST_TOGGLE_TRADE,
  ACTION_DEV_TEST_TOGGLE_REIMPORT_WALLET
} from './Dev.constant';

export const actionToggleTestModeCentralized = () => ({
  type: ACTION_TOGGLE_TEST_MODE_CENTRALIZED,
});

export const actionToggleTestModeDecentralized = () => ({
  type: ACTION_TOGGLE_TEST_MODE_DECENTRALIZED,
});

export const actionToggleUTXOs = () => ({
  type: ACTION_TOGGLE_UTXOS,
});

export const actionToggleHistoryDetail = () => ({
  type: ACTION_DEV_TEST_TOGGLE_HISTORY_DETAIL,
});

export const actionToggleTradeDebug = () => ({
  type: ACTION_DEV_TEST_TOGGLE_TRADE,
});

export const actionToggleLogApp = () => ({
  type: ACTION_TOGGLE_LOG_APP,
});

export const actionToggleTestReimportWallet = () => ({
  type: ACTION_DEV_TEST_TOGGLE_REIMPORT_WALLET,
});
