import { createSelector } from 'reselect';

export const navigationSelector = createSelector(
  (state) => state.navigation,
  (navigation) => navigation,
);

export const currentScreenSelector = createSelector(
  navigationSelector,
  (navigation) => navigation.currentScreen || 'Splash',
);

export const prevScreenSelector = createSelector(
  navigationSelector,
  (navigation) => navigation.prevScreen || 'Splash',
);
