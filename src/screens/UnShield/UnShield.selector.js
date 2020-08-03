import { createSelector } from 'reselect';

export const unShieldSelector = createSelector(
  (state) => state.unShield,
  (unShield) => unShield,
);

export const unShieldStorageDataSelector = createSelector(
  unShieldSelector,
  (unShield) => (keySave) => unShield?.storage[keySave]?.txs || [],
);
