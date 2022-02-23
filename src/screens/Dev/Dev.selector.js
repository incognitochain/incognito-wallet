import { createSelector } from 'reselect';
import { CONSTANT_KEYS } from '@src/constants';

export const devSelector = createSelector(
  (state) => state.dev,
  (dev) => dev?.storage,
);

export const toggleReimportWalletSelector = createSelector(
  (state) => state.dev,
  (dev) => dev?.storage[CONSTANT_KEYS.DEV_TEST_TOGGlE_REIMPORT_WALLET],
);
