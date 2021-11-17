import { createSelector } from 'reselect';

export const settingSelector = createSelector(
  (state) => state.setting,
  (setting) => setting,
);

export const decimalDigitsSelector = createSelector(
  settingSelector,
  (setting) => setting?.decimalDigits,
);

export const currencySelector = createSelector(
  settingSelector,
  () => true // setting?.isToggleUSD,
);

export const hideWalletBalanceSelector = createSelector(
  settingSelector,
  (setting) => setting?.showWalletBalance,
);

export const isToggleBackupAllKeysSelector = createSelector(
  settingSelector,
  (setting) => setting.toggleBackupAllKeys,
);

export const isUsePRVToPayFeeSelector = createSelector(
  settingSelector,
  ({ usePRVToPayFee }) => usePRVToPayFee,
);
