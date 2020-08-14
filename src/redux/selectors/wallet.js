import { createSelector } from 'reselect';

export const walletSelector = createSelector(
  (state) => state?.wallet,
  (wallet) => wallet,
);
