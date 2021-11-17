import { createSelector } from 'reselect';
import isNaN from 'lodash/isNaN';
import { getPrivacyDataByTokenID as getPrivacyDataByTokenIDSelector } from '@src/redux/selectors/selectedPrivacy';
import format from '@src/utils/format';
import { ACCOUNT_CONSTANT } from 'incognito-chain-web-js/build/wallet';
import capitalize from 'lodash/capitalize';
import { formValueSelector, isValid } from 'redux-form';
import convert from '@src/utils/convert';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { PRV } from '@src/constants/common';
import { sharedSelector } from '@src/redux/selectors';
import orderBy from 'lodash/orderBy';
import { getExchangeRate, getPairRate, getPoolSize } from '@screens/PDexV3';
import { PRIORITY_LIST } from '@screens/Dex/constants';
import BigNumber from 'bignumber.js';
import { formConfigs } from './Swap.constant';
import { getInputAmount } from './Swap.utils';

export const swapSelector = createSelector(
  (state) => state.pDexV3,
  ({ swap }) => swap,
);

export const purePairsSelector = createSelector(
  swapSelector,
  ({ pairs }) => (pairs || [])
);

export const listPairsSelector = createSelector(
  swapSelector,
  getPrivacyDataByTokenIDSelector,
  ({ pairs }, getPrivacyDataByTokenID) => {
    if (!pairs) {
      return [];
    }
    let list = pairs
      .map((tokenID) => getPrivacyDataByTokenID(tokenID))
      .map((token) => {
        let priority = PRIORITY_LIST.indexOf(token?.id);
        priority > -1 ? priority : PRIORITY_LIST.length + 1;
        return { ...token, priority };
      });
    return orderBy(
      list,
      ['priority', 'hasIcon', 'verified'],
      ['asc', 'desc', 'desc'],
    );
  },
);

// group inputs

export const inpuTokenSelector = createSelector(
  getPrivacyDataByTokenIDSelector,
  swapSelector,
  (getPrivacyDataByTokenID, swap) => (field) => {
    try {
      const tokenId = swap[field];
      if (!tokenId) {
        return {};
      }
      const token = getPrivacyDataByTokenID(swap[field]);
      return token;
    } catch (error) {
      console.log('inpuTokenSelector-error', error);
    }
  },
);

export const selltokenSelector = createSelector(
  inpuTokenSelector,
  (getInputToken) => getInputToken(formConfigs.selltoken),
);

export const buytokenSelector = createSelector(
  inpuTokenSelector,
  (getInputToken) => getInputToken(formConfigs.buytoken),
);

export const focustokenSelector = createSelector(
  swapSelector,
  ({ focustoken }) => focustoken,
);

// fee

export const feeSelectedSelector = createSelector(
  swapSelector,
  ({ feetoken }) => feetoken || '',
);

export const feetokenDataSelector = createSelector(
  (state) => state,
  swapSelector,
  feeSelectedSelector,
  getPrivacyDataByTokenIDSelector,
  (state, { data, networkfee }, feetoken, getPrivacyDataByTokenID) => {
    try {
      const feeTokenData: SelectedPrivacy = getPrivacyDataByTokenID(feetoken);
      const selector = formValueSelector(formConfigs.formName);
      const fee = selector(state, formConfigs.feetoken);
      const { fee: minFeeOriginal = 0 } = data;
      let feeAmount = convert.toNumber(fee, true) || 0;
      const feeAmountText = `${fee} ${feeTokenData.symbol}`;
      const origininalFeeAmount =
        convert.toOriginalAmount(feeAmount, feeTokenData?.pDecimals, false) ||
        0;
      const minFeeAmount = convert.toHumanAmount(
        minFeeOriginal,
        feeTokenData?.pDecimals,
      );
      const minFeeAmountFixed = format.toFixed(
        minFeeAmount,
        feeTokenData?.pDecimals,
      );
      const minFeeAmountText = format.amountFull(
        minFeeOriginal,
        feeTokenData?.pDecimals,
        false,
      );
      const minFeeAmountStr = `${minFeeAmountText} ${feeTokenData?.symbol}`;
      const totalFeePRV = format.amountFull(
        new BigNumber(origininalFeeAmount).plus(networkfee).toNumber(),
        PRV.pDecimals,
        false,
      );
      const totalFeePRVText = `${totalFeePRV} ${PRV.symbol}`;
      return {
        ...feeTokenData,
        feetoken,
        feeAmount,
        feeAmountText,
        origininalFeeAmount,
        minFeeOriginal,
        minFeeAmount,
        minFeeAmountStr,
        minFeeAmountText,
        totalFeePRV,
        totalFeePRVText,
        minFeeAmountFixed,
      };
    } catch (error) {
      console.log('feetokenDataSelector-error', error);
    }
  },
);

