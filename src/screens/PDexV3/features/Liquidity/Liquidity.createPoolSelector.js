import {createSelector} from 'reselect';
import {liquiditySelector} from '@screens/PDexV3/features/Liquidity/Liquidity.selector';
import {getPrivacyDataByTokenID as getPrivacyDataByTokenIDSelector} from '@src/redux/selectors/selectedPrivacy';
import {sharedSelector} from '@src/redux/selectors';
import {getExchangeRate, getPairRate} from '@screens/PDexV3';
import {allTokensIDsSelector} from '@src/redux/selectors/token';
import {filterTokenList, getInputAmount, convertAmount} from '@screens/PDexV3/features/Liquidity/Liquidity.utils';
import {formConfigsCreatePool} from '@screens/PDexV3/features/Liquidity/Liquidity.constant';
import {listPoolsPureSelector} from '@screens/PDexV3/features/Pools';
import {nftTokenDataSelector} from '@src/redux/selectors/account';
import BigNumber from 'bignumber.js';
import convert from '@utils/convert';

const createPoolSelector = createSelector(
  liquiditySelector,
  (liquidity) => liquidity?.createPool,
);

export const tokenSelector = createSelector(
  createPoolSelector,
  getPrivacyDataByTokenIDSelector,
  ({ inputToken, outputToken }, getPrivacyDataByTokenID) => {
    if (!inputToken || !outputToken) return {};
    const _inputToken = getPrivacyDataByTokenID(inputToken);
    const _outputToken = getPrivacyDataByTokenID(outputToken);
    return {
      inputToken: _inputToken,
      outputToken: _outputToken,
    };
  }
);

export const feeAmountSelector = createSelector(
  createPoolSelector,
  getPrivacyDataByTokenIDSelector,
  ({ feeAmount, feeToken }, getPrivacyDataByTokenID) =>
    ({ feeAmount, feeToken, token: getPrivacyDataByTokenID(feeToken) }),
);

export const inputAmountSelector = createSelector(
  (state) => state,
  sharedSelector.isGettingBalance,
  tokenSelector,
  feeAmountSelector,
  getInputAmount,
);

export const hookFactoriesSelector = createSelector(
  tokenSelector,
  sharedSelector.isGettingBalance,
  feeAmountSelector,
  inputAmountSelector,
  ({ inputToken, outputToken }, isGettingBalance, { token: feeToken }, inputAmount) => {
    if (!inputToken || !outputToken || !feeToken) return [];
    const input = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.inputToken);
    const output = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.outputToken);
    const exchangeRateStr = getExchangeRate(inputToken, outputToken, input.originalInputAmount, output.originalInputAmount);
    return [
      {
        label: 'Exchange rate',
        value: exchangeRateStr,
      },
    ];
  }
);

export const inputTokensListSelector = createSelector(
  allTokensIDsSelector,
  tokenSelector,
  getPrivacyDataByTokenIDSelector,
  (tokenIDs, { inputToken }, getPrivacyDataByTokenID) => {
    if (!tokenIDs || !inputToken) return [];
    return tokenIDs.filter((tokenID) => (tokenID !== inputToken?.tokenId)).map(tokenID => getPrivacyDataByTokenID(tokenID));
  }
);

export const outputTokensListSelector = createSelector(
  allTokensIDsSelector,
  tokenSelector,
  getPrivacyDataByTokenIDSelector,
  listPoolsPureSelector,
  (tokenIDs, { inputToken, outputToken }, getPrivacyDataByTokenID, pools) => {
    if (!tokenIDs || !outputToken) return [];
    const tokens = filterTokenList({
      tokenId: inputToken.tokenId,
      pools,
      tokenIds: tokenIDs,
      ignoreTokens: [outputToken.tokenId, inputToken.tokenId],
    });
    return tokens.map(tokenID => getPrivacyDataByTokenID(tokenID));
  }
);

export const ampValueSelector = createSelector(
  createPoolSelector,
  inputAmountSelector,
  tokenSelector,
  ({ amp, rate }, inputAmount, { inputToken, outputToken }) => {
    if (!inputToken || !outputToken) return {
      amp: 0,
    };
    const input = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.inputToken);
    const output = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.outputToken);
    const rawRate = new BigNumber(output.originalInputAmount).dividedBy(input.originalInputAmount);
    let estOutputStr = undefined;
    const estRate = new BigNumber(rawRate).minus(rate).abs();
    const compareValue = 1e-2;
    if ((estRate.gt(compareValue) || estRate.lt(-compareValue))) {
      estOutputStr = convertAmount({
        originalNum: convert.toOriginalAmount(
          new BigNumber(input.inputAmount).multipliedBy(rate).toNumber(),
          outputToken.pDecimals
        ),
        pDecimals: outputToken.pDecimals
      });
    }
    return { amp, estOutputStr };
  }
);

export const isFetchingSelector = createSelector(
  createPoolSelector,
  ({ isFetching }) => isFetching
);

export const focusFieldSelector = createSelector(
  createPoolSelector,
  ({ focusField }) => focusField
);

export const isTypingSelector = createSelector(
  createPoolSelector,
  ({ isTyping }) => isTyping
);

export const disableCreatePool = createSelector(
  inputAmountSelector,
  isFetchingSelector,
  nftTokenDataSelector,
  isTypingSelector,
  ( inputAmount, isFetching, { nftToken }, isTyping ) => {
    const { error: inputError } = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.inputToken);
    const { error: outputError } = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.outputToken);
    const disabled = !!inputError || !!outputError || isFetching || !nftToken || isTyping;
    return {
      disabled,
    };
  }
);

export default ({
  createPoolSelector,
  tokenSelector,
  hookFactoriesSelector,
  feeAmountSelector,
  inputTokensListSelector,
  outputTokensListSelector,
  inputAmountSelector,
  ampValueSelector,
  disableCreatePool,
  isFetchingSelector,
  focusFieldSelector,
  isTypingSelector,
});