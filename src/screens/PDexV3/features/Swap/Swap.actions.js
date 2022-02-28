/* eslint-disable import/no-cycle */
import { getBalance } from '@src/redux/actions/token';
import { actionGetPDexV3Inst, getPDexV3Instance } from '@screens/PDexV3';
import {
  ACCOUNT_CONSTANT,
  PrivacyVersion,
  EXCHANGE_SUPPORTED,
} from 'incognito-chain-web-js/build/wallet';
import serverService from '@src/services/wallet/Server';
import { defaultAccountWalletSelector } from '@src/redux/selectors/account';
import { ExHandler } from '@src/services/exception';
import { change, reset } from 'redux-form';
import isEmpty from 'lodash/isEmpty';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { batch } from 'react-redux';
import uniq from 'lodash/uniq';
import { PRV, PRV_ID } from '@src/constants/common';
import convert from '@src/utils/convert';
import format from '@src/utils/format';
import BigNumber from 'bignumber.js';
import floor from 'lodash/floor';
import difference from 'lodash/difference';
import { isUsePRVToPayFeeSelector } from '@screens/Setting';
import flatten from 'lodash/flatten';
import orderBy from 'lodash/orderBy';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_SET_SELL_TOKEN,
  ACTION_SET_BUY_TOKEN,
  ACTION_SET_FEE_TOKEN,
  ACTION_SET_FOCUS_TOKEN,
  formConfigs,
  ACTION_SET_SELECTING_TOKEN,
  ACTION_SET_SWAPING_TOKEN,
  ACTION_SET_INITIING_SWAP,
  ACTION_RESET,
  ACTION_SET_PERCENT,
  ACTION_FETCH_SWAP,
  ACTION_FETCHED_LIST_PAIRS,
  ACTION_FETCHING_ORDERS_HISTORY,
  ACTION_FETCHED_ORDERS_HISTORY,
  ACTION_FETCH_FAIL_ORDERS_HISTORY,
  ACTION_FETCHING_ORDER_DETAIL,
  ACTION_FETCHED_ORDER_DETAIL,
  ACTION_SET_DEFAULT_PAIR,
  ACTION_TOGGLE_PRO_TAB,
  ACTION_CHANGE_SELECTED_PLATFORM,
  KEYS_PLATFORMS_SUPPORTED,
  ACTION_SAVE_LAST_FIELD,
  ACTION_CHANGE_ESTIMATE_DATA,
  ACTION_SET_DEFAULT_EXCHANGE,
  ACTION_FREE_HISTORY_ORDERS,
  ACTION_SET_ERROR,
  ACTION_REMOVE_ERROR,
  ACTION_CHANGE_SLIPPAGE,
  ACTION_FETCHING_REWARD_HISTORY,
  ACTION_FETCHED_REWARD_HISTORY,
  ACTION_FETCH_FAIL_REWARD_HISTORY,
} from './Swap.constant';
import {
  buytokenSelector,
  feeSelectedSelector,
  feetokenDataSelector,
  inputAmountSelector,
  selltokenSelector,
  orderDetailSelector,
  swapInfoSelector,
  slippagetoleranceSelector,
  swapSelector,
  defaultPairSelector,
  sellInputTokenSelector,
  findTokenPancakeByIdSelector,
  findTokenUniByIdSelector,
  hashmapContractIDsSelector,
  platformSelectedSelector,
  isPairSupportedTradeOnPancakeSelector,
  isPairSupportedTradeOnUniSelector,
  defaultExchangeSelector,
  isPrivacyAppSelector,
  isExchangeVisibleSelector,
  errorEstimateTradeSelector,
  listPairsIDVerifiedSelector,
} from './Swap.selector';
import {
  calMintAmountExpected,
  getBestRateFromPancake,
  findBestRateOfMaxBuyAmount,
  findBestRateOfMinSellAmount,
} from './Swap.utils';

export const actionChangeSlippage = (payload) => ({
  type: ACTION_CHANGE_SLIPPAGE,
  payload,
});

export const actionSetError = (payload) => ({
  type: ACTION_SET_ERROR,
  payload,
});

export const actionRemoveError = () => ({
  type: ACTION_REMOVE_ERROR,
});

export const actionSetDefaultExchange = ({ isPrivacyApp, exchange }) => ({
  type: ACTION_SET_DEFAULT_EXCHANGE,
  payload: {
    isPrivacyApp,
    exchange,
  },
});

export const actionChangeEstimateData = (payload) => ({
  type: ACTION_CHANGE_ESTIMATE_DATA,
  payload,
});

export const actionSaveLastField = (field) => ({
  type: ACTION_SAVE_LAST_FIELD,
  payload: field,
});

export const actionToggleProTab = (payload) => ({
  type: ACTION_TOGGLE_PRO_TAB,
  payload,
});

export const actionSetPercent = (payload) => ({
  type: ACTION_SET_PERCENT,
  payload,
});

export const actionSetSellTokenFetched = (payload) => ({
  type: ACTION_SET_SELL_TOKEN,
  payload,
});

export const actionSetBuyTokenFetched = (payload) => ({
  type: ACTION_SET_BUY_TOKEN,
  payload,
});

export const actionSetFeeToken = (payload) => ({
  type: ACTION_SET_FEE_TOKEN,
  payload,
});

export const actionSetFocusToken = (payload) => ({
  type: ACTION_SET_FOCUS_TOKEN,
  payload,
});

export const actionFetching = (payload) => ({
  type: ACTION_FETCHING,
  payload,
});

export const actionFetched = (payload) => ({
  type: ACTION_FETCHED,
  payload,
});

export const actionFetchFail = () => ({
  type: ACTION_FETCH_FAIL,
});

export const actionReset = (payload) => ({
  type: ACTION_RESET,
  payload,
});