export const feeTypesSelector = createSelector(
  selltokenSelector,
  feeSelectedSelector,
  (selltoken: SelectedPrivacy, feetoken) => {
    let types = [
      {
        tokenId: PRV.id,
        symbol: PRV.symbol,
        actived: feetoken == PRV.id,
      },
    ];
    if (selltoken?.tokenId && !selltoken.isMainCrypto) {
      types.push({
        tokenId: selltoken.tokenId,
        symbol: selltoken.symbol,
        actived: feetoken == selltoken.tokenId,
      });
    }
    return types;
  },
);

export const inputAmountSelector = createSelector(
  (state) => state,
  inpuTokenSelector,
  focustokenSelector,
  feetokenDataSelector,
  swapSelector,
  sharedSelector.isGettingBalance,
  getInputAmount,
);

export const slippagetoleranceSelector = createSelector(
  (state) => state,
  (state) => {
    const selector = formValueSelector(formConfigs.formName);
    let slippagetolerance = selector(state, formConfigs.slippagetolerance);
    slippagetolerance = Number(slippagetolerance);
    if (isNaN(slippagetolerance)) {
      return 0;
    }
    return slippagetolerance;
  },
);

export const swapInfoSelector = createSelector(
  swapSelector,
  feetokenDataSelector,
  inputAmountSelector,
  (state) => state,
  getPrivacyDataByTokenIDSelector,
  (
    {
      data,
      networkfee,
      swapingToken,
      initing,
      selecting,
      isFetching,
      isFetched,
      percent,
      swaping,
    },
    feeTokenData,
    getInputAmount,
    state,
    getPrivacyDataByTokenID,
  ) => {
    try {
      const sellInputAmount = getInputAmount(formConfigs.selltoken);
      const buyInputAmount = getInputAmount(formConfigs.buytoken);
      const { fee, route: routing, poolDetails, maxGet } = data;
      let allPoolSize = [];
      try {
        allPoolSize = Object.entries(poolDetails).map(([, value]) => {
          const { token1Value, token2Value, token1Id, token2Id } = value;
          const token1 = getPrivacyDataByTokenID(token1Id);
          const token2 = getPrivacyDataByTokenID(token2Id);
          const poolSize = getPoolSize(
            token1,
            token2,
            token1Value,
            token2Value,
          );
          return poolSize;
        });
      } catch {
        //
      }
      const minFeeAmount = format.toFixed(
        convert.toHumanAmount(fee, feeTokenData?.pDecimals),
        feeTokenData?.pDecimals,
      );
      const minFeeAmountStr = `${minFeeAmount} ${feeTokenData?.symbol}`;
      const networkfeeAmount = format.toFixed(
        convert.toHumanAmount(networkfee, PRV.pDecimals),
        PRV.pDecimals,
      );
      const networkfeeAmountStr = `${networkfeeAmount} ${PRV.symbol}`;
      const editableInput =
        !swapingToken && !initing && !selecting && !isFetching;
      let btnSwapText = 'Swap';
      const calculating = swapingToken || initing || selecting || isFetching;
      const disabledBtnSwap =
        calculating ||
        (!isFetched && !isFetching) ||
        !isValid(formConfigs.formName)(state);
      if (calculating) {
        btnSwapText = 'Calculating...';
      }
      const tradingFeeStr = `${feeTokenData?.feeAmountText} ${feeTokenData?.symbol}`;
      const sellInputBalanceStr = `${sellInputAmount?.balanceStr ||
        '0'} ${sellInputAmount?.symbol || ''}`;
      const buyInputBalanceStr = `${buyInputAmount?.balanceStr ||
        '0'} ${buyInputAmount?.symbol || ''}`;
      const sellInputAmountStr = `${sellInputAmount?.amountText} ${sellInputAmount?.symbol}`;
      const buyInputAmountStr = `${buyInputAmount?.amountText} ${buyInputAmount?.symbol}`;
      const prv: SelectedPrivacy = getPrivacyDataByTokenID(PRV.id);
      const showPRVBalance = !sellInputAmount?.isMainCrypto;
      const prvBalance = format.amountVer2(prv.amount, PRV.pDecimals);
      const prvBalanceStr = `${prvBalance} ${PRV.symbol}`;
      const maxPriceStr = getExchangeRate(
        sellInputAmount.tokenData,
        buyInputAmount.tokenData,
        sellInputAmount.originalAmount,
        maxGet,
      );
      const defaultPair = {
        selltoken: sellInputAmount.tokenId,
        buytoken: buyInputAmount.tokenId,
      };
      return {
        balanceStr: sellInputBalanceStr,
        routing,
        minFeeAmount,
        minFeeAmountStr,
        networkfeeAmountStr,
        maxPriceStr,
        editableInput,
        btnSwapText,
        disabledBtnSwap,
        tradingFeeStr,
        sellInputBalanceStr,
        buyInputBalanceStr,
        sellInputAmountStr,
        buyInputAmountStr,
        networkfee,
        showPRVBalance,
        prvBalanceStr,
        percent,
        swaping,
        allPoolSize,
        maxGet,
        refreshing: isFetching,
        defaultPair,
      };
    } catch (error) {
      console.log('swapInfoSelector-error', error);
    }
  },
);

