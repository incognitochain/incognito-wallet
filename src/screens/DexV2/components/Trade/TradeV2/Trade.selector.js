import { createSelector } from 'reselect';
import format from '@utils/format';
import { PRV_ID } from '@screens/Dex/constants';
import memoize from 'memoize-one';
import { COINS } from '@src/constants';
// eslint-disable-next-line import/no-cycle
import { getTradingFee } from '@screens/DexV2/components/Trade/TradeV2/Trade.utils';
import { getPrivacyDataByTokenID } from '@src/redux/selectors/selectedPrivacy';
import BigNumber from 'bignumber.js';
import { PDexTradeHistoryModel } from '@models/pDefi';

export const tradeSelector = createSelector(
  (state) => state.trade,
  (trade) => {
    return {
      ...trade,

      loadingPair:      trade?.loadingPair,
      pairs:            trade?.pairs,
      tokens:           trade?.tokens,
      pairTokens:       trade?.pairTokens,
      shares:           trade?.shares,
      erc20Tokens:      trade?.erc20Tokens,

      pair:             trade?.pair,

      fee:              trade?.fee,
      feeToken:         trade?.feeToken,
      originalFee:      trade?.originalFee,
      originalFeeToken: trade?.originalFeeToken,
      canChooseFee:     trade?.canChooseFee,

      inputToken:       trade?.inputToken,

      inputText:        trade?.inputText,
      inputValue:       trade?.inputValue,

      outputToken:      trade?.outputToken,
      outputList:       trade?.outputList,

      outputText:       trade?.outputText,
      minimumAmount:    trade?.minimumAmount,
      loadingBox:       trade?.loadingBox,
      quote:            trade?.quote,
      isErc20:          !!(trade?.inputToken?.address && trade?.outputToken?.address),
      priority:         trade?.priority,
      priorityList:     trade?.priorityList,

      inputBalance:     trade?.inputBalance,
      inputBalanceText: trade?.inputBalanceText,
      prvBalance:       trade?.prvBalance,
      lastInputToken:   trade?.lastInputToken,
      lastAccount:      trade?.lastAccount,
      pdexHistories:    trade?.pdexHistories,
      reachedHistories: trade?.reachedHistories
    };
  }
);

export const tradingFeeSelector = createSelector(
  tradeSelector,
  ({ priority, priorityList }) =>
    memoize(() =>{
      if (priority && priorityList) {
        return {
          tradingFee: getTradingFee(priority, priorityList),
          tradingFeeToken: COINS.PRV
        };
      }
      return {
        tradingFee: 0,
        tradingFeeToken: COINS.PRV
      };
    })
);

export const totalFeeSelector = createSelector(
  tradeSelector,
  ({ fee, feeToken, priority, priorityList }) =>
    memoize(() => {
      let pDexFee = fee;
      if (priority && priorityList && feeToken?.id === PRV_ID) {
        pDexFee += getTradingFee(priority, priorityList);
      }
      return format.amount(pDexFee, feeToken.pDecimals);
    })
);

export const maxPriceSelector = createSelector(
  getPrivacyDataByTokenID,
  (getFn) =>
    memoize((inputId, outputId, inputValue, outputValue) => {
      const inputToken  = getFn(inputId);
      const outputToken = getFn(outputId);

      const minRate = new BigNumber(inputValue)
        .dividedBy(new BigNumber(outputValue))
        .toNumber();

      let maxPrice = '';

      if (isNaN(minRate)) return maxPrice;

      const getSymbol = (token) => token?.externalSymbol || token?.symbol;

      const suffix = `${getSymbol(inputToken)} / ${getSymbol(outputToken)}`;

      if (minRate >= 1) {
        maxPrice = `${format.amount(minRate, 0, true)} ${suffix}`;
      } else {
        maxPrice = `${format.toFixed(minRate, 9)} ${suffix}`;
      }
      return maxPrice;
    })
);

export const pdexHistoriesSelector = createSelector(
  tradeSelector,
  getPrivacyDataByTokenID,
  ({ pdexHistories }, getFn) =>
    memoize(() => (
      pdexHistories.map(history => {
        const { buyTokenId, sellTokenId } = history;
        const sellToken = getFn(sellTokenId);
        const buyToken = getFn(buyTokenId);
        return new PDexTradeHistoryModel({
          history: {
            ...history,
            sellToken,
            buyToken
          }
        });
      })
    ))
);
