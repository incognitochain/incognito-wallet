import {
  ACTION_TOGGLE_TEST_MODE_CENTRALIZED,
  ACTION_TOGGLE_TEST_MODE_DECENTRALIZED,
  ACTION_TOGGLE_UTXOS,
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