export const actionEstimateTradeForMax = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const feeTokenData = feetokenDataSelector(state);
    const {
      payFeeByPRV,
      minFeeOriginalPRV,
      minFeePRVFixed,
      availableFixedSellAmountPRV,
      minFeeTokenFixed,
      availableFixedSellAmountToken,
    } = feeTokenData;
    const { tokenId: selltoken, isMainCrypto: sellTokenIsPRV } =
      sellInputTokenSelector(state);
    if (sellTokenIsPRV) {
      batch(() => {
        dispatch(
          change(
            formConfigs.formName,
            formConfigs.selltoken,
            availableFixedSellAmountPRV,
          ),
        );
        dispatch(
          change(formConfigs.formName, formConfigs.feetoken, minFeePRVFixed),
        );
      });
    } else {
      // sellTokenIsToken
      const prvBalance = await dispatch(getBalance(PRV.id));
      let availableOriginalPRVAmount = new BigNumber(prvBalance).minus(
        minFeeOriginalPRV,
      );
      const canPayFeeByPRV =
        minFeeOriginalPRV && availableOriginalPRVAmount.gt(0);
      if (canPayFeeByPRV && payFeeByPRV) {
        batch(() => {
          dispatch(
            change(
              formConfigs.formName,
              formConfigs.selltoken,
              availableFixedSellAmountPRV,
            ),
          );
          dispatch(
            change(formConfigs.formName, formConfigs.feetoken, minFeePRVFixed),
          );
        });
      } else {
        batch(() => {
          dispatch(
            change(
              formConfigs.formName,
              formConfigs.selltoken,
              availableFixedSellAmountToken,
            ),
          );
          dispatch(
            change(
              formConfigs.formName,
              formConfigs.feetoken,
              minFeeTokenFixed,
            ),
          );
          dispatch(actionSetFeeToken(selltoken));
        });
      }
    }
  } catch (error) {
    throw error;
  }
};

export const actionHandleInjectEstDataForPDex =
  () => async (dispatch, getState) => {
    try {
      const state = getState();
      const inputAmount = inputAmountSelector(state);
      let sellInputToken, buyInputToken, inputToken, inputPDecimals;
      sellInputToken = inputAmount(formConfigs.selltoken);
      buyInputToken = inputAmount(formConfigs.buytoken);
      const { tokenId: selltoken, pDecimals: sellPDecimals } = sellInputToken;
      const { pDecimals: buyPDecimals } = buyInputToken;
      const feeTokenData = feetokenDataSelector(state);
      const {
        minFeeAmountFixed,
        canNotPayFeeByPRV,
        minFeeTokenFixed,
        payFeeByPRV,
        feePrvEst,
        feeTokenEst,
        field,
        useMax,
      } = feeTokenData;
      let maxGet = 0;
      switch (field) {
      case formConfigs.selltoken: {
        if (payFeeByPRV) {
          maxGet = feePrvEst?.maxGet || 0;
        } else {
          maxGet = feeTokenEst?.maxGet || 0;
        }
        inputPDecimals = buyPDecimals;
        inputToken = formConfigs.buytoken;
        break;
      }
      case formConfigs.buytoken: {
        if (payFeeByPRV) {
          maxGet = feePrvEst?.sellAmount || 0;
        } else {
          maxGet = feeTokenEst?.sellAmount || 0;
        }
        inputPDecimals = sellPDecimals;
        inputToken = formConfigs.selltoken;
        break;
      }
      default:
        break;
      }
      const slippagetolerance = slippagetoleranceSelector(state);
      const originalMinAmountExpected = field === formConfigs.buytoken ? maxGet : calMintAmountExpected({
        maxGet,
        slippagetolerance,
      });
      const minAmountExpectedToHumanAmount = convert.toHumanAmount(
        originalMinAmountExpected,
        inputPDecimals,
      );
      const minAmountExpectedToFixed = format.toFixed(
        minAmountExpectedToHumanAmount,
        inputPDecimals,
      );
      dispatch(
        change(formConfigs.formName, inputToken, minAmountExpectedToFixed),
      );
      if (useMax) {
        await dispatch(actionEstimateTradeForMax({}));
      } else {
        batch(() => {
          if (canNotPayFeeByPRV) {
            batch(() => {
              dispatch(actionSetFeeToken(selltoken));
              dispatch(
                change(
                  formConfigs.formName,
                  formConfigs.feetoken,
                  minFeeTokenFixed,
                ),
              );
            });
          } else {
            dispatch(
              change(
                formConfigs.formName,
                formConfigs.feetoken,
                minFeeAmountFixed,
              ),
            );
          }
        });
      }
    } catch (error) {
      throw error;
    }
  };

export const actionEstimateTradeForPDex =
  (payload) => async (dispatch, getState) => {
    let minSellOriginalAmount = 0;
    let maxBuyOriginalAmount = 0;
    let state = getState();
    const isExchangeVisible = isExchangeVisibleSelector(state)(
      KEYS_PLATFORMS_SUPPORTED.incognito,
    );
    if (!isExchangeVisible) {
      return {
        minSellOriginalAmount,
        maxBuyOriginalAmount,
      };
    }
    const { payFeeByPRV, field } = feetokenDataSelector(state);
    try {
      const { sellamount, buyamount } = payload;
      const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
      const estPDexData = await pDexV3Inst.getEstimateTrade(payload);
      const { feePrv: feePrvEst, feeToken: feeTokenEst } = estPDexData;
      let maxGet = 0;
      switch (field) {
      case formConfigs.selltoken: {
        if (payFeeByPRV) {
          maxGet = feePrvEst?.maxGet || 0;
        } else {
          maxGet = feeTokenEst?.maxGet || 0;
        }
        minSellOriginalAmount = sellamount;
        maxBuyOriginalAmount = maxGet;
        break;
      }
      case formConfigs.buytoken: {
        if (payFeeByPRV) {
          maxGet = feePrvEst?.sellAmount || 0;
        } else {
          maxGet = feeTokenEst?.sellAmount || 0;
        }
        minSellOriginalAmount = maxGet;
        maxBuyOriginalAmount = buyamount;
        break;
      }
      default:
        break;
      }
      await dispatch(
        actionChangeEstimateData({
          [KEYS_PLATFORMS_SUPPORTED.incognito]: {
            ...estPDexData,
            error: null,
          },
        }),
      );
    } catch (error) {
      console.log('actionEstimateTradeForPDex ERROR', error);
      state = getState();

      dispatch(
        actionSetError({
          error,
          platformId: KEYS_PLATFORMS_SUPPORTED.incognito,
        }),
      );
    }
    return {
      minSellOriginalAmount,
      maxBuyOriginalAmount,
    };
  };

