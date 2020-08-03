import { createSelector } from 'reselect';

export const getStartedSelector = createSelector(
  (state) => state.getStarted,
  (getStarted) => getStarted,
);

export const wizardSelector = createSelector(
  getStartedSelector,
  (getStarted) => getStarted?.showWizard,
);

export const isFollowDefaultPTokensSelector = createSelector(
  getStartedSelector,
  (getStarted) => (keySave) =>
    getStarted?.followDefaultPTokens[keySave] || false,
);

export const isFollowedDefaultPTokensSelector = createSelector(
  getStartedSelector,
  (getStarted) => !!getStarted?.isFollowedDefaultPTokens,
);
