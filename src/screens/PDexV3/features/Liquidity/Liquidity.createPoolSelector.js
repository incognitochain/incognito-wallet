import {createSelector} from 'reselect';
import {liquiditySelector} from '@screens/PDexV3/features/Liquidity/Liquidity.selector';
import {getPrivacyDataByTokenID as getPrivacyDataByTokenIDSelector, getPrivacyPRVInfo, validatePRVBalanceSelector} from '@src/redux/selectors/selectedPrivacy';
import {sharedSelector} from '@src/redux/selectors';
import {getExchangeRate, getPairRate} from '@screens/PDexV3';
import {allTokensIDsSelector} from '@src/redux/selectors/token';
import {filterTokenList, getInputAmount, convertAmount} from '@screens/PDexV3/features/Liquidity/Liquidity.utils';
import {formConfigsCreatePool} from '@screens/PDexV3/features/Liquidity/Liquidity.constant';
import {listPoolsPureSelector} from '@screens/PDexV3/features/Pools';
import {nftTokenDataSelector} from '@src/redux/selectors/account';
import BigNumber from 'bignumber.js';
import convert from '@utils/convert';
import {isNaN} from 'lodash';
import format from '@utils/format';
import { minPRVNeededSelector } from '@src/screens/RefillPRV/RefillPRV.selector';

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
  ({ feeAmount, feeToken }, getPrivacyDataByTokenID) => {
    const token = getPrivacyDataByTokenID(feeToken);
    const tokenAmount = token.amount;
    const showFaucet = tokenAmount < feeAmount;
    return { feeAmount, feeToken, token, feeAmountStr: format.amountFull(feeAmount, token.pDecimals), showFaucet };
  },
);

export const inputAmountSelector = createSelector(
  (state) => state,
  sharedSelector.isGettingBalance,
  tokenSelector,
  feeAmountSelector,
  getInputAmount,
);

export const validateNetworkFeeSelector = createSelector(
  getPrivacyPRVInfo,
  feeAmountSelector,
  (prvBalanceInfo, feeAmountData ) => {
    const { prvBalanceOriginal} = prvBalanceInfo;
    const { feeAmount } = feeAmountData;
    const isEnoughNetworkFee = new BigNumber(prvBalanceOriginal).gt(new BigNumber(feeAmount));
    return {
      isEnoughNetworkFee
    };
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
  
      const input = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.inputToken);
      const output = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.outputToken);
  
      const { tokenId: token1Id, originalInputAmount: originalInputAmount1 } = input;
      const { tokenId: token2Id, originalInputAmount: originalInputAmount2 } = output;
  
      // console.log('LD-CreatePool [validateTotalBurnPRVSelector] ', {
      //   input,
      //   output,
      //   feeAmountData,
      //   prvBalanceInfo
      // } );
  
      let totalBurningPRV = 0;
    
      // SellToken = PRV
      if (token1Id === PRV_ID) {
        totalBurningPRV = totalBurningPRV + originalInputAmount1;
      } 
  
      if (token2Id === PRV_ID) {
        totalBurningPRV = totalBurningPRV + originalInputAmount2;
      } 

      totalBurningPRV = totalBurningPRV + feeAmount;
  
      if (!totalBurningPRV || totalBurningPRV == 0) {
        totalBurningPRV = feePerTx;
      }
  
      // console.log('LD-CreatePool [validateTotalBurnPRVSelector] ==>> ', {
      //   prvBalanceOriginal,
      //   totalBurningPRV,
      //   minPRVNeeded
      // });

      return validatePRVBalanceFn(totalBurningPRV);

    } catch (error) {
      console.log('LD-CreatePool [validateTotalBurnPRVSelector]  ERROR : ', error);
    }
  }
);

export const hookFactoriesSelector = createSelector(
  tokenSelector,
  sharedSelector.isGettingBalance,
  feeAmountSelector,
  inputAmountSelector,
  getPrivacyPRVInfo,
  validateNetworkFeeSelector,
  ({ inputToken, outputToken }, isGettingBalance, { token: feeToken, feeAmountStr }, inputAmount, prvBalanceInfo, validateNetworkFeeData ) => {
    if (!inputToken || !outputToken || !feeToken) return [];
    const { symbol } = prvBalanceInfo;
    const { isEnoughNetworkFee} = validateNetworkFeeData;
    const input = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.inputToken);
    const output = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.outputToken);
    const exchangeRateStr = getExchangeRate(inputToken, outputToken, input.originalInputAmount, output.originalInputAmount);
    return [
      {
        label: 'Exchange rate',
        value: exchangeRateStr,
      },
      {
        label: `${input.symbol} Balance`,
        value: input.maxAmountDisplay,
      },
      {
        label: `${output.symbol} Balance`,
        value: output.maxAmountDisplay,
      },
      // !isEnoughNetworkFee ? {
      //   label: 'Network Fee',
      //   value: `${feeAmountStr} ${symbol}`,
      // }: undefined,
      {
        label: 'Network Fee',
        value: `${feeAmountStr} ${symbol}`,
      }
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
    let rawRate = getPairRate({
      token1: inputToken,
      token2: outputToken,
      token1Value: input.originalInputAmount,
      token2Value: output.originalInputAmount,
    });
    rawRate = convert.toNumber(rawRate, true);
    let estOutputStr = undefined;
    const estRate = new BigNumber(rawRate).minus(rate).abs();
    const compareValue = Math.pow(10, -(outputToken.pDecimals || 9));
    if (!isNaN(estRate) && (estRate.gt(compareValue) || estRate.lt(-compareValue))) {
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
  validateNetworkFeeSelector,
  (inputAmount, isFetching, { nftToken }, isTyping, validateNetworkFeeData) => {
    const { isEnoughNetworkFee} = validateNetworkFeeData;
    const { error: inputError } = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.inputToken);
    const { error: outputError } = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.outputToken);
    const disabled = !!inputError || !!outputError || isFetching || !nftToken || isTyping || !isEnoughNetworkFee;
    return {
      disabled,
      nftTokenAvailable: !!nftToken
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
  validateNetworkFeeSelector,
  validateTotalBurnPRVSelector
});