export const actionHandleInjectEstDataForUni =
  () => async (dispatch, getState) => {
    try {
      await dispatch(actionSetFeeToken(PRV.id));
      const state = getState();
      const inputAmount = inputAmountSelector(state);
      let sellInputToken, buyInputToken, inputToken, inputPDecimals;
      sellInputToken = inputAmount(formConfigs.selltoken);
      buyInputToken = inputAmount(formConfigs.buytoken);
      const { tokenId: selltoken } = sellInputToken;
      const { tokenId: buytoken } = buyInputToken;
      const { field, useMax } = feetokenDataSelector(state);
      const getUniTokenParamReq = findTokenUniByIdSelector(state);
      const tokenSellUni = getUniTokenParamReq(selltoken);
      const tokenBuyUni = getUniTokenParamReq(buytoken);
      if (tokenSellUni == null || tokenBuyUni == null) {
        throw 'This pair is not existed on uni';
      }
      switch (field) {
      case formConfigs.selltoken: {
        inputPDecimals = tokenBuyUni.pDecimals;
        inputToken = formConfigs.buytoken;
        break;
      }
      case formConfigs.buytoken: {
        inputPDecimals = tokenSellUni.pDecimals;
        inputToken = formConfigs.selltoken;
        break;
      }
      default:
        break;
      }
      const { maxGet, minFeePRVFixed, availableFixedSellAmountPRV } =
        feetokenDataSelector(state);
      const slippagetolerance = slippagetoleranceSelector(state);
      const originalMinAmountExpected =
        field === formConfigs.buytoken
          ? maxGet
          : calMintAmountExpected({
            maxGet,
            slippagetolerance,
          });
      const minAmountExpectedToHumanAmount = convert.toHumanAmount(
        originalMinAmountExpected,
        inputPDecimals,
      );
      const minAmountExpectedToFixed = format.toFixed(
        minAmountExpectedToHumanAmount,
        inputPDecimals,
      );
      batch(() => {
        if (useMax) {
          dispatch(
            change(
              formConfigs.formName,
              formConfigs.selltoken,
              availableFixedSellAmountPRV,
            ),
          );
        }
        dispatch(
          change(formConfigs.formName, inputToken, minAmountExpectedToFixed),
        );
        dispatch(
          change(formConfigs.formName, formConfigs.feetoken, minFeePRVFixed),
        );
      });
    } catch (error) {
      throw error;
    }
  };

export const actionHandleInjectEstDataForPancake =
  () => async (dispatch, getState) => {
    try {
      await dispatch(actionSetFeeToken(PRV.id));
      const state = getState();
      const inputAmount = inputAmountSelector(state);
      let sellInputToken, buyInputToken, inputToken, inputPDecimals;
      sellInputToken = inputAmount(formConfigs.selltoken);
      buyInputToken = inputAmount(formConfigs.buytoken);
      const { tokenId: selltoken } = sellInputToken;
      const { tokenId: buytoken } = buyInputToken;
      const { field, useMax } = feetokenDataSelector(state);
      const getPancakeTokenParamReq = findTokenPancakeByIdSelector(state);
      const tokenSellPancake = getPancakeTokenParamReq(selltoken);
      const tokenBuyPancake = getPancakeTokenParamReq(buytoken);
      if (tokenSellPancake == null || tokenBuyPancake == null) {
        throw 'This pair is not existed on pancake';
      }
      switch (field) {
      case formConfigs.selltoken: {
        inputPDecimals = tokenBuyPancake.pDecimals;
        inputToken = formConfigs.buytoken;
        break;
      }
      case formConfigs.buytoken: {
        inputPDecimals = tokenSellPancake.pDecimals;
        inputToken = formConfigs.selltoken;
        break;
      }
      default:
        break;
      }
      const { maxGet, minFeePRVFixed, availableFixedSellAmountPRV } =
        feetokenDataSelector(state);
      const slippagetolerance = slippagetoleranceSelector(state);
      const originalMinAmountExpected = field === formConfigs.buytoken ? maxGet : calMintAmountExpected({
        maxGet,
        slippagetolerance,
      });
      const minAmountExpectedToHumanAmount = convert.toHumanAmount(
        originalMinAmountExpected,
        inputPDecimals,
      );
      const minAmountExpectedToFixed = format.toFixed(
        minAmountExpectedToHumanAmount,
        inputPDecimals,
      );
      batch(() => {
        if (useMax) {
          dispatch(
            change(
              formConfigs.formName,
              formConfigs.selltoken,
              availableFixedSellAmountPRV,
            ),
          );
        }
        dispatch(
          change(formConfigs.formName, inputToken, minAmountExpectedToFixed),
        );
        dispatch(
          change(formConfigs.formName, formConfigs.feetoken, minFeePRVFixed),
        );
      });
    } catch (error) {
      throw error;
    }
  };

