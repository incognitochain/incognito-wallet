import {createSelector} from 'reselect';
import {liquiditySelector} from '@screens/PDexV3/features/Liquidity/Liquidity.selector';
import {getPrivacyDataByTokenID as getPrivacyDataByTokenIDSelector} from '@src/redux/selectors/selectedPrivacy';
import {getDataShareByPoolIdSelector} from '@screens/PDexV3/features/Portfolio/Portfolio.selector';
import {sharedSelector} from '@src/redux/selectors';
import {getPoolSize} from '@screens/PDexV3';
import {getInputAmount} from '@screens/PDexV3/features/Liquidity/Liquidity.utils';
import uniqBy from 'lodash/uniqBy';
import format from '@utils/format';
import {formConfigsContribute} from '@screens/PDexV3/features/Liquidity/Liquidity.constant';
import {nftTokenDataSelector} from '@src/redux/selectors/account';

const contributeSelector = createSelector(
  liquiditySelector,
  (liquidity) => liquidity?.contribute,
);

const poolIDSelector = createSelector(
  contributeSelector,
  ({ poolId }) => poolId,
);

const statusSelector = createSelector(
  contributeSelector,
  ({ isFetching }) => isFetching,
);

const poolDataSelector = createSelector(
  contributeSelector,
  ({ data }) => data,
);

const tokenSelector = createSelector(
  contributeSelector,
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

export const feeAmountSelector = createSelector(
  contributeSelector,
  getPrivacyDataByTokenIDSelector,
  ({ feeAmount, feeToken }, getPrivacyDataByTokenID) =>
    ({ feeAmount, feeToken, token: getPrivacyDataByTokenID(feeToken) }),
);

export const mappingDataSelector = createSelector(
  poolDataSelector,
  getPrivacyDataByTokenIDSelector,
  getDataShareByPoolIdSelector,
  tokenSelector,
  sharedSelector.isGettingBalance,
  feeAmountSelector,
  (
    poolData,
    getPrivacyDataByTokenID,
    getDataShareByPoolId,
    { inputToken, outputToken },
    isGettingBalance,
    { token: feeToken, feeAmount }
  ) => {
    if (!poolData || !inputToken || !outputToken) return {};
    const { poolId, token1Value: token1PoolValue, token2Value: token2PoolValue } = poolData;
    const { nftId } = getDataShareByPoolId(poolId) || {};
    const poolSize = getPoolSize(inputToken, outputToken, token1PoolValue, token2PoolValue);
    const isLoadingBalance =
      isGettingBalance.includes(inputToken?.tokenId)
      || isGettingBalance.includes(outputToken?.tokenId)
      || isGettingBalance.includes(feeToken?.tokenId);
    const tokens = uniqBy([inputToken, outputToken, feeToken], (token) => token.tokenId);

    const hookFactories = [
      {
        label: 'Fee',
        value: `${format.amount(feeAmount, feeToken.pDecimals)} ${feeToken.symbol}`,
      },
      {
        label: 'Pool size',
        value: poolSize,
      },
    ];
    return {
      ...poolData,
      hookFactories,
      inputToken,
      outputToken,
      token1PoolValue,
      token2PoolValue,
      isLoadingBalance,
      nftId,
    };
  }
);

export const inputAmountSelector = createSelector(
  (state) => state,
  sharedSelector.isGettingBalance,
  tokenSelector,
  feeAmountSelector,
  getInputAmount
);

export const nftTokenSelector = createSelector(
  poolIDSelector,
  getDataShareByPoolIdSelector,
  nftTokenDataSelector,
  (poolId, getDataShareByPoolId, nftData) => {
    const { list, nftToken } = nftData;
    let res = {
      nftToken,
    };
    const { nftId: _nftId } = getDataShareByPoolId(poolId) || {};
    if (_nftId) {
      const nft = (list || []).find(({ nftToken: _nftToken }) => _nftId === _nftToken);
      if (nft) {
        res.nftToken = nft.nftToken;
      }
    }
    return res;
  }
);

export const disableContribute = createSelector(
  statusSelector,
  inputAmountSelector,
  nftTokenSelector,
  ( isFetching, inputAmount, nftData ) => {
    const { nftToken } = nftData;
    const { error: inputError } = inputAmount(formConfigsContribute.formName, formConfigsContribute.inputToken);
    const { error: outputError } = inputAmount(formConfigsContribute.formName, formConfigsContribute.outputToken);
    const isDisabled = isFetching || !!inputError || !!outputError || !nftToken;
    return { isDisabled };
  }
);

export default ({
  contributeSelector,
  poolIDSelector,
  statusSelector,
  poolDataSelector,
  tokenSelector,
  feeAmountSelector,
  mappingDataSelector,
  inputAmountSelector,
  nftTokenSelector,
  disableContribute,
});
