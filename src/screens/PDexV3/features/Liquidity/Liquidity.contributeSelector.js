import {createSelector} from 'reselect';
import {liquiditySelector} from '@screens/PDexV3/features/Liquidity/Liquidity.selector';
import {getPrivacyDataByTokenID as getPrivacyDataByTokenIDSelector} from '@src/redux/selectors/selectedPrivacy';
import {listShareSelector} from '@screens/PDexV3/features/Portfolio/Portfolio.selector';
import {sharedSelector} from '@src/redux/selectors';
import {getPoolSize} from '@screens/PDexV3';
import {getInputAmount} from '@screens/PDexV3/features/Liquidity/Liquidity.utils';
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

export const inputAmountSelector = createSelector(
  (state) => state,
  sharedSelector.isGettingBalance,
  tokenSelector,
  feeAmountSelector,
  getInputAmount
);

export const mappingDataSelector = createSelector(
  contributeSelector,
  getPrivacyDataByTokenIDSelector,
  tokenSelector,
  sharedSelector.isGettingBalance,
  feeAmountSelector,
  inputAmountSelector,
  (
    { data: poolData, nftId },
    getPrivacyDataByTokenID,
    { inputToken, outputToken },
    isGettingBalance,
    { token: feeToken, feeAmount },
    inputAmount,
  ) => {
    if (!poolData || !inputToken || !outputToken) return {};
    const { token1Value: token1PoolValue, token2Value: token2PoolValue } = poolData;
    const poolSize = getPoolSize(inputToken, outputToken, token1PoolValue, token2PoolValue);
    const input = inputAmount(formConfigsContribute.formName, formConfigsContribute.inputToken);
    const output = inputAmount(formConfigsContribute.formName, formConfigsContribute.outputToken);
    const isLoadingBalance =
      isGettingBalance.includes(inputToken?.tokenId)
      || isGettingBalance.includes(outputToken?.tokenId)
      || isGettingBalance.includes(feeToken?.tokenId);

    const hookFactories = [
      {
        label: 'Fee',
        value: `${format.amountVer2(feeAmount, feeToken.pDecimals)} ${feeToken.symbol}`,
      },
      {
        label: 'Pool size',
        value: poolSize,
      },
      {
        label: `${input.symbol} Balance`,
        value: input.maxAmountDisplay,
      },
      {
        label: `${output.symbol} Balance`,
        value: output.maxAmountDisplay,
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

export const nftTokenSelector = createSelector(
  poolIDSelector,
  nftTokenDataSelector,
  contributeSelector,
  listShareSelector,
  (
    poolId,
    nftData,
    { nftId },
    listShare,
  ) => {
    const { nftToken } = nftData;
    let res = {
      nftToken,
    };
    if (nftId) {
      res.nftToken = nftId;
      return res;
    }
    if (listShare && listShare.length > 0) {
      const pool = listShare.find(share => share.poolId === poolId);
      if (pool && pool.nftId) {
        res.nftToken = pool.nftId;
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