export const actionEstimateTradeForUni =
  (payload) => async (dispatch, getState) => {
    let minSellOriginalAmount = 0;
    let maxBuyOriginalAmount = 0;
    let state = getState();
    const isExchangeVisible = isExchangeVisibleSelector(state)(
      KEYS_PLATFORMS_SUPPORTED.uni,
    );
    if (!isExchangeVisible) {
      return {
        minSellOriginalAmount,
        maxBuyOriginalAmount,
      };
    }
    try {
      const { selltoken, buytoken, sellamount, buyamount } = payload;
      const isPairSup = isPairSupportedTradeOnUniSelector(state);
      const { field } = feetokenDataSelector(state);
      const getUniTokenParamReq = findTokenUniByIdSelector(state);
      const tokenSellUni = getUniTokenParamReq(selltoken);
      const tokenBuyUni = getUniTokenParamReq(buytoken);
      if (!isPairSup) {
        throw 'This pair is not existed on uni';
      }
      const server = await serverService.getDefault();
      const { uniConfigs } = server;
      let tokenDecimals, tokenPDecimals;
      let payloadUni = {
        sourceToken: tokenSellUni,
        destToken: tokenBuyUni,
        chainID: uniConfigs.chainID,
      };
      switch (field) {
      case formConfigs.selltoken: {
        payloadUni.amount = convert.toHumanAmount(
          sellamount,
          tokenSellUni.pDecimals,
        );
        payloadUni.isSwapFromBuyToSell = false;
        tokenDecimals = tokenBuyUni.decimals;
        tokenPDecimals = tokenBuyUni.pDecimals;
        break;
      }
      case formConfigs.buytoken: {
        payloadUni.amount = convert.toHumanAmount(
          buyamount,
          tokenBuyUni.pDecimals,
        );
        payloadUni.isSwapFromBuyToSell = true; // convert from buy -> sell
        tokenDecimals = tokenSellUni.decimals;
        tokenPDecimals = tokenSellUni.pDecimals;
        break;
      }
      default:
        break;
      }
      const { sourceToken, destToken, amount, isSwapFromBuyToSell } =
        payloadUni;
      const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
      const quoteDataResponse = await pDexV3Inst.getQuote({
        tokenInContractId: sourceToken.contractId,
        tokenOutContractId: destToken.contractId,
        amount,
        exactIn: isSwapFromBuyToSell ? false : true,
        chainId: payloadUni.chainID,
      });
      const quote = quoteDataResponse?.data;
      const paths = quote?.paths;
      const impactAmount = quote?.impactAmount || 0;
      if (!paths || paths.length === 0) {
        throw 'Can not found best route for this pair';
      }
      let originalMaxGet = quote?.amountOutRaw;
      const maxGetHuman = convert.toHumanAmount(originalMaxGet, tokenDecimals);
      const maxGet = convert.toOriginalAmount(maxGetHuman, tokenPDecimals);
      // only PRV
      const tradingFee = await pDexV3Inst.estimateUniTradingFee({
        srcTokens: selltoken,
        destTokens: buytoken,
        srcQties: String(isSwapFromBuyToSell ? maxGet : sellamount),
      });
      if (!tradingFee) {
        throw 'Can not estimate trading fee';
      }
      const { feeAddress, tradeID, signAddress, originalTradeFee } = tradingFee;
      let sellAmount = 0;
      switch (field) {
      case formConfigs.selltoken: {
        minSellOriginalAmount = sellamount;
        maxBuyOriginalAmount = maxGet;
        sellAmount = sellamount;
        break;
      }
      case formConfigs.buytoken: {
        minSellOriginalAmount = maxGet;
        maxBuyOriginalAmount = buyamount;
        sellAmount = maxGet;
        break;
      }
      default:
        break;
      }
      await dispatch(
        actionChangeEstimateData({
          [KEYS_PLATFORMS_SUPPORTED.uni]: {
            feePrv: {
              fee: originalTradeFee,
              isSignificant: false,
              maxGet,
              route: paths,
              sellAmount,
              impactAmount,
              tokenRoute: paths,
            },
            feeToken: {
              sellAmount,
              fee: 0,
              isSignificant: false,
              maxGet,
              route: paths,
              impactAmount,
              tokenRoute: paths,
            },
            tradeID,
            feeAddress,
            signAddress,
            ...quote,
            error: null,
          },
        }),
      );
    } catch (error) {
      console.log('ERROR-actionEstimateTradeForUni', error);
      dispatch(
        actionSetError({ platformId: KEYS_PLATFORMS_SUPPORTED.uni, error }),
      );
    }
    return {
      minSellOriginalAmount,
      maxBuyOriginalAmount,
    };
  };

export const actionEstimateTradeForPancake =
  (payload) => async (dispatch, getState) => {
    let minSellOriginalAmount = 0;
    let maxBuyOriginalAmount = 0;
    let state = getState();
    const isExchangeVisible = isExchangeVisibleSelector(state)(
      KEYS_PLATFORMS_SUPPORTED.pancake,
    );
    if (!isExchangeVisible) {
      return {
        minSellOriginalAmount,
        maxBuyOriginalAmount,
      };
    }
    try {
      const { selltoken, buytoken, sellamount, buyamount } = payload;
      const isPairSup = isPairSupportedTradeOnPancakeSelector(state);
      const { field } = feetokenDataSelector(state);
      const getPancakeTokenParamReq = findTokenPancakeByIdSelector(state);
      const tokenSellPancake = getPancakeTokenParamReq(selltoken);
      const tokenBuyPancake = getPancakeTokenParamReq(buytoken);
      if (!isPairSup) {
        throw 'This pair is not existed on pancake';
      }
      let tokenDecimals, tokenPDecimals;
      const server = await serverService.getDefault();
      const { pancakeConfigs, bscConfigs } = server;
      let payloadPancake = {
        sourceToken: tokenSellPancake,
        destToken: tokenBuyPancake,
        chainID: pancakeConfigs.chainID,
      };
      switch (field) {
      case formConfigs.selltoken: {
        payloadPancake.amount = convert.toHumanAmount(
          sellamount,
          tokenSellPancake.pDecimals,
        );
        payloadPancake.isSwapFromBuyToSell = false;
        tokenDecimals = tokenBuyPancake.decimals;
        tokenPDecimals = tokenBuyPancake.pDecimals;
        break;
      }
      case formConfigs.buytoken: {
        payloadPancake.amount = convert.toHumanAmount(
          buyamount,
          tokenBuyPancake.pDecimals,
        );
        payloadPancake.isSwapFromBuyToSell = true; // convert from buy -> sell
        tokenDecimals = tokenSellPancake.decimals;
        tokenPDecimals = tokenSellPancake.pDecimals;
        break;
      }
      default:
        break;
      }
      const { sourceToken, destToken, amount, isSwapFromBuyToSell } =
        payloadPancake;
      const hashmapContractIDs = hashmapContractIDsSelector(state);
      const { paths, outputs, impactAmount } = await getBestRateFromPancake({
        sourceToken,
        destToken,
        amount,
        isSwapFromBuyToSell,
        bscConfigs,
        pancakeConfigs,
        listDecimals: hashmapContractIDs,
      });
      if (!paths || paths.length === 0) {
        throw 'Can not found best route for this pair';
      }
      // convert maxGet amount from decimals to pDecimals
      let originalMaxGet = isSwapFromBuyToSell
        ? outputs[0]
        : outputs[outputs.length - 1];
      const maxGetHuman = convert.toHumanAmount(originalMaxGet, tokenDecimals);
      const maxGet = convert.toOriginalAmount(maxGetHuman, tokenPDecimals);
      // only PRV
      const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
      const tradingFee = await pDexV3Inst.estimatePancakeTradingFee({
        srcTokens: selltoken,
        destTokens: buytoken,
        srcQties: String(isSwapFromBuyToSell ? maxGet : sellamount),
      });
      if (!tradingFee) {
        throw 'Can not estimate trading fee';
      }
      const { feeAddress, tradeID, signAddress, originalTradeFee } = tradingFee;
      let sellAmount = 0;
      let buyAmount = 0;
      switch (field) {
      case formConfigs.selltoken: {
        minSellOriginalAmount = sellamount;
        maxBuyOriginalAmount = maxGet;
        sellAmount = sellamount;
        buyAmount = maxGet;
        break;
      }
      case formConfigs.buytoken: {
        minSellOriginalAmount = maxGet;
        maxBuyOriginalAmount = buyamount;
        sellAmount = maxGet;
        buyAmount = buyamount;
        break;
      }
      default:
        break;
      }
      await dispatch(
        actionChangeEstimateData({
          [KEYS_PLATFORMS_SUPPORTED.pancake]: {
            feePrv: {
              fee: originalTradeFee,
              isSignificant: false,
              maxGet,
              route: paths,
              sellAmount,
              buyAmount,
              impactAmount,
              tokenRoute: paths,
            },
            feeToken: {
              sellAmount,
              buyAmount,
              fee: 0,
              isSignificant: false,
              maxGet,
              route: paths,
              impactAmount,
              tokenRoute: paths,
            },
            tradeID,
            feeAddress,
            signAddress,
            error: null,
          },
        }),
      );
    } catch (error) {
      console.log('ERROR-actionEstimateTradeForPancake', error);
      dispatch(
        actionSetError({ platformId: KEYS_PLATFORMS_SUPPORTED.pancake, error }),
      );
    }
    return {
      minSellOriginalAmount,
      maxBuyOriginalAmount,
    };
  };

