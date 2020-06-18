import { createSelector } from 'reselect';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { getFeeData } from './EstimateFee.utils';

export const estimateFeeSelector = createSelector(
  (state) => state.estimateFee,
  (estimateFee) => estimateFee,
);

export const feeDataSelector = createSelector(
  estimateFeeSelector,
  selectedPrivacySeleclor.selectedPrivacy,
  selectedPrivacySeleclor.getPrivacyDataByTokenID,
  (estimateFee, selectedPrivacy) => getFeeData(estimateFee, selectedPrivacy),
);
