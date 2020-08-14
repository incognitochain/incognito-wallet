import {
  ACTION_SHOW_WIZARD_FETCHING,
  ACTION_SHOW_WIZARD_FETCHED,
  ACTION_TOGGLE_FOLLOW_DEFAULT_PTOKENS,
  ACTION_TOGGLE_SHOW_WIZARD,
  ACTION_TOGGLE_DETECT_NETWORK_NAME,
} from './GetStarted.constant';

export const actionShowWizardFetching = () => ({
  type: ACTION_SHOW_WIZARD_FETCHING,
});

export const actionShowWizardFetched = () => ({
  type: ACTION_SHOW_WIZARD_FETCHED,
});

export const actionToggleFollowDefaultPTokens = (payload) => ({
  type: ACTION_TOGGLE_FOLLOW_DEFAULT_PTOKENS,
  payload,
});

export const actionToggleShowWizard = (payload) => ({
  type: ACTION_TOGGLE_SHOW_WIZARD,
  payload,
});

export const actionToggleDetectNetworkName = (payload) => ({
  type: ACTION_TOGGLE_DETECT_NETWORK_NAME,
  payload,
});