export const actionFindBestRateBetweenPlatforms =
  ({ pDexData, pancakeData, uniData, params }) =>
    async (dispatch, getState) => {
      const { field } = params;
      const state = getState();
      const {
        minSellOriginalAmount: sellPDexAmount,
        maxBuyOriginalAmount: buyPDexAmount,
      } = pDexData;
      const {
        minSellOriginalAmount: sellPancakeAmount,
        maxBuyOriginalAmount: buyPancakeAmount,
      } = pancakeData;
      const {
        minSellOriginalAmount: sellUniAmount,
        maxBuyOriginalAmount: buyUniAmount,
      } = uniData;
      let platformIdHasBestRate;
      const isPairSupportedTradeOnPancake =
      isPairSupportedTradeOnPancakeSelector(state);
      const isPairSupportedTradeOnUni =
        isPairSupportedTradeOnUniSelector(state);
      console.log('pdexData', pDexData);
      console.log('pancakeData', pancakeData);
      console.log('uniData', uniData);
      try {
        switch (field) {
        case formConfigs.selltoken: {
          let arrMaxBuyAmount = [];
          if (new BigNumber(buyPDexAmount).isGreaterThan(0)) {
            arrMaxBuyAmount.push({
              id: KEYS_PLATFORMS_SUPPORTED.incognito,
              amount: buyPDexAmount,
            });
          }
          if (
            isPairSupportedTradeOnPancake &&
            new BigNumber(buyPancakeAmount).isGreaterThan(0)
          ) {
            arrMaxBuyAmount.push({
              id: KEYS_PLATFORMS_SUPPORTED.pancake,
              amount: buyPancakeAmount,
            });
          }
          if (
            isPairSupportedTradeOnUni &&
            new BigNumber(buyUniAmount).isGreaterThan(0)
          ) {
            arrMaxBuyAmount.push({
              id: KEYS_PLATFORMS_SUPPORTED.uni,
              amount: buyUniAmount,
            });
          }
          if (arrMaxBuyAmount.length > 0) {
            const bestRate = findBestRateOfMaxBuyAmount(arrMaxBuyAmount);
            platformIdHasBestRate = bestRate?.id;
          }
          break;
        }
        case formConfigs.buytoken: {
          const arrMinSellAmount = [];
          if (new BigNumber(sellPDexAmount).isGreaterThan(0)) {
            arrMinSellAmount.push({
              id: KEYS_PLATFORMS_SUPPORTED.incognito,
              amount: sellPDexAmount,
            });
          }
          if (
            isPairSupportedTradeOnPancake &&
            new BigNumber(sellPancakeAmount).isGreaterThan(0)
          ) {
            arrMinSellAmount.push({
              id: KEYS_PLATFORMS_SUPPORTED.pancake,
              amount: sellPancakeAmount,
            });
          }
          if (
            isPairSupportedTradeOnUni &&
            new BigNumber(sellUniAmount).isGreaterThan(0)
          ) {
            arrMinSellAmount.push({
              id: KEYS_PLATFORMS_SUPPORTED.uni,
              amount: sellUniAmount,
            });
          }
          if (arrMinSellAmount.length > 0) {
            const bestRate = findBestRateOfMinSellAmount(arrMinSellAmount);
            platformIdHasBestRate = bestRate?.id;
          }
          break;
        }
        default:
          break;
        }
        platformIdHasBestRate = KEYS_PLATFORMS_SUPPORTED[platformIdHasBestRate]
          ? platformIdHasBestRate
          : KEYS_PLATFORMS_SUPPORTED.incognito;
        if (platformIdHasBestRate) {
          await dispatch(actionSwitchPlatform(platformIdHasBestRate));
        }
      } catch (error) {
        throw error;
      }
    };

export const actionEstimateTrade =
  ({ field = formConfigs.selltoken, useMax = false } = {}) =>
    async (dispatch, getState) => {
      let isFetched = false;
      let state = getState();
      try {
        const params = { field, useMax };
        dispatch(actionFetching(true));
        const inputAmount = inputAmountSelector(state);
        let sellInputToken, buyInputToken, inputToken, inputPDecimals;
        sellInputToken = inputAmount(formConfigs.selltoken);
        buyInputToken = inputAmount(formConfigs.buytoken);
        const {
          tokenId: selltoken,
          originalAmount: sellOriginalAmount,
          pDecimals: sellPDecimals,
          availableOriginalAmount: availableSellOriginalAmount,
        } = sellInputToken;
        let sellAmount = useMax
          ? availableSellOriginalAmount
          : sellOriginalAmount;
        if (new BigNumber(availableSellOriginalAmount).eq(sellOriginalAmount)) {
          sellAmount = availableSellOriginalAmount;
          useMax = true;
        }
        const {
          tokenId: buytoken,
          originalAmount: buyAmount,
          pDecimals: buyPDecimals,
        } = buyInputToken;
        let payload = {
          selltoken,
          buytoken,
          ismax: useMax,
        };
        const slippagetolerance = slippagetoleranceSelector(state);
        await dispatch(actionChangeEstimateData({ field, useMax }));
        switch (field) {
        case formConfigs.selltoken: {
          inputToken = formConfigs.buytoken;
          payload.sellamount = sellAmount;
          if (!payload.sellamount) {
            return;
          }
          payload.sellamount = String(payload.sellamount);
          inputPDecimals = buyPDecimals;
          break;
        }
        case formConfigs.buytoken: {
          inputToken = formConfigs.selltoken;
          payload.buyamount = floor(
            new BigNumber(buyAmount)
              .multipliedBy(100 / (100 - slippagetolerance))
              .toNumber(),
          );
          if (!payload.buyamount) {
            return;
          }
          payload.buyamount = String(payload.buyamount);
          inputPDecimals = sellPDecimals;
          break;
        }
        default:
          break;
        }
        const feetoken = feeSelectedSelector(state);
        payload.feetoken = feetoken;
        payload.inputPDecimals = inputPDecimals;
        payload.inputToken = inputToken;
        if (
          isEmpty(sellInputToken) ||
        isEmpty(buyInputToken) ||
        isEmpty(feetoken)
        ) {
          return;
        }
        let task = [
          dispatch(actionEstimateTradeForPDex(payload)),
          dispatch(actionEstimateTradeForPancake(payload)),
          dispatch(actionEstimateTradeForUni(payload)),
        ];
        const [pDexData, pancakeData, uniData] = await Promise.all(task);
        await dispatch(
          actionFindBestRateBetweenPlatforms({
            pDexData,
            pancakeData,
            uniData,
            params,
            payload,
          }),
        );
        isFetched = true;
        state = getState();
        const { availableAmountText, availableOriginalAmount } =
        sellInputTokenSelector(state);
        const errorEstTrade = errorEstimateTradeSelector(state);
        if (errorEstTrade) {
          new ExHandler(errorEstTrade).showErrorToast();
          if (useMax && availableOriginalAmount) {
            dispatch(
              change(
                formConfigs.formName,
                formConfigs.selltoken,
                availableAmountText,
              ),
            );
          }
        }
      } catch (error) {
        new ExHandler(error).showErrorToast();
      } finally {
        dispatch(actionSetFocusToken(''));
        dispatch(actionFetched({ isFetched }));
      }
    };