// history

export const mappingOrderHistorySelector = createSelector(
  getPrivacyDataByTokenIDSelector,
  (getPrivacyDataByTokenID) => (order) => {
    try {
      if (!order) {
        return {};
      }
      let {
        sellTokenId,
        amount,
        buyTokenId,
        requestime,
        status,
        minAccept,
        fee,
        feeToken: feeTokenId,
        fromStorage,
        respondTokens,
        respondAmounts,
        isCompleted,
      } = order;
      const sellToken: SelectedPrivacy = getPrivacyDataByTokenID(sellTokenId);
      const buyToken: SelectedPrivacy = getPrivacyDataByTokenID(buyTokenId);
      const feeToken: SelectedPrivacy = getPrivacyDataByTokenID(feeTokenId);
      let price = 0;
      if (!isCompleted) {
        price = minAccept;
      } else {
        const indexBuyToken = respondTokens.findIndex((t) => t === buyTokenId);
        price = respondAmounts[indexBuyToken];
      }
      const amountStr = format.amountVer2(amount, sellToken.pDecimals);
      const priceStr = format.amountVer2(price, buyToken.pDecimals);
      const sellStr = `${amountStr} ${sellToken.symbol}`;
      const buyStr = `${priceStr} ${buyToken.symbol}`;
      const timeStr = format.formatDateTime(
        fromStorage ? requestime : requestime * 1000,
        'DD MMM HH:mm',
      );
      const rate = getPairRate({
        token1Value: amount,
        token2Value: price,
        token1: sellToken,
        token2: buyToken,
      });
      const rateStr = getExchangeRate(sellToken, buyToken, amount, price);
      let totalFee = fee;
      let networkFee = ACCOUNT_CONSTANT.MAX_FEE_PER_TX;
      if (feeToken.isMainCrypto) {
        totalFee = new BigNumber(totalFee).plus(networkFee).toNumber();
      }
      const tradingFeeStr = `${format.amountFull(
        totalFee,
        feeToken.pDecimals,
        false,
      )} ${feeToken.symbol}`;
      const swapStr = `${sellStr} = ${buyStr}`;
      const result = {
        ...order,
        sellStr,
        buyStr,
        rateStr,
        timeStr,
        rate,
        networkfeeAmountStr: `${format.amountVer2(networkFee, PRV.pDecimals)} ${
          PRV.symbol
        }`,
        tradingFeeStr,
        statusStr: capitalize(status),
        swapStr,
        tradingFeeByPRV: feeToken.isMainCrypto,
      };
      return result;
    } catch (error) {
      console.log('mappingOrderHistorySelector1-error', error);
    }
  },
);

export const swapHistorySelector = createSelector(
  swapSelector,
  mappingOrderHistorySelector,
  ({ swapHistory }, mappingOrderHistory) => {
    const history = swapHistory?.data?.map((order) =>
      mappingOrderHistory(order),
    );
    return {
      ...swapHistory,
      history,
    };
  },
);

export const orderDetailSelector = createSelector(
  swapSelector,
  mappingOrderHistorySelector,
  ({ orderDetail }, mappingOrderHistory) => {
    const { fetching, order } = orderDetail;
    return {
      fetching,
      order: mappingOrderHistory(order),
    };
  },
);

export const defaultPairSelector = createSelector(
  swapSelector,
  ({ selltoken, buytoken }) => ({ selltoken, buytoken }),
);
