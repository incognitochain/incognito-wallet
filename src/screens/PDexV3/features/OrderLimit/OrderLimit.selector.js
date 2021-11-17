import { PRV } from '@src/constants/common';
import { sharedSelector } from '@src/redux/selectors';
import { ACCOUNT_CONSTANT } from 'incognito-chain-web-js/build/wallet';
import { getPrivacyDataByTokenID as getPrivacyDataByTokenIDSelector } from '@src/redux/selectors/selectedPrivacy';
import { COLORS } from '@src/styles';
import convert from '@src/utils/convert';
import format from '@src/utils/format';
import floor from 'lodash/floor';
import { formValueSelector, isValid } from 'redux-form';
import isEmpty from 'lodash/isEmpty';
import { createSelector } from 'reselect';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import {
  getExchangeRate,
  getPairRate,
  getOriginalPairRate,
} from '@screens/PDexV3';
import { getDataByPoolIdSelector } from '@screens/PDexV3/features/Pools';
import { activedTabSelector } from '@src/components/core/Tabs/Tabs.selector';
import { nftTokenDataSelector } from '@src/redux/selectors/account';
import BigNumber from 'bignumber.js';
import isEqual from 'lodash/isEqual';
import {
  formConfigs,
  ROOT_TAB_ORDER_LIMIT,
  TAB_BUY_ID,
  TAB_SELL_ID,
} from './OrderLimit.constant';
import { getInputAmount as getInputTokenAmount } from './OrderLimit.utils';

const BTN_WITHDRAW_ORDER = {
  [ACCOUNT_CONSTANT.TX_STATUS.PROCESSING]: 'ing',
  [ACCOUNT_CONSTANT.TX_STATUS.TXSTATUS_PENDING]: 'ing',
  [ACCOUNT_CONSTANT.TX_STATUS.TXSTATUS_SUCCESS]: 'ed',
};

export const orderLimitSelector = createSelector(
  (state) => state.pDexV3.orderLimit,
  (orderLimit) => orderLimit,
);

export const poolIdSelector = createSelector(
  orderLimitSelector,
  ({ poolId }) => poolId,
);

export const poolSelectedDataSelector = createSelector(
  orderLimitSelector,
  getDataByPoolIdSelector,
  ({ poolId }, getDataByPoolId) => getDataByPoolId(poolId) || {},
);

// group inputs

// fee