export const actionInitingSwapForm = (payload) => ({
  type: ACTION_SET_INITIING_SWAP,
  payload,
});

export const actionFetchedPairs = (payload) => ({
  payload,
  type: ACTION_FETCHED_LIST_PAIRS,
});

export const actionFetchPairs = (refresh) => async (dispatch, getState) => {
  let pairs = [];
  let pDEXPairs = [];
  let pancakeTokens = [];
  let uniTokens = [];
  try {
    let state = getState();
    const pDexV3Inst = await getPDexV3Instance();
    const { pairs: listPairs } = swapSelector(state);
    if (!refresh && listPairs.length > 0) {
      return listPairs;
    }
    const defaultExchange = defaultExchangeSelector(state);
    const isPrivacyApp = isPrivacyAppSelector(state);
    if (!isPrivacyApp) {
      [pDEXPairs, pancakeTokens, uniTokens] = await Promise.all([
        pDexV3Inst.getListPair(),
        pDexV3Inst.getPancakeTokens(),
        pDexV3Inst.getUniTokens(),
      ]);
      pairs = pDEXPairs.reduce(
        (prev, current) =>
          (prev = prev.concat([current.tokenId1, current.tokenId2])),
        [],
      );
      pairs = [
        ...pairs,
        ...pancakeTokens.map((t) => t?.tokenID),
        ...uniTokens.map((t) => t?.tokenID),
      ];
      pairs = uniq(pairs);
    } else {
      switch (defaultExchange) {
      case KEYS_PLATFORMS_SUPPORTED.pancake:
        pancakeTokens = await pDexV3Inst.getPancakeTokens();
        pairs = [...pancakeTokens.map((t) => t?.tokenID)];
        break;
      case KEYS_PLATFORMS_SUPPORTED.uni:
        uniTokens = await pDexV3Inst.getUniTokens();
        pairs = [...uniTokens.map((t) => t?.tokenID)];
        break;
      default:
        break;
      }
    }
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
  dispatch(actionFetchedPairs({ pairs, pDEXPairs, pancakeTokens, uniTokens }));
  return pairs;
};

export const actionFreeHistoryOrders = () => ({
  type: ACTION_FREE_HISTORY_ORDERS,
});

export const actionInitSwapForm =
  ({ refresh = true, defaultPair = {}, shouldFetchHistory = false } = {}) =>
    async (dispatch, getState) => {
      try {
        let state = getState();
        const defaultExchange = defaultExchangeSelector(state);
        const isUsePRVToPayFee = isUsePRVToPayFeeSelector(state);
        let pair = defaultPair || defaultPairSelector(state);
        batch(() => {
          dispatch(actionInitingSwapForm(true));
          dispatch(reset(formConfigs.formName));
          dispatch(actionSetSellTokenFetched(pair?.selltoken));
          dispatch(actionSetBuyTokenFetched(pair?.buytoken));
          dispatch(actionChangeSelectedPlatform(defaultExchange));
          if (refresh && shouldFetchHistory) {
            dispatch(actionFreeHistoryOrders());
          }
        });
        const pairs = await dispatch(actionFetchPairs(refresh));
        const isDefaultPairExisted =
        difference([pair?.selltoken, pair?.buytoken], pairs).length === 0;
        if (!pair?.selltoken || !pair?.buytoken || !isDefaultPairExisted) {
          state = getState();
          const listPairs = listPairsIDVerifiedSelector(state);
          pair = {
            selltoken: listPairs[0],
            buytoken: listPairs[1],
          };
          batch(() => {
            dispatch(actionSetSellTokenFetched(pair.selltoken));
            dispatch(actionSetBuyTokenFetched(pair.buytoken));
          });
        }
        const { selltoken } = pair;
        state = getState();
        const { slippage: defautSlippage } = swapSelector(state);
        console.log('defautSlippage', defautSlippage);
        batch(() => {
          dispatch(
            change(
              formConfigs.formName,
              formConfigs.slippagetolerance,
              defautSlippage,
            ),
          );
          const useFeeByToken = selltoken !== PRV_ID && !isUsePRVToPayFee;
          if (useFeeByToken) {
            dispatch(actionSetFeeToken(selltoken));
          } else {
            dispatch(actionSetFeeToken(PRV.id));
          }
          dispatch(getBalance(selltoken));
          if (selltoken !== PRV_ID && refresh) {
            dispatch(getBalance(PRV_ID));
          }
          if (shouldFetchHistory) {
            dispatch(actionFetchHistory());
            dispatch(actionFetchRewardHistories());
          }
        });
      } catch (error) {
        new ExHandler(error).showErrorToast();
      } finally {
        dispatch(actionInitingSwapForm(false));
      }
    };

export const actionSetSwapingToken = (payload) => ({
  type: ACTION_SET_SWAPING_TOKEN,
  payload,
});

export const actionSwapToken = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const { tokenId: selltoken }: SelectedPrivacy = selltokenSelector(state);
    const { tokenId: buytoken }: SelectedPrivacy = buytokenSelector(state);
    if (!selltoken | !buytoken) {
      return;
    }
    await dispatch(actionSetSwapingToken(true));
    await dispatch(
      actionInitSwapForm({
        defaultPair: {
          selltoken: buytoken,
          buytoken: selltoken,
        },
        refresh: false,
      }),
    );
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    await dispatch(actionSetSwapingToken(false));
  }
};

