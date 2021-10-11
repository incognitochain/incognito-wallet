import {createSelector} from 'reselect';
import {liquiditySelector} from '@screens/PDexV3/features/Liquidity/Liquidity.selector';
import {getPrivacyDataByTokenID as getPrivacyDataByTokenIDSelector} from '@src/redux/selectors/selectedPrivacy';
import {getDataShareByPoolIdSelector} from '@screens/PDexV3/features/Portfolio/Portfolio.selector';
import {getExchangeRate, getPoolSize} from '@screens/PDexV3';
import helper from '@src/constants/helper';
import {sharedSelector} from '@src/redux/selectors';
import {getInputShareAmount} from '@screens/PDexV3/features/Liquidity/Liquidity.utils';
import BigNumber from 'bignumber.js';
import format from '@utils/format';
import uniqBy from 'lodash/uniqBy';
import convert from '@utils/convert';
import {formConfigsRemovePool} from '@screens/PDexV3/features/Liquidity/Liquidity.constant';
import {getValidRealAmountNFTSelector} from '@src/redux/selectors/account';

const removePoolSelector = createSelector(
  liquiditySelector,
  ({ removePool }) => removePool
);

const isFetchingSelector = createSelector(
  removePoolSelector,
  ({ isFetching }) => isFetching,
);

export const feeAmountSelector = createSelector(
  removePoolSelector,
  getPrivacyDataByTokenIDSelector,
  ({ feeAmount, feeToken }, getPrivacyDataByTokenID) =>
    ({ feeAmount, feeToken, token: getPrivacyDataByTokenID(feeToken) }),
);

export const poolIDSelector = createSelector(
  removePoolSelector,
  ({ poolId }) => poolId,
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
  poolIDSelector,
  removePoolSelector,
  tokenSelector,
  getDataShareByPoolIdSelector,
  sharedSelector.isGettingBalance,
  feeAmountSelector,
  (poolId, removePool, { inputToken, outputToken }, getDataShareByPoolID, isGettingBalance, { token: feeToken }) => {
    const shareData = getDataShareByPoolID(poolId);
    if (!shareData) return {};
    const { nftId } = shareData;
    const tokens = uniqBy([inputToken, outputToken, feeToken], (token) => token.tokenId);
    return {
      ...shareData,
      nftId,
    };
  }
);

export const maxShareAmountSelector = createSelector(
  poolIDSelector,
  getDataShareByPoolIdSelector,
  tokenSelector,
  (poolId, getDataShareByPoolID, { inputToken, outputToken }) => {
    const shareData = getDataShareByPoolID(poolId);
    if (!shareData) return {
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
    const maxInputShare = new BigNumber(sharePercent).multipliedBy(token1PoolValue).toNumber() || 0;
    const maxOutputShare = new BigNumber(sharePercent).multipliedBy(token2PoolValue).toNumber() || 0;
    const maxInputHuman = convert.toHumanAmount(maxInputShare, inputToken.pDecimals);
    const maxInputShareStr = format.toFixed(maxInputHuman, inputToken.pDecimals);
    const maxOutputHuman = convert.toHumanAmount(maxOutputShare, outputToken.pDecimals);
    const maxOutputShareStr = format.toFixed(maxOutputHuman, outputToken.pDecimals);
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
  }
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
  poolIDSelector,
  getDataShareByPoolIdSelector,
  getValidRealAmountNFTSelector,
  (poolId, getDataShareByPoolId, getValidRealAmountNFT) => {
    const { nftId: _nftId } = getDataShareByPoolId(poolId) || {};
    let _nftToken;
    const nftToken = getValidRealAmountNFT(_nftId);
    if (nftToken) {
      _nftToken = nftToken;
    }
    return _nftToken;
  }
);

export const disableRemovePool = createSelector(
  isFetchingSelector,
  inputAmountSelector,
  nftTokenSelector,
  ( isFetching, inputAmount, nftToken ) => {
    const { error: inputError, originalInputAmount: amount1 } = inputAmount(formConfigsRemovePool.formName, formConfigsRemovePool.inputToken);
    const { error: outputError, originalInputAmount: amount2 } = inputAmount(formConfigsRemovePool.formName, formConfigsRemovePool.outputToken);
    const disabled = !!inputError || !!outputError || !amount1 || !amount2 || !nftToken || isFetching;
    return { disabled };
  }
);


export default ({
  isFetchingSelector,
  feeAmountSelector,
  poolIDSelector,
  tokenSelector,
  shareDataSelector,
  inputAmountSelector,
  maxShareAmountSelector,
  disableRemovePool,
  nftTokenSelector,
});
