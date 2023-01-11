import { createSelector } from 'reselect';
import { liquiditySelector } from '@screens/PDexV3/features/Liquidity/Liquidity.selector';
import { getPrivacyDataByTokenID as getPrivacyDataByTokenIDSelector, getPrivacyPRVInfo, validatePRVBalanceSelector } from '@src/redux/selectors/selectedPrivacy';
import { getDataByShareIdSelector } from '@screens/PDexV3/features/Portfolio/Portfolio.selector';
import { sharedSelector } from '@src/redux/selectors';
import { getInputShareAmount } from '@screens/PDexV3/features/Liquidity/Liquidity.utils';
import BigNumber from 'bignumber.js';
import format from '@utils/format';
import convert from '@utils/convert';
import { formConfigsRemovePool } from '@screens/PDexV3/features/Liquidity/Liquidity.constant';
import { getValidRealAmountNFTSelector } from '@src/redux/selectors/account';
import { minPRVNeededSelector } from '@src/screens/RefillPRV/RefillPRV.selector';

const removePoolSelector = createSelector(
  liquiditySelector,
  ({ removePool }) => removePool,
);

const isFetchingSelector = createSelector(
  removePoolSelector,
  ({ isFetching }) => isFetching,
);

export const feeAmountSelector = createSelector(
  removePoolSelector,
  getPrivacyDataByTokenIDSelector,
  ({ feeAmount, feeToken }, getPrivacyDataByTokenID) => {
    const token = getPrivacyDataByTokenID(feeToken);
    const tokenAmount = token.amount;
    const showFaucet = tokenAmount < feeAmount;
    return {
      feeAmount,
      feeToken,
      token,
      feeAmountStr: format.amountFull(feeAmount, token.pDecimals, showFaucet),
    };
  },
);

export const tokenSelector = createSelector(
  removePoolSelector,
  getPrivacyDataByTokenIDSelector,
  ({ inputToken, outputToken }, getPrivacyDataByTokenID) => {
    if (!inputToken || !outputToken) return {};
    const _inputToken = getPrivacyDataByTokenID(inputToken);
    const _outputToken = getPrivacyDataByTokenID(outputToken);
    return {
      inputToken: _inputToken,
      outputToken: _outputToken,
    };
  },
);

export const shareDataSelector = createSelector(
  removePoolSelector,
  getDataByShareIdSelector,
  ({ shareId }, getDataByShareId) => {
    const dataShare = getDataByShareId(shareId);
    return dataShare || {};
  },
);

export const poolIDSelector = createSelector(
  shareDataSelector,
  ({ poolId }) => poolId,
);

export const maxShareAmountSelector = createSelector(
  poolIDSelector,
  shareDataSelector,
  tokenSelector,
  (poolId, shareData, { inputToken, outputToken }) => {
    if (!shareData)
      return {
        share: 0,
        totalShare: 0,
        sharePercent: 0,
        maxInputShare: 0,
        maxInputShareStr: '',
        maxOutputShare: 0,
        maxOutputShareStr: '',
      };
    const { share, totalShare, token1PoolValue, token2PoolValue } = shareData;
    const sharePercent = new BigNumber(share).dividedBy(totalShare).toNumber();
    const maxInputShare =
      new BigNumber(sharePercent).multipliedBy(token1PoolValue).toNumber() || 0;
    const maxOutputShare =
      new BigNumber(sharePercent).multipliedBy(token2PoolValue).toNumber() || 0;
    const maxInputHuman = convert.toHumanAmount(
      maxInputShare,
      inputToken.pDecimals,
    );
    const maxInputShareStr = format.toFixed(
      maxInputHuman,
      inputToken.pDecimals,
    );
    const maxOutputHuman = convert.toHumanAmount(
      maxOutputShare,
      outputToken.pDecimals,
    );
    const maxOutputShareStr = format.toFixed(
      maxOutputHuman,
      outputToken.pDecimals,
    );

    return {
      maxInputShare,
      maxOutputShare,
      share,
      totalShare,
      sharePercent,
      maxInputShareStr,
      maxOutputShareStr,
      maxInputHuman,
      maxOutputHuman,
    };
  },
);

export const inputAmountSelector = createSelector(
  (state) => state,
  sharedSelector.isGettingBalance,
  tokenSelector,
  feeAmountSelector,
  maxShareAmountSelector,
  getInputShareAmount,
);

export const nftTokenSelector = createSelector(
  shareDataSelector,
  getValidRealAmountNFTSelector,
  ({ nftId: _nftId }, getValidRealAmountNFT) => {
    let _nftToken;
    const nftToken = getValidRealAmountNFT(_nftId);
    if (nftToken) {
      _nftToken = nftToken;
    }
    return _nftToken;
  },
);