export const actionSetSelectingToken = (payload) => ({
  type: ACTION_SET_SELECTING_TOKEN,
  payload,
});

export const actionSelectToken =
  (token: SelectedPrivacy, field) => async (dispatch, getState) => {
    if (!token.tokenId || !field) {
      return;
    }
    try {
      await dispatch(actionSetSelectingToken(true));
      const state = getState();
      const selltoken: SelectedPrivacy = selltokenSelector(state);
      const buytoken: SelectedPrivacy = buytokenSelector(state);
      switch (field) {
      case formConfigs.selltoken: {
        if (selltoken.tokenId === token.tokenId) {
          return;
        }
        if (buytoken.tokenId === token.tokenId) {
          await dispatch(actionSwapToken());
        } else {
          await dispatch(
            actionInitSwapForm({
              refresh: true,
              defaultPair: {
                selltoken: token.tokenId,
                buytoken: buytoken.tokenId,
              },
            }),
          );
        }
        break;
      }
      case formConfigs.buytoken: {
        if (buytoken.tokenId === token.tokenId) {
          return;
        }
        if (selltoken.tokenId === token.tokenId) {
          await dispatch(actionSwapToken());
        } else {
          await dispatch(
            actionInitSwapForm({
              refresh: true,
              defaultPair: {
                selltoken: selltoken.tokenId,
                buytoken: token.tokenId,
              },
            }),
          );
        }
        break;
      }
      default:
        break;
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      await dispatch(actionSetSelectingToken(false));
    }
  };

export const actionFetchingSwap = (payload) => ({
  type: ACTION_FETCH_SWAP,
  payload,
});

export const actionFetchSwap = () => async (dispatch, getState) => {
  let tx;
  try {
    const state = getState();
    const { disabledBtnSwap } = swapInfoSelector(state);
    if (disabledBtnSwap) {
      return;
    }
    await dispatch(actionFetchingSwap(true));
    const account = defaultAccountWalletSelector(state);
    const sellInputAmount = inputAmountSelector(state)(formConfigs.selltoken);
    const buyInputAmount = inputAmountSelector(state)(formConfigs.buytoken);
    const feetokenData = feetokenDataSelector(state);
    if (!sellInputAmount || !buyInputAmount || !feetokenData) {
      return;
    }
    const { tokenId: tokenIDToSell, originalAmount: sellAmount } =
      sellInputAmount;
    const { tokenId: tokenIDToBuy, originalAmount: minAcceptableAmount } =
      buyInputAmount;
    const {
      origininalFeeAmount: tradingFee,
      feetoken,
      feeDataByPlatform,
      tradePath,
    } = feetokenData;
    const pDexV3Inst = await getPDexV3Instance({ account });
    const platform = platformSelectedSelector(state);
    switch (platform.id) {
    case KEYS_PLATFORMS_SUPPORTED.incognito:
      {
        const params = {
          transfer: { fee: ACCOUNT_CONSTANT.MAX_FEE_PER_TX, info: '' },
          extra: {
            tokenIDToSell,
            sellAmount: String(sellAmount),
            tokenIDToBuy,
            tradingFee,
            tradePath,
            feetoken,
            version: PrivacyVersion.ver2,
            minAcceptableAmount: String(minAcceptableAmount),
          },
        };
        tx = await pDexV3Inst.createAndSendSwapRequestTx(params);
        if (!tx) {
          console.log('error');
        }
      }
      break;
    case KEYS_PLATFORMS_SUPPORTED.pancake: {
      const { tradeID, feeAddress, signAddress } = feeDataByPlatform;
      const getPancakeTokenParamReq = findTokenPancakeByIdSelector(state);
      const tokenSellPancake = getPancakeTokenParamReq(tokenIDToSell);
      const tokenBuyPancake = getPancakeTokenParamReq(tokenIDToBuy);
      const response = await pDexV3Inst.createAndSendTradeRequestPancakeTx({
        burningPayload: {
          originalBurnAmount: sellAmount,
          tokenID: tokenIDToSell,
          signKey: signAddress,
          feeAddress,
          tradeFee: tradingFee,
          info: String(tradeID),
          feeToken: feetoken,
        },
        tradePayload: {
          tradeID,
          srcTokenID: tokenSellPancake?.tokenID,
          destTokenID: tokenBuyPancake?.tokenID,
          paths: tradePath.join(','),
          srcQties: String(sellAmount),
          expectedDestAmt: String(minAcceptableAmount),
          isNative:
              tokenBuyPancake?.contractId ===
              '0x0000000000000000000000000000000000000000',
        },
      });
      tx = response;
      break;
    }
    case KEYS_PLATFORMS_SUPPORTED.uni: {
      const { tradeID, feeAddress, signAddress } = feeDataByPlatform;
      const getUniTokenParamReq = findTokenUniByIdSelector(state);
      const tokenSellUni = getUniTokenParamReq(tokenIDToSell);
      const tokenBuyUni = getUniTokenParamReq(tokenIDToBuy);
      const response = await pDexV3Inst.createAndSendTradeRequestUniTx({
        burningPayload: {
          originalBurnAmount: sellAmount,
          tokenID: tokenIDToSell,
          signKey: signAddress,
          feeAddress,
          tradeFee: tradingFee,
          info: String(tradeID),
          feeToken: feetoken,
        },
        tradePayload: {
          fees: JSON.stringify(feetokenData?.uni?.fees),
          tradeID,
          srcTokenID: tokenSellUni?.tokenID,
          destTokenID: tokenBuyUni?.tokenID,
          paths: JSON.stringify(tradePath),
          srcQties: String(sellAmount),
          expectedDestAmt: String(minAcceptableAmount),
          percents: JSON.stringify(feetokenData?.uni?.percents),
          isMulti: feetokenData?.uni?.multiRouter,
        },
      });
      tx = response;
      break;
    }
    default:
      break;
    }
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    batch(() => {
      dispatch(actionFetchingSwap(false));
      dispatch(actionFetchHistory());
      dispatch(actionFetchRewardHistories());
    });
  }
  return tx;
};

export const actionFetchingOrdersHistory = () => ({
  type: ACTION_FETCHING_ORDERS_HISTORY,
});

export const actionFetchedOrdersHistory = (payload) => ({
  type: ACTION_FETCHED_ORDERS_HISTORY,
  payload,
});

export const actionFetchFailOrderHistory = () => ({
  type: ACTION_FETCH_FAIL_ORDERS_HISTORY,
});

export const actionFetchHistory = () => async (dispatch, getState) => {
  let history = [];
  try {
    await dispatch(actionFetchingOrdersHistory());
    const state = getState();
    const pDexV3 = await dispatch(actionGetPDexV3Inst());
    const defaultExchange = defaultExchangeSelector(state);
    const isPrivacyApp = isPrivacyAppSelector(state);
    if (!isPrivacyApp) {
      const [swapHistory, pancakeHistory, uniHistory] = await Promise.all([
        pDexV3.getSwapHistory({ version: PrivacyVersion.ver2 }),
        pDexV3.getSwapPancakeHistory(),
        pDexV3.getSwapUniHistory(),
      ]);
      history = flatten([swapHistory, pancakeHistory, uniHistory]);
    } else {
      switch (defaultExchange) {
      case KEYS_PLATFORMS_SUPPORTED.pancake: {
        history = await pDexV3.getSwapPancakeHistory();
        break;
      }
      case KEYS_PLATFORMS_SUPPORTED.uni: {
        history = await pDexV3.getSwapUniHistory();
        break;
      }
      default:
        break;
      }
    }
    history = orderBy(history, 'requestime', 'desc');
    await dispatch(actionFetchedOrdersHistory(history));
  } catch (error) {
    console.log('actionFetchHistory-error', error);
    new ExHandler(error).showErrorToast();
    await dispatch(actionFetchFailOrderHistory());
  }
};

// Reward history
export const actionFetchingRewardHistories = () => ({
  type: ACTION_FETCHING_REWARD_HISTORY,
});

export const actionFetchedRewardHistories = (payload) => ({
  type: ACTION_FETCHED_REWARD_HISTORY,
  payload,
});

export const actionFetchFailRewardHistories = () => ({
  type: ACTION_FETCH_FAIL_REWARD_HISTORY,
});

export const actionFetchRewardHistories = () => async (dispatch, getState) => {
  try {
    await dispatch(actionFetchingRewardHistories());
    let state = getState();
    const pDexV3 = await dispatch(actionGetPDexV3Inst());
    const platform = platformSelectedSelector(state);
    let rewardHistoriesApiResponse;
    if(platform?.id === KEYS_PLATFORMS_SUPPORTED.pancake) {
      rewardHistoriesApiResponse = await pDexV3.getSwapPancakeRewardHistory({
        page: 0,
        limit: 1000,
      });
    }

    if(platform.id === KEYS_PLATFORMS_SUPPORTED.uni) {
      rewardHistoriesApiResponse = await pDexV3.getSwapUniRewardHistory({
        page: 0,
        limit: 1000,
      });
    }
    console.log('rewardHistoriesApiResponse', rewardHistoriesApiResponse);
    dispatch(actionFetchedRewardHistories(rewardHistoriesApiResponse));
  } catch (error) {
    console.log('actionFetchHistory-error', error);
    new ExHandler(error).showErrorToast();
    await dispatch(actionFetchFailRewardHistories());
  }
};

export const actionFetchingOrderDetail = () => ({
  type: ACTION_FETCHING_ORDER_DETAIL,
});

export const actionFetchedOrderDetail = (payload) => ({
  type: ACTION_FETCHED_ORDER_DETAIL,
  payload,
});

export const actionFetchDataOrderDetail = () => async (dispatch, getState) => {
  let _order = {};
  const state = getState();
  const { order } = orderDetailSelector(state);
  if (!order?.requestTx) {
    return;
  }
  try {
    await dispatch(actionFetchingOrderDetail());
    const pDexV3 = await dispatch(actionGetPDexV3Inst());
    switch (order?.exchange) {
    case EXCHANGE_SUPPORTED.incognito: {
      _order = await pDexV3.getOrderSwapDetail({
        requestTx: order?.requestTx,
        version: PrivacyVersion.ver2,
        fromStorage: !!order?.fromStorage,
      });
      break;
    }
    case EXCHANGE_SUPPORTED.pancake: {
      _order = await pDexV3.getOrderSwapPancakeDetail({
        requestTx: order?.requestTx,
        version: PrivacyVersion.ver2,
        fromStorage: !!order?.fromStorage,
        tradeID: order?.tradeID,
      });
      break;
    }
    case EXCHANGE_SUPPORTED.uni: {
      _order = await pDexV3.getOrderSwapUniDetail({
        requestTx: order?.requestTx,
        version: PrivacyVersion.ver2,
        fromStorage: !!order?.fromStorage,
        tradeID: order?.tradeID,
      });
      break;
    }
    default:
      break;
    }
  } catch (error) {
    _order = { ...order };
    new ExHandler(error).showErrorToast();
  } finally {
    _order = _order || order;
    await dispatch(actionFetchedOrderDetail(_order));
  }
};

export const actionSetDefaultPair = (payload) => ({
  type: ACTION_SET_DEFAULT_PAIR,
  payload,
});

export const actionChangeSelectedPlatform = (payload) => ({
  type: ACTION_CHANGE_SELECTED_PLATFORM,
  payload,
});

export const actionSwitchPlatform =
  (platformId) => async (dispatch, getState) => {
    try {
      await dispatch(actionChangeSelectedPlatform(platformId));
      const state = getState();
      const { field } = feetokenDataSelector(state);
      const errorEstTrade = errorEstimateTradeSelector(state);
      if (!field || errorEstTrade) {
        return;
      }
      switch (platformId) {
      case KEYS_PLATFORMS_SUPPORTED.incognito:
        await dispatch(actionHandleInjectEstDataForPDex());
        break;
      case KEYS_PLATFORMS_SUPPORTED.pancake:
        await dispatch(actionHandleInjectEstDataForPancake());
        break;
      case KEYS_PLATFORMS_SUPPORTED.uni:
        await dispatch(actionHandleInjectEstDataForUni());
        break;
      default:
        break;
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
      throw error;
    }
  };