export const inpuTokenSelector = createSelector(
  getPrivacyDataByTokenIDSelector,
  orderLimitSelector,
  (getPrivacyDataByTokenID, orderLimit) => (field) => {
    try {
      const tokenId = orderLimit[field];
      if (!tokenId) {
        return {};
      }
      const token = getPrivacyDataByTokenID(orderLimit[field]);
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

export const feeSelectedSelector = createSelector(
  orderLimitSelector,
  ({ feetoken }) => feetoken || '',
);

export const feetokenDataSelector = createSelector(
  (state) => state,
  orderLimitSelector,
  feeSelectedSelector,
  getPrivacyDataByTokenIDSelector,
  (state, { data }, feetoken, getPrivacyDataByTokenID) => {
    try {
      const feeTokenData: SelectedPrivacy = getPrivacyDataByTokenID(feetoken);
      const selector = formValueSelector(formConfigs.formName);
      const fee = selector(state, formConfigs.feetoken);
      const { fee: minFeeOriginal = 0 } = data;
      const feeAmount = convert.toNumber(fee, true) || 0;
      const feeAmountText = fee;
      const origininalFeeAmount = convert.toOriginalAmount(
        feeAmount,
        feeTokenData?.pDecimals,
        false,
      );
      const minFeeAmount = convert.toHumanAmount(
        minFeeOriginal,
        feeTokenData?.pDecimals,
      );
      const minFeeAmountText = format.toFixed(
        minFeeAmount,
        feeTokenData?.pDecimals,
      );
      const minFeeAmountStr = `${minFeeAmountText} ${feeTokenData?.symbol}`;
      return {
        feetoken,
        symbol: feeTokenData?.symbol,
        pDecimals: feeTokenData?.pDecimals,

        feeAmount,
        feeAmountText,
        origininalFeeAmount,

        minFeeOriginal,
        minFeeAmount,
        minFeeAmountStr,
        minFeeAmountText,
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
  feetokenDataSelector,
  orderLimitSelector,
  sharedSelector.isGettingBalance,
  getPrivacyDataByTokenIDSelector,
  poolSelectedDataSelector,
  getInputTokenAmount,
);

export const rateDataSelector = createSelector(
  (state) => state,
  inputAmountSelector,
  poolSelectedDataSelector,
  (state, getInputAmount, pool) => {
    let rate = '';
    let rateStr = '';
    let customRate = '';
    let rateToken = {};
    try {
      const sellInputAmount = getInputAmount(formConfigs.selltoken);
      const buyInputAmount = getInputAmount(formConfigs.buytoken);
      if (isEmpty(sellInputAmount) || isEmpty(buyInputAmount)) {
        return {
          rate,
          rateStr,
          customRate,
        };
      }
      rateToken = pool?.token2;
      const rateAmount = pool?.price || 0;
      const originalRateAmount = convert.toOriginalAmount(
        rateAmount,
        rateToken?.pDecimals,
        true,
      );
      rateStr = format.amountVer2(originalRateAmount, rateToken?.pDecimals);
      const rateToNumber = convert.toNumber(rateStr, true);
      rate = format.toFixed(rateToNumber, rateToken?.pDecimals);
      const selector = formValueSelector(formConfigs.formName);
      customRate = selector(state, formConfigs.rate);
      customRate = customRate || rate;
      customRate = convert.toNumber(customRate, true);
    } catch (error) {
      console.log('rateSelector-error', error);
    }
    return {
      rate,
      rateStr,
      customRate,
      rateToken,
    };
  },
);

export const orderLimitDataSelector = createSelector(
  (state) => state,
  orderLimitSelector,
  activedTabSelector,
  getPrivacyDataByTokenIDSelector,
  inputAmountSelector,
  feetokenDataSelector,
  rateDataSelector,
  poolSelectedDataSelector,
  nftTokenDataSelector,
  (
    state,
    { networkfee, initing, percent, ordering },
    getActivedTab,
    getPrivacyDataByTokenID,
    getInputAmount,
    feeTokenData,
    rateData,
    pool,
    { nftTokenAvailable },
  ) => {
    const sellInputAmount = getInputAmount(formConfigs.selltoken);
    const buyInputAmount = getInputAmount(formConfigs.buytoken);
    const activedTab = getActivedTab(ROOT_TAB_ORDER_LIMIT);
    let btnActionTitle;
    const buyColor = COLORS.green;
    const sellColor = COLORS.red;
    let reviewOrderTitle = '';
    let mainColor;
    let reviewOrderDesc = '';
    let reviewOrderDescValue = '';
    let cfmTitle = '';
    switch (activedTab) {
    case TAB_SELL_ID: {
      mainColor = sellColor;
      btnActionTitle = `Sell ${sellInputAmount?.symbol}`;
      reviewOrderTitle = `Sell ${sellInputAmount?.amountText} ${sellInputAmount?.symbol}`;
      reviewOrderDesc = 'Receive';
      reviewOrderDescValue = `${buyInputAmount?.amountText} ${buyInputAmount?.symbol}`;
      cfmTitle = `You placed an order to sell ${sellInputAmount?.amountText} ${sellInputAmount?.symbol} for ${reviewOrderDescValue}`;
      break;
    }
    case TAB_BUY_ID: {
      mainColor = buyColor;
      btnActionTitle = `Buy ${buyInputAmount?.symbol}`;
      reviewOrderTitle = `Buy ${buyInputAmount?.amountText} ${buyInputAmount?.symbol}`;
      reviewOrderDesc = 'Pay with';
      reviewOrderDescValue = `${sellInputAmount?.amountText} ${sellInputAmount?.symbol}`;
      cfmTitle = `You placed an order to buy ${buyInputAmount?.amountText} ${buyInputAmount?.symbol} for ${reviewOrderDescValue}`;
      break;
    }
    default:
      break;
    }
    const token1: SelectedPrivacy = pool?.token1;
    const token2: SelectedPrivacy = pool?.token2;
    const networkfeeAmount = format.toFixed(
      convert.toHumanAmount(networkfee, PRV.pDecimals),
      PRV.pDecimals,
    );
    const networkfeeAmountStr = `${networkfeeAmount} ${PRV.symbol}`;
    const prv: SelectedPrivacy = getPrivacyDataByTokenID(PRV.id);
    const showPRVBalance =
      !sellInputAmount?.isMainCrypto && !buyInputAmount.isMainCrypto;
    const prvBalance = format.amountVer2(prv?.amount || 0, PRV.pDecimals);
    const prvBalanceStr = `${prvBalance} ${PRV.symbol}`;
    const balanceStr = `${sellInputAmount?.balanceStr ||
      '0'} ${sellInputAmount?.symbol || ''}`;
    const poolSizeStr = `${sellInputAmount?.poolValueStr} ${sellInputAmount?.symbol} + ${buyInputAmount?.poolValueStr} ${buyInputAmount?.symbol}`;
    const editableInput = !initing;
    const calculating = initing;
    const disabledBtn =
      calculating ||
      !isValid(formConfigs.formName)(state) ||
      !nftTokenAvailable;
    if (!nftTokenAvailable) {
      btnActionTitle = 'Not enough NFT token';
    }
    if (calculating) {
      btnActionTitle = 'Calculating...';
    }
    const tradingFeeStr = `${feeTokenData?.feeAmountText} ${feeTokenData?.symbol}`;
    const refreshing = initing;
    const poolStr = `${token1?.symbol || ''} / ${token2?.symbol || ''}`;
    const priceChange24h = pool?.priceChange24h || 0;
    let colorPriceChange24h = COLORS.green;
    if (priceChange24h < 0) {
      colorPriceChange24h = COLORS.red;
    }
    return {
      mainColor,
      buyColor,
      sellColor,
      btnActionTitle,
      activedTab,
      editableInput,
      networkfeeAmount,
      networkfeeAmountStr,
      networkfee,
      showPRVBalance,
      prvBalance,
      prvBalanceStr,
      balanceStr,
      poolSizeStr,
      disabledBtn,
      percent,
      tradingFeeStr,
      reviewOrderTitle,
      reviewOrderDesc,
      reviewOrderDescValue,
      cfmTitle,
      poolTitle: pool?.poolTitle || '',
      poolId: pool?.poolId,
      ordering,
      refreshing,
      sellTokenId: sellInputAmount?.tokenId,
      buyTokenId: buyInputAmount?.tokenId,
      poolStr,
      priceChange24hStr: `${priceChange24h}%`,
      colorPriceChange24h,
      calculating,
    };
  },
);

// history

export const mappingOrderHistorySelector = createSelector(
  orderLimitSelector,
  poolSelectedDataSelector,
  nftTokenDataSelector,
  getPrivacyDataByTokenIDSelector,
  (
    { withdrawingOrderTxs, withdrawOrderTxs },
    pool,
    { nftTokenAvailable, list },
    getPrivacyDataByTokenID,
  ) => (order) => {
    try {
      if (!order) {
        return {};
      }
      const token1: SelectedPrivacy = pool?.token1;
      const token2: SelectedPrivacy = pool?.token2;
      let {
        sellTokenId,
        requestime,
        matched,
        amount,
        minAccept: price,
        requestTx,
        isCompleted,
        status,
        statusCode,
        minAccept,
        buyTokenId,
        fromStorage,
        nftid,
      } = order;
      let type,
        mainColor,
        infoStr,
        amountStr,
        priceStr,
        sellStr,
        buyStr,
        rateStr;
      const sellTokenBalance = new BigNumber(order?.sellTokenBalance);
      const buyTokenBalance = new BigNumber(order?.buyTokenBalance);
      const sellTokenWithdrawed = new BigNumber(order?.sellTokenWithdrawed);
      let statusStr = status;
      let visibleBtnCancel = false;
      let visibleBtnClaim = false;
      const isWithdrawing = statusCode === 3 || status === 'withdrawing';
      if (isCompleted) {
        if (sellTokenWithdrawed.isGreaterThan(0)) {
          statusStr = 'Canceled';
        } else {
          statusStr = 'Claimed';
        }
      } else {
        if (sellTokenBalance.isEqualTo(0) && buyTokenBalance.isGreaterThan(0)) {
          if (isWithdrawing) {
            statusStr = 'Claiming';
          } else {
            visibleBtnClaim = true;
          }
        } else if (sellTokenBalance.isGreaterThan(0)) {
          if (isWithdrawing) {
            statusStr = 'Canceling';
          } else {
            visibleBtnCancel = true;
          }
        }
      }
      const withdrawTx =
        withdrawOrderTxs.find((tx) => isEqual(tx?.requestTx, requestTx)) || {};
      let cancelTx, claimTx;
      if (withdrawTx?.requestTx) {
        switch (withdrawTx?.txType) {
        case ACCOUNT_CONSTANT.TX_TYPE.CANCEL_ORDER_LIMIT:
          cancelTx = withdrawTx;
          break;
        case ACCOUNT_CONSTANT.TX_TYPE.CLAIM_ORDER_LIMIT:
          claimTx = withdrawTx;
          break;
        default:
          break;
        }
      }
      const btnTitleClaim = 'Claim';
      const btnTitleCancel = 'Cancel';
      const { status: cancelTxStatus, withdrawTxId: cancelTxId } =
        cancelTx || {};
      const { status: claimTxStatus, withdrawTxId: claimTxId } = claimTx || {};
      let visibleBtnAction = false;
      const foundNFT = list.find((nft) => nft?.nftToken === nftid);
      if (new BigNumber(foundNFT?.realAmount).eq(1)) {
        visibleBtnAction = true;
      }
      visibleBtnCancel = visibleBtnCancel && !cancelTxId;
      visibleBtnClaim = visibleBtnClaim && !claimTxId;
      let btnCancel = '';
      let btnClaim = '';
      if (cancelTxId) {
        btnCancel = BTN_WITHDRAW_ORDER[cancelTxStatus]
          ? `${btnTitleCancel}${BTN_WITHDRAW_ORDER[cancelTxStatus]}`
          : '';
        statusStr = btnCancel || statusStr;
      }
      if (claimTxId) {
        btnClaim = BTN_WITHDRAW_ORDER[claimTxStatus]
          ? `${btnTitleClaim}${BTN_WITHDRAW_ORDER[claimTxStatus]}`
          : '';
        statusStr = btnClaim || statusStr;
      }
      const poolStr = `${token1.symbol} / ${token2.symbol}`;
      const sellToken: SelectedPrivacy = getPrivacyDataByTokenID(sellTokenId);
      const buyToken: SelectedPrivacy = getPrivacyDataByTokenID(buyTokenId);
      if (sellTokenId === token1.tokenId) {
        type = 'sell';
        mainColor = COLORS.red;
        const originalPrice = getOriginalPairRate({
          token1Value: amount,
          token2Value: price,
          token1: sellToken,
          token2: buyToken,
        });
        priceStr = format.amountVer2(originalPrice, buyToken?.pDecimals);
        rateStr = getExchangeRate(sellToken, buyToken, amount, price);
        const sellAmount = format.amountVer2(amount, sellToken.pDecimals);
        const buyAmount = format.amountVer2(price, buyToken.pDecimals, false);
        amountStr = sellAmount;
        sellStr = `${sellAmount} ${sellToken.symbol}`;
        buyStr = `${buyAmount} ${buyToken.symbol}`;
        infoStr = poolStr;
      } else if (buyTokenId === token1.tokenId) {
        type = 'buy';
        mainColor = COLORS.green;
        const originalPrice = getOriginalPairRate({
          token1Value: price,
          token2Value: amount,
          token1: buyToken,
          token2: sellToken,
        });
        priceStr = format.amountVer2(originalPrice, sellToken?.pDecimals);
        rateStr = getExchangeRate(buyToken, sellToken, price, amount);
        const sellAmount = format.amountVer2(amount, sellToken.pDecimals);
        const buyAmount = format.amountVer2(price, buyToken.pDecimals);
        amountStr = buyAmount;
        sellStr = `${sellAmount} ${sellToken.symbol}`;
        buyStr = `${buyAmount} ${buyToken.symbol}`;
        infoStr = poolStr;
      }

      const percentToNumber = new BigNumber(matched)
        .dividedBy(new BigNumber(amount))
        .multipliedBy(100)
        .toNumber();
      const percent = format.toFixed(percentToNumber, 2);
      const percentStr = `Filled ${percent}%`;
      const percentStr1 = `${percent}%`;
      const time = fromStorage ? requestime : requestime * 1000;
      const timeStr = format.formatDateTime(new Date(time).getTime());
      const withdrawing = withdrawingOrderTxs.includes(requestTx);
      const rate = getPairRate({
        token1Value: amount,
        token2Value: minAccept,
        token1: sellToken,
        token2: buyToken,
      });
      const result = {
        ...order,
        type,
        mainColor,
        timeStr,
        percent,
        percentStr,
        infoStr,
        visibleBtnCancel,
        btnClaim,
        visibleBtnClaim,
        btnTitleCancel,
        btnTitleClaim,
        btnCancel,
        withdrawing,
        statusStr,
        nftTokenAvailable,
        poolId: pool?.poolId,
        percentStr1,
        buyStr,
        sellStr,
        rate,
        rateStr,
        networkfeeAmountStr: `${format.amountVer2(1, PRV.pDecimals)} ${
          PRV.symbol
        }`,
        token1,
        token2,
        priceStr,
        amountStr,
        visibleBtnAction,
      };
      return result;
    } catch (error) {
      console.log('mappingOrderHistorySelector-error', error);
    }
  },
);

export const orderHistorySelector = createSelector(
  orderLimitSelector,
  poolSelectedDataSelector,
  mappingOrderHistorySelector,
  ({ ordersHistory }, pool, mappingOrderHistory) => {
    let history = [];
    const { isFetching, isFetched, data } = ordersHistory;
    if (data.length === 0 || !data || !pool) {
      return history;
    }
    history = data.map((order) => mappingOrderHistory(order));
    return { history, isFetching, isFetched };
  },
);

export const openOrdersSelector = createSelector(
  orderHistorySelector,
  ({ isFetched, isFetching, history }) => ({
    history: history?.filter(({ isCompleted }) => !isCompleted),
    isFetched,
    isFetching,
  }),
);

export const orderCancelingSelector = createSelector(
  orderLimitSelector,
  ({ orderCanceling }) => orderCanceling || [],
);

export const isOrderCancelingSelector = createSelector(
  orderCancelingSelector,
  (orderCanceling) => (id) => id && orderCanceling?.includes(id),
);

export const orderDetailSelector = createSelector(
  orderLimitSelector,
  mappingOrderHistorySelector,
  ({ orderDetail: { fetching, order } }, mappingOrderHistory) => {
    return {
      fetching,
      order: mappingOrderHistory(order),
    };
  },
);