export const disableRemovePool = createSelector(
  isFetchingSelector,
  inputAmountSelector,
  nftTokenSelector,
  (isFetching, inputAmount, nftToken) => {
    let {
      error: inputError,
      originalInputAmount: amount1,
      inputAmountStr: inputAmountStr,
    } = inputAmount(
      formConfigsRemovePool.formName,
      formConfigsRemovePool.inputToken,
    );
    let {
      error: outputError,
      originalInputAmount: amount2,
      inputAmountStr: outputAmountStr,
    } = inputAmount(
      formConfigsRemovePool.formName,
      formConfigsRemovePool.outputToken,
    );

    let disabled = false;
    if (isFetching) {
      // console.log('CASE 0: isFetching = true: ');
      disabled = true;
    } else if (inputError) {
      // console.log(`CASE 1: inputError = ${inputError}`);
      disabled = true;
    } else if (outputError) {
      // console.log(`CASE 2: outputError = ${outputError}`);
      disabled = true;
    } else if (amount1 === undefined || amount1 === null) {
      // console.log('CASE 3: amount1 === undefined || amount1 === null: ');
      disabled = true;
    } else if (
      inputAmountStr === undefined ||
      inputAmountStr === null ||
      inputAmountStr === ''
    ) {
      // console.log("CASE 5: inputAmountStr = { undefined, null, '' } ");
      disabled = true;
    } else if (amount2 === undefined || amount2 === null) {
      // console.log('CASE 6: amount2 === undefined || amount2 === null ');
      disabled = true;
    } else if (
      outputAmountStr === undefined ||
      outputAmountStr === null ||
      outputAmountStr === ''
    ) {
      // console.log(
      //   'CASE 7: outputAmountStr = { undefined, null, empty string } ',
      // );
      disabled = true;
    } else if (amount1 === 0 && amount2 === 0) {
      // console.log('CASE 8: amount1 === 0 && amount2 === 0 ');
      disabled = true;
    } else if (!nftToken) {
      // console.log('CASE 9: nftToken = { undefined, null, 0 } ');
      disabled = true;
    }

    return { disabled };
  },
);

export const hookFactoriesSelector = createSelector(
  tokenSelector,
  sharedSelector.isGettingBalance,
  feeAmountSelector,
  getPrivacyPRVInfo,
  ({ inputToken, outputToken }, isGettingBalance, { token: feeToken, feeAmountStr }, prvBalanceInfo) => {
    if (!inputToken || !outputToken || !feeToken) return [];
    const { symbol } = prvBalanceInfo;
    return [
      {
        label: 'Network Fee',
        value: `${feeAmountStr} ${symbol}`,
      }
    ];
  }
);


export const validateTotalBurnPRVSelector = createSelector(
  getPrivacyPRVInfo,
  feeAmountSelector,
  minPRVNeededSelector,
  inputAmountSelector,
  validatePRVBalanceSelector,
  (prvBalanceInfo, feeAmountData, minPRVNeeded, inputAmount, validatePRVBalanceFn) => {
    try {
      const { prvBalanceOriginal, PRV_ID, feePerTx } = prvBalanceInfo;
      const { feeAmount } = feeAmountData;
  
      // const input = inputAmount(formConfigsRemovePool.formName, formConfigsRemovePool.inputToken);
      // const output = inputAmount(formConfigsRemovePool.formName, formConfigsRemovePool.outputToken);
  
      // const { tokenId: token1Id, originalInputAmount: originalInputAmount1 } = input;
      // const { tokenId: token2Id, originalInputAmount: originalInputAmount2 } = output;
  
      // console.log('LD-RemovePool [validateTotalBurnPRVSelector] ', {
      //   input,
      //   output,
      //   feeAmountData,
      //   prvBalanceInfo
      // } );
  
      let totalBurningPRV = 0;
    
      // // SellToken = PRV
      // if (token1Id === PRV_ID) {
      //   totalBurningPRV = totalBurningPRV + originalInputAmount1;
      // } 
  
      // if (token2Id === PRV_ID) {
      //   totalBurningPRV = totalBurningPRV + originalInputAmount2;
      // } 

      totalBurningPRV = totalBurningPRV + feeAmount;
  
      if (!totalBurningPRV || totalBurningPRV == 0) {
        totalBurningPRV = feePerTx;
      }
  
      // console.log('LD-RemovePool [validateTotalBurnPRVSelector] ==>> ', {
      //   prvBalanceOriginal,
      //   totalBurningPRV,
      //   minPRVNeeded
      // });
  
  
      return validatePRVBalanceFn(totalBurningPRV);
  
    } catch (error) {
      console.log('LD-RemovePool [validateTotalBurnPRVSelector]  ERROR : ', error);
    }
  }
);


export default {
  isFetchingSelector,
  feeAmountSelector,
  poolIDSelector,
  tokenSelector,
  shareDataSelector,
  inputAmountSelector,
  maxShareAmountSelector,
  disableRemovePool,
  nftTokenSelector,
  hookFactoriesSelector,
  validateTotalBurnPRVSelector
};
