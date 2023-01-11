import { createSelector } from 'reselect';
import {
  selectedPrivacySelector,
  childSelectedPrivacySelector,
} from '@src/redux/selectors';
import { getPrivacyPRVInfo, validatePRVBalanceSelector } from '@src/redux/selectors/selectedPrivacy';
import BigNumber from 'bignumber.js';
import { formValueSelector } from 'redux-form';
import convert from '@src/utils/convert';
import { getFeeData } from './EstimateFee.utils';

export const estimateFeeSelector = createSelector(
  (state) => state.estimateFee,
  (estimateFee) => estimateFee,
);

export const feeDataSelector = createSelector(
  estimateFeeSelector,
  selectedPrivacySelector.selectedPrivacy,
  childSelectedPrivacySelector.childSelectedPrivacy,
  (estimateFee, selectedPrivacy, childSelectedPrivacy) =>
    getFeeData(estimateFee, selectedPrivacy, childSelectedPrivacy),
);

export const networksSelector = createSelector(
  selectedPrivacySelector.selectedPrivacy,
  (selectedPrivacy) => {
    if (selectedPrivacy?.isMainCrypto) {
      return selectedPrivacy?.listChildToken;
    } else if (selectedPrivacy?.isPUnifiedToken) {
      return selectedPrivacy?.listUnifiedToken;
    } else {
      return [selectedPrivacy];
    }
  },
);

export const validatePRVNetworkFee = createSelector(
  feeDataSelector,
  getPrivacyPRVInfo,
  (feeData, prvBalanceInfo) => {
    // console.log('[validatePRVNetworkFee] feeData  ', feeData);
    // console.log('[validatePRVNetworkFee] prvBalanceInfo  ', prvBalanceInfo);
    const { isUsedPRVFee, totalFee, feePrv } = feeData;
    const { isEnoughNetworkFeeDefault, prvBalanceOriginal } = prvBalanceInfo;
    if (!isEnoughNetworkFeeDefault) return false;
    if (new BigNumber(feePrv).gt(new BigNumber(prvBalanceOriginal)))
      return false;
    if (isUsedPRVFee) {
      if (new BigNumber(totalFee).gt(new BigNumber(prvBalanceOriginal)))
        return false;
    }
    return true;
  },
);

export const validateTotalPRVBurningSelector = createSelector(
  state => state.form,
  selectedPrivacySelector.selectedPrivacy,
  feeDataSelector,
  getPrivacyPRVInfo,
  validatePRVBalanceSelector,
  (state, selectedPrivacy, feeData, prvBalanceInfo, validatePRVBalanceFn) => {
    if (!state) return; 
    try {
      const selector = formValueSelector('formSend', (state) => state);
      const amountStr = selector(state, 'amount');
      const amountToNumber = convert.toNumber(amountStr, true);
      const amountToNumberOrignial = convert.toOriginalAmount(
        amountToNumber,
        selectedPrivacy?.pDecimals,
        false,
      );

      let totalPRVBurning = 0;

      const { tokenId: currentTokenId } = selectedPrivacy;
      const { fee, feePrv, isUsedPRVFee } = feeData;
      const { PRV_ID, feePerTx } = prvBalanceInfo;

      // Send or Unshield for PRV
      if (currentTokenId === PRV_ID) {
        totalPRVBurning = amountToNumberOrignial;
      } else {
        //Other tokens
        totalPRVBurning = 0;
      }
      
      if (isUsedPRVFee) {
        totalPRVBurning = totalPRVBurning + feePrv;
      } else {
        totalPRVBurning = totalPRVBurning + fee;
      }

        //totalPRVBurning after calculte = 0 => asign default 
      if (!totalPRVBurning || totalPRVBurning === 0) {
        totalPRVBurning = feePerTx;

      }
      return validatePRVBalanceFn(totalPRVBurning);
    } catch (error) {
      console.log('[EstimateFee] ERROR: ', error);
    }
  },
);


