import { createSelector } from 'reselect';
import { selectedPrivacySelector } from '@src/redux/selectors';
import { getFeeData } from './EstimateFee.utils';

export const estimateFeeSelector = createSelector(
  (state) => state.estimateFee,
  (estimateFee) => estimateFee,
);

export const feeDataSelector = createSelector(
  estimateFeeSelector,
  selectedPrivacySelector.selectedPrivacy,
  selectedPrivacySelector.getPrivacyDataByTokenID,
  (estimateFee, selectedPrivacy) => getFeeData(estimateFee, selectedPrivacy),
);
