/* eslint-disable import/no-cycle */
import { getBalance } from '@src/redux/actions/token';
import { actionGetPDexV3Inst, getPDexV3Instance } from '@screens/PDexV3';
import {
  ACCOUNT_CONSTANT,
  PrivacyVersion,
  EXCHANGE_SUPPORTED,
} from 'incognito-chain-web-js/build/wallet';
import {defaultAccountSelector, defaultAccountWalletSelector} from '@src/redux/selectors/account';
import { ExHandler } from '@src/services/exception';
import routeNames from '@src/router/routeNames';
import { change, reset, isValid } from 'redux-form';
import isEmpty from 'lodash/isEmpty';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { batch } from 'react-redux';
import { PRV, PRV_ID } from '@src/constants/common';
import convert, {
  replaceDecimals,
  replaceDecimalsWithFormatPoint,
} from '@src/utils/convert';
import format from '@src/utils/format';
import BigNumber from 'bignumber.js';
import { currentScreenSelector } from '@screens/Navigation';
import difference from 'lodash/difference';
import orderBy from 'lodash/orderBy';
import { ANALYTICS } from '@src/constants';
import { requestUpdateMetrics } from '@src/redux/actions/app';
import SwapService from '@src/services/api/swap';

import {
  getPrivacyDataFilterSelector,
  getPrivacyDataByTokenID,
} from '@src/redux/selectors/selectedPrivacy';

import { parseShard } from '@screens/Account/features/ExportAccount/ExportAccount';
import {
  isUseTokenFeeParser,
  extractEstimateData,
} from './Swap.estimate.helperMethods';
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
  ACTION_RESET_DATA,
  ACTION_SET_BEST_RATE_EXCHANGE,
  ACTION_SET_EXCHANGE_SUPPORT_LIST,
  CALL_CONTRACT,
  ACTION_SET_RESET_SLIPPAGE,
  ACTION_ESTIMATE_TRADE_ERROR,
  ACTION_NAVIGATE_FROM_MARKET,
  ACTION_RESET_EXCHANGE_SUPPORTED,
  ACTION_SAVE_UNIFIED_ALERT_STATE_BY_ID,
  ACTION_ESTIMATE_COUNT,
  ESTIMATE_COUNT_MAX,
  ACTION_NAVIGATE_TO_SELECT_TOKENS,
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
  findTokenCurveByIdSelector,
  findTokenUniByIdSelector,
  platformSelectedSelector,
  isPairSupportedTradeOnPancakeSelector,
  isPairSupportedTradeOnUniSelector,
  isPairSupportedTradeOnCurveSelector,
  defaultExchangeSelector,
  isPrivacyAppSelector,
  errorEstimateTradeSelector,
  listPairsIDVerifiedSelector,
  listPairsIDBuyTokenVerifiedSelector,
  findTokenSpookyByIdSelector,
  getExchangeSupportByPlatformId,
  findTokenJoeByIdSelector,
  findTokenTrisolarisByIdSelector,
  getEsimateCountSelector,
  swapFormErrorSelector, findTokenInterSwapByIdSelector,
} from './Swap.selector';
import {
  PANCAKE_SUPPORT_NETWORK,
  UNISWAP_SUPPORT_NETWORK,
  CURVE_SUPPORT_NETWORK,
  SPOOKY_SUPPORT_NETWORK,
  ExchangeData,
  JOE_SUPPORT_NETWORK,
  TRISOLARIS_SUPPORT_NETWORK,
} from './Swap.types';

import TransactionHandler, {
  CreateTransactionPAppsPayload,
  CreateTransactionPDexPayload,
} from './Swap.transactionHandler';

import { getNetworkByExchange } from './Swap.utils';

export const actionEstiamteCount = (payload) => ({
  type: ACTION_ESTIMATE_COUNT,
  payload,
});

export const actionResetExchangeSupported = (payload) => ({
  type: ACTION_RESET_EXCHANGE_SUPPORTED,
  payload,
});

export const actionNavigateFormMarketTab = (payload) => ({
  type: ACTION_NAVIGATE_FROM_MARKET,
  payload,
});

export const actionNavigateToSelectToken = (payload) => ({
  type: ACTION_NAVIGATE_TO_SELECT_TOKENS,
  payload,
});

export const actionEstimateTradeError = (payload) => ({
  type: ACTION_ESTIMATE_TRADE_ERROR,
  payload,
});

export const actionSetBestRateExchange = (payload) => ({
  type: ACTION_SET_BEST_RATE_EXCHANGE,
  payload,
});

export const actionSetExchangeSupportList = (payload) => ({
  type: ACTION_SET_EXCHANGE_SUPPORT_LIST,
  payload,
});

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

export const actionSetDefaultExchange = ({
  isPrivacyApp,
  exchange,
  network = null,
}) => ({
  type: ACTION_SET_DEFAULT_EXCHANGE,
  payload: {
    isPrivacyApp,
    exchange,
    network,
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

export const actionResetSlippage = () => ({
  type: ACTION_SET_RESET_SLIPPAGE,
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

export const actionResetData = (payload) => ({
  type: ACTION_RESET_DATA,
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
      dispatch(
        change(
          formConfigs.formName,
          inputToken,
          maxGet ? maxGet.toString() : '',
        ),
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
      console.log('error ', error);
      throw error;
    }
  };

export const setDefaultTradingPlatformOnPdexV3 =
  () => async (dispatch, getState) => {
    const state = getState();
    const isPairSupportedTradeOnPancake =
      isPairSupportedTradeOnPancakeSelector(state);
    const isPairSupportedTradeOnUni = isPairSupportedTradeOnUniSelector(state);
    const isPairSupportedTradeOnCurve =
      isPairSupportedTradeOnCurveSelector(state);
    if (isPairSupportedTradeOnPancake) {
      dispatch(actionChangeSelectedPlatform(KEYS_PLATFORMS_SUPPORTED.pancake));
    } else if (isPairSupportedTradeOnUni) {
      dispatch(actionChangeSelectedPlatform(KEYS_PLATFORMS_SUPPORTED.uni));
    } else if (isPairSupportedTradeOnCurve) {
      dispatch(actionChangeSelectedPlatform(KEYS_PLATFORMS_SUPPORTED.curve));
    } else {
      dispatch(
        actionChangeSelectedPlatform(KEYS_PLATFORMS_SUPPORTED.incognito),
      );
    }
  };

export const actionHandleInjectEstDataForCurve =
  () => async (dispatch, getState) => {
    try {
      // await dispatch(actionSetFeeToken(PRV.id));
      const state = getState();
      let feeData = feetokenDataSelector(state);
      const isUseTokenFee = feeData?.curve?.isUseTokenFee;
      const inputAmount = inputAmountSelector(state);
      let sellInputToken, buyInputToken, inputToken, inputPDecimals;
      sellInputToken = inputAmount(formConfigs.selltoken);
      buyInputToken = inputAmount(formConfigs.buytoken);
      const { tokenId: selltoken } = sellInputToken;
      const { tokenId: buytoken } = buyInputToken;
      const { field, useMax } = feetokenDataSelector(state);
      const getCurveTokenParamReq = findTokenCurveByIdSelector(state);
      const tokenSellCurve = getCurveTokenParamReq(selltoken);
      const tokenBuyCurve = getCurveTokenParamReq(buytoken);
      if (tokenSellCurve == null || tokenBuyCurve == null) {
        throw 'This pair is not existed on curve';
      }

      if (isUseTokenFee) {
        await dispatch(actionSetFeeToken(selltoken));
      } else {
        await dispatch(actionSetFeeToken(PRV.id));
      }

      switch (field) {
        case formConfigs.selltoken: {
          inputPDecimals = tokenBuyCurve.pDecimals;
          inputToken = formConfigs.buytoken;
          break;
        }
        case formConfigs.buytoken: {
          inputPDecimals = tokenSellCurve.pDecimals;
          inputToken = formConfigs.selltoken;
          break;
        }
        default:
          break;
      }
      const {
        maxGet,
        minFeePRVFixed,
        availableFixedSellAmountPRV,
        minFeeTokenFixed,
      } = feetokenDataSelector(state);
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
          change(
            formConfigs.formName,
            inputToken,
            maxGet ? maxGet.toString() : '',
          ),
        );

        dispatch(
          change(
            formConfigs.formName,
            formConfigs.feetoken,
            isUseTokenFee ? minFeeTokenFixed : minFeePRVFixed,
          ),
        );
      });
    } catch (error) {
      throw error;
    }
  };

export const actionHandleInjectEstDataForUni =
  (platformId) => async (dispatch, getState) => {
    try {
      // await dispatch(actionSetFeeToken(PRV.id));
      const state = getState();
      let feeData = feetokenDataSelector(state);
      let isUseTokenFee;
      if (platformId === KEYS_PLATFORMS_SUPPORTED.uni) {
        isUseTokenFee = feeData?.uni?.isUseTokenFee;
      } else if (platformId === KEYS_PLATFORMS_SUPPORTED.uniEther) {
        isUseTokenFee = feeData?.uniEther?.isUseTokenFee;
      }

      const inputAmount = inputAmountSelector(state);
      let sellInputToken, buyInputToken, inputToken, inputPDecimals;
      sellInputToken = inputAmount(formConfigs.selltoken);
      buyInputToken = inputAmount(formConfigs.buytoken);
      const { tokenId: selltoken } = sellInputToken;
      const { tokenId: buytoken } = buyInputToken;
      const { field, useMax } = feeData;
      const getUniTokenParamReq = findTokenUniByIdSelector(state);
      const tokenSellUni = getUniTokenParamReq(selltoken);
      const tokenBuyUni = getUniTokenParamReq(buytoken);

      if (tokenSellUni == null || tokenBuyUni == null) {
        throw 'This pair is not existed on uni';
      }
      if (isUseTokenFee) {
        await dispatch(actionSetFeeToken(selltoken));
      } else {
        await dispatch(actionSetFeeToken(PRV.id));
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
      const {
        maxGet,
        minFeePRVFixed,
        availableFixedSellAmountPRV,
        minFeeTokenFixed,
      } = feetokenDataSelector(state);
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
          change(
            formConfigs.formName,
            inputToken,
            maxGet ? maxGet.toString() : '',
          ),
        );
        dispatch(
          change(
            formConfigs.formName,
            formConfigs.feetoken,
            isUseTokenFee ? minFeeTokenFixed : minFeePRVFixed,
          ),
        );
      });
    } catch (error) {
      throw error;
    }
  };

export const actionHandleInjectEstDataForPancake =
  () => async (dispatch, getState) => {
    try {
      const state = getState();
      let feeData = feetokenDataSelector(state);
      const isUseTokenFee = feeData?.pancake?.isUseTokenFee;
      const inputAmount = inputAmountSelector(state);
      let sellInputToken, buyInputToken, inputToken, inputPDecimals;
      sellInputToken = inputAmount(formConfigs.selltoken);
      buyInputToken = inputAmount(formConfigs.buytoken);
      const { tokenId: selltoken } = sellInputToken;
      const { tokenId: buytoken } = buyInputToken;
      if (isUseTokenFee) {
        await dispatch(actionSetFeeToken(selltoken));
      } else {
        await dispatch(actionSetFeeToken(PRV.id));
      }
      const { field, useMax } = feeData;
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
      const {
        maxGet,
        minFeePRVFixed,
        availableFixedSellAmountPRV,
        minFeeTokenFixed,
      } = feetokenDataSelector(state);
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
          change(
            formConfigs.formName,
            inputToken,
            maxGet ? maxGet.toString() : '',
          ),
        );
        dispatch(
          change(
            formConfigs.formName,
            formConfigs.feetoken,
            isUseTokenFee ? minFeeTokenFixed : minFeePRVFixed,
          ),
        );
      });
    } catch (error) {
      throw error;
    }
  };

export const actionHandleInjectEstDataForSpooky =
  () => async (dispatch, getState) => {
    try {
      const state = getState();
      let feeData = feetokenDataSelector(state);
      const isUseTokenFee = feeData?.spooky?.isUseTokenFee;
      const inputAmount = inputAmountSelector(state);
      let sellInputToken, buyInputToken, inputToken, inputPDecimals;
      sellInputToken = inputAmount(formConfigs.selltoken);
      buyInputToken = inputAmount(formConfigs.buytoken);
      const { tokenId: selltoken } = sellInputToken;
      const { tokenId: buytoken } = buyInputToken;
      if (isUseTokenFee) {
        await dispatch(actionSetFeeToken(selltoken));
      } else {
        await dispatch(actionSetFeeToken(PRV.id));
      }
      const { field, useMax } = feeData;
      const getSpookyTokenParamReq = findTokenSpookyByIdSelector(state);
      const tokenSellSpooky = getSpookyTokenParamReq(selltoken);
      const tokenBuySpooky = getSpookyTokenParamReq(buytoken);
      if (tokenSellSpooky == null || tokenBuySpooky == null) {
        throw 'This pair is not existed  on spooky';
      }
      switch (field) {
        case formConfigs.selltoken: {
          inputPDecimals = tokenBuySpooky.pDecimals;
          inputToken = formConfigs.buytoken;
          break;
        }
        case formConfigs.buytoken: {
          inputPDecimals = tokenSellSpooky.pDecimals;
          inputToken = formConfigs.selltoken;
          break;
        }
        default:
          break;
      }
      const {
        maxGet,
        minFeePRVFixed,
        availableFixedSellAmountPRV,
        minFeeTokenFixed,
      } = feetokenDataSelector(state);

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
          change(
            formConfigs.formName,
            inputToken,
            maxGet ? maxGet.toString() : '',
          ),
        );
        dispatch(
          change(
            formConfigs.formName,
            formConfigs.feetoken,
            isUseTokenFee ? minFeeTokenFixed : minFeePRVFixed,
          ),
        );
      });
    } catch (error) {
      throw error;
    }
  };

export const actionHandleInjectEstDataForJoe =
  () => async (dispatch, getState) => {
    try {
      const state = getState();
      let feeData = feetokenDataSelector(state);
      const isUseTokenFee = feeData?.joe?.isUseTokenFee;
      const inputAmount = inputAmountSelector(state);
      let sellInputToken, buyInputToken, inputToken, inputPDecimals;
      sellInputToken = inputAmount(formConfigs.selltoken);
      buyInputToken = inputAmount(formConfigs.buytoken);
      const { tokenId: selltoken } = sellInputToken;
      const { tokenId: buytoken } = buyInputToken;
      if (isUseTokenFee) {
        await dispatch(actionSetFeeToken(selltoken));
      } else {
        await dispatch(actionSetFeeToken(PRV.id));
      }
      const { field, useMax } = feeData;
      const getJoeTokenParamReq = findTokenJoeByIdSelector(state);
      const tokenSellJoe = getJoeTokenParamReq(selltoken);
      const tokenBuyJoe = getJoeTokenParamReq(buytoken);
      if (tokenSellJoe == null || tokenBuyJoe == null) {
        throw 'This pair is not existed  on joe';
      }
      switch (field) {
        case formConfigs.selltoken: {
          inputPDecimals = tokenBuyJoe.pDecimals;
          inputToken = formConfigs.buytoken;
          break;
        }
        case formConfigs.buytoken: {
          inputPDecimals = tokenSellJoe.pDecimals;
          inputToken = formConfigs.selltoken;
          break;
        }
        default:
          break;
      }
      const {
        maxGet,
        minFeePRVFixed,
        availableFixedSellAmountPRV,
        minFeeTokenFixed,
      } = feetokenDataSelector(state);

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
          change(
            formConfigs.formName,
            inputToken,
            maxGet ? maxGet.toString() : '',
          ),
        );
        dispatch(
          change(
            formConfigs.formName,
            formConfigs.feetoken,
            isUseTokenFee ? minFeeTokenFixed : minFeePRVFixed,
          ),
        );
      });
    } catch (error) {
      throw error;
    }
  };

export const actionHandleInjectEstDataForTrisolaris =
  () => async (dispatch, getState) => {
    try {
      const state = getState();
      let feeData = feetokenDataSelector(state);
      const isUseTokenFee = feeData?.trisolaris?.isUseTokenFee;
      const inputAmount = inputAmountSelector(state);
      let sellInputToken, buyInputToken, inputToken, inputPDecimals;
      sellInputToken = inputAmount(formConfigs.selltoken);
      buyInputToken = inputAmount(formConfigs.buytoken);
      const { tokenId: selltoken } = sellInputToken;
      const { tokenId: buytoken } = buyInputToken;
      if (isUseTokenFee) {
        await dispatch(actionSetFeeToken(selltoken));
      } else {
        await dispatch(actionSetFeeToken(PRV.id));
      }
      const { field, useMax } = feeData;
      const getTrisolarisTokenParamReq = findTokenTrisolarisByIdSelector(state);
      const tokenSellTrisolaris = getTrisolarisTokenParamReq(selltoken);
      const tokenBuyTrisolaris = getTrisolarisTokenParamReq(buytoken);
      if (tokenSellTrisolaris == null || tokenBuyTrisolaris == null) {
        throw 'This pair is not existed  on Trisolaris';
      }
      switch (field) {
        case formConfigs.selltoken: {
          inputPDecimals = tokenBuyTrisolaris.pDecimals;
          inputToken = formConfigs.buytoken;
          break;
        }
        case formConfigs.buytoken: {
          inputPDecimals = tokenSellTrisolaris.pDecimals;
          inputToken = formConfigs.selltoken;
          break;
        }
        default:
          break;
      }
      const {
        maxGet,
        minFeePRVFixed,
        availableFixedSellAmountPRV,
        minFeeTokenFixed,
      } = feetokenDataSelector(state);

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
          change(
            formConfigs.formName,
            inputToken,
            maxGet ? maxGet.toString() : '',
          ),
        );
        dispatch(
          change(
            formConfigs.formName,
            formConfigs.feetoken,
            isUseTokenFee ? minFeeTokenFixed : minFeePRVFixed,
          ),
        );
      });
    } catch (error) {
      throw error;
    }
  };

export const actionHandleInjectEstDataForInterswap =
    () => async (dispatch, getState) => {
      try {
        const state = getState();
        let feeData = feetokenDataSelector(state);
        const isUseTokenFee = feeData?.interswap?.isUseTokenFee;
        const inputAmount = inputAmountSelector(state);
        let sellInputToken, buyInputToken, inputToken, inputPDecimals;
        sellInputToken = inputAmount(formConfigs.selltoken);
        buyInputToken = inputAmount(formConfigs.buytoken);
        const { tokenId: selltoken } = sellInputToken;
        const { tokenId: buytoken } = buyInputToken;
        if (isUseTokenFee) {
          await dispatch(actionSetFeeToken(selltoken));
        } else {
          await dispatch(actionSetFeeToken(PRV.id));
        }
        const { field, useMax } = feeData;
        const getInterSwapTokenParamReq = findTokenInterSwapByIdSelector(state);
        const tokenSellInterSwap = getInterSwapTokenParamReq(selltoken);
        const tokenBuyInterSwap = getInterSwapTokenParamReq(buytoken);

        if (tokenSellInterSwap == null || tokenBuyInterSwap == null) {
          throw 'This pair is not existed  on Interswap';
        }
        switch (field) {
          case formConfigs.selltoken: {
            inputPDecimals = tokenBuyInterSwap.pDecimals;
            inputToken = formConfigs.buytoken;
            break;
          }
          case formConfigs.buytoken: {
            inputPDecimals = tokenSellInterSwap.pDecimals;
            inputToken = formConfigs.selltoken;
            break;
          }
          default:
            break;
        }
        const {
          maxGet,
          minFeePRVFixed,
          availableFixedSellAmountPRV,
          minFeeTokenFixed,
        } = feetokenDataSelector(state);

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
              change(
                  formConfigs.formName,
                  inputToken,
                  maxGet ? maxGet.toString() : '',
              ),
          );
          dispatch(
              change(
                  formConfigs.formName,
                  formConfigs.feetoken,
                  isUseTokenFee ? minFeeTokenFixed : minFeePRVFixed,
              ),
          );
        });
      } catch (error) {
        throw error;
      }
    };

export const actionEstimateTrade =
  ({ field = formConfigs.selltoken, useMax = false } = {}) =>
  async (dispatch, getState) => {
    let state = getState();

    const inputAmount = inputAmountSelector(state);
    const estimateCount = getEsimateCountSelector(state);
    const formErrors = swapFormErrorSelector(state);
    const { networkfee } = swapInfoSelector(state);

    let feeData = feetokenDataSelector(state);
    const prvData: SelectedPrivacy = getPrivacyDataByTokenID(state)(PRV.id);
    const account = defaultAccountSelector(state);

    const shardID = parseShard(account?.PublicKeyBytes);
    let sellInputToken, buyInputToken, inputToken, inputPDecimals;
    sellInputToken = inputAmount(formConfigs.selltoken);
    buyInputToken = inputAmount(formConfigs.buytoken);

    const defaultExchange = defaultExchangeSelector(state);

    if (
      formErrors &&
      formErrors[formConfigs.selltoken] === 'Must be a number'
    ) {
      return;
    }
    if (isEmpty(sellInputToken) || isEmpty(buyInputToken)) {
      return;
    }

    try {
      const params = { field, useMax };
      // Show loading estimate trade and reset fee data
      dispatch(actionFetching(true));
      dispatch(actionEstimateTradeError(null));

      const {
        tokenId: sellTokenId,
        originalAmount: sellOriginalAmount,
        pDecimals: sellPDecimals,
        availableOriginalAmount: availableSellOriginalAmount,
        amount: sellAmountEx,
      } = sellInputToken;

      const { tokenId: buyTokenId, symbol: buyInputSymbol } = buyInputToken;

      let maxAmount = availableSellOriginalAmount;

      if (useMax) {
        const { maxAmount: _maxAmount } = await dispatch(actionGetMaxAmount());
        maxAmount = format.amountFull(_maxAmount, sellPDecimals, false);
      }

      // let sellAmount = useMax ? maxAmount : sellOriginalAmount;
      let sellAmount = useMax ? maxAmount : sellAmountEx;
      let sellAmountStr;
      if (typeof sellAmount === 'string') {
        sellAmountStr = replaceDecimalsWithFormatPoint(String(sellAmount));
      }

      if (typeof sellAmount === 'number') {
        sellAmountStr = replaceDecimalsWithFormatPoint(
          new BigNumber(sellAmount).toString(),
        );
      }

      // console.log('sellAmountStr ', sellAmountStr);
      const slippagetolerance = slippagetoleranceSelector(state);

      await dispatch(actionChangeEstimateData({ field, useMax }));

      let network = getNetworkByExchange(defaultExchange);
      let estimateRawData;
      try {
        estimateRawData = await SwapService.getEstimateTradingFee({
          amount: sellAmountStr,
          fromToken: sellTokenId,
          toToken: buyTokenId,
          slippage: slippagetolerance.toString(),
          network: network,
          shardID: `${shardID}`
        });
      } catch (error) {
        // console.log('=> getEstimateTradingFee! error ', {
        //   error,
        // });
        await dispatch(
          actionEstimateTradeError(
            error.message || error || 'No tradeable network found',
          ),
        );
        return;
      } finally {
        if (!estimateRawData) {
          // eslint-disable-next-line no-unsafe-finally
          return;
        }
      }

      //NEW FLOW, combine all esimate fee API in one with new Back-End (from Lam)

      const { bestRateExchange, exchangeSupports } = await extractEstimateData(
        estimateRawData,
        sellInputToken.tokenData,
        defaultExchange,
      );
      // console.log('buyInputToken ', buyInputToken);
      // console.log('payload ', payload);

      if (useMax && estimateCount < ESTIMATE_COUNT_MAX) {
        checkReEstimate(
          dispatch,
          bestRateExchange,
          feeData,
          sellInputToken,
          buyInputToken,
          prvData,
          networkfee,
        );
        return;
      }
      let job = [];
      exchangeSupports.map(async (exchange) => {
        const {
          amountOut,
          feeAddress,
          fees,
          routes,
          impactAmount,
          incTokenID,
          platformNameSupported,
          amountOutPreSlippage,
          rate,
          rateStr,
          amountOutStr,
          interSwapData
        } = exchange;
        const [isUseTokenFee, originalTradeFee] = isUseTokenFeeParser(fees);
        const platformData = {
          feePrv: {
            fee: isUseTokenFee ? 0 : originalTradeFee,
            isSignificant: false,
            maxGet: format.numberWithNoGroupSeparator(amountOutPreSlippage, 0),
            route: routes,
            sellAmount: sellAmountStr,
            buyAmount: amountOut,
            impactAmount: format.amount(impactAmount, 0),
            tokenRoute: interSwapData?.path || routes,
            rateValue: format.amount(rateStr, 0),
            interSwapData
          },
          feeToken: {
            sellAmount: sellAmountStr,
            buyAmount: amountOut,
            fee: isUseTokenFee ? originalTradeFee : 0,
            isSignificant: false,
            maxGet: format.numberWithNoGroupSeparator(amountOutPreSlippage, 0),
            route: routes,
            impactAmount: format.amount(impactAmount, 0),
            tokenRoute: interSwapData?.path || routes,
            rateValue: format.amount(rateStr, 0),
            interSwapData
          },
          rateValue: format.amountVer2(rateStr, 0),
          tradeID: '',
          feeAddress,
          signAddress: '',
          unifiedTokenId: sellTokenId,
          tokenId: incTokenID,
          isUseTokenFee,
          error: null,
          minimumReceived: amountOutStr
            ? `${format.amountVer2(amountOutStr, 0)} ${buyInputSymbol}`
            : undefined,
        };

        // console.log('------------------------------');
        // console.log('platformData ', platformData);
        // console.log('platformNameSupported ', platformNameSupported);
        // console.log('exchange ', exchange);

        switch (platformNameSupported) {
          case 'pancake':
            {
              job.push(
                dispatch(
                  actionChangeEstimateData({
                    [KEYS_PLATFORMS_SUPPORTED.pancake]: platformData,
                  }),
                ),
              );
            }
            break;
          case 'uni':
            {
              job.push(
                dispatch(
                  actionChangeEstimateData({
                    [KEYS_PLATFORMS_SUPPORTED.uni]: platformData,
                  }),
                ),
              );
            }
            break;

          case 'uniEther':
            {
              job.push(
                dispatch(
                  actionChangeEstimateData({
                    [KEYS_PLATFORMS_SUPPORTED.uniEther]: platformData,
                  }),
                ),
              );
            }
            break;
          case 'curve':
            {
              await dispatch(
                actionChangeEstimateData({
                  [KEYS_PLATFORMS_SUPPORTED.curve]: platformData,
                }),
              );
            }
            break;
          case 'spooky':
            {
              job.push(
                dispatch(
                  actionChangeEstimateData({
                    [KEYS_PLATFORMS_SUPPORTED.spooky]: platformData,
                  }),
                ),
              );
            }
            break;
          case 'joe':
            {
              job.push(
                dispatch(
                  actionChangeEstimateData({
                    [KEYS_PLATFORMS_SUPPORTED.joe]: platformData,
                  }),
                ),
              );
            }
            break;
          case 'trisolaris':
            {
              job.push(
                dispatch(
                  actionChangeEstimateData({
                    [KEYS_PLATFORMS_SUPPORTED.trisolaris]: platformData,
                  }),
                ),
              );
            }
            break;
          case 'interswap':
          {
            job.push(
                dispatch(
                    actionChangeEstimateData({
                      [KEYS_PLATFORMS_SUPPORTED.interswap]: platformData,
                    }),
                ),
            );
          }
            break;
          default:
            {
              job.push(
                dispatch(
                  actionChangeEstimateData({
                    [KEYS_PLATFORMS_SUPPORTED.incognito]: platformData,
                  }),
                ),
              );
            }
            break;
        }
      });

      await Promise.all(job);

      console.log('Estimate process DONE');

      await dispatch(actionSetBestRateExchange(bestRateExchange));
      await dispatch(actionSetExchangeSupportList(exchangeSupports));
      await dispatch(actionEstiamteCount(1));
      await dispatch(
        actionSwitchPlatform(bestRateExchange.platformNameSupported),
      );

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
      dispatch(actionFetched({ isFetched: true }));
    }
  };

const checkReEstimate = async (
  dispatch,
  bestRateExchange: ExchangeData,
  feeData,
  sellInputToken,
  buyInputToken,
  prvData,
  networkfee = 0,
) => {
  // console.log('checkReEstimate ====>>> ');
  // console.log({
  //   bestRateExchange,
  //   feeData,
  //   sellInputToken,
  //   buyInputToken,
  //   prvData,
  // });
  try {
    const sellAmount =
      sellInputToken?.originalAmount || sellInputToken?.availableOriginalAmount;
    const sellTokenIsPRV = sellInputToken?.tokenId === PRV.id;
    const payFeeByPRV = bestRateExchange?.fees[0].tokenid === PRV.id;
    const feeAmount = bestRateExchange?.fees[0].amount;
    const prvBalanceAmount = prvData?.amount || 0;

    const prvBalanceObj = new BigNumber(prvBalanceAmount);

    if (sellTokenIsPRV) {
      if (payFeeByPRV) {
        console.log('RE ESTIMATE CASE 1 ====>>> ');
        // CASE 1:
        // SellToken: PRV
        // Fee: PRV
        const totalFee = feeAmount + networkfee;
        // console.log('feeAmount ', feeAmount);
        // console.log('networkfee ', networkfee);
        // console.log('totalFee ', totalFee);

        const sellAmountAndFeePRVTotal = new BigNumber(sellAmount).plus(
          totalFee,
        );
        if (sellAmountAndFeePRVTotal.gt(prvBalanceObj)) {
          const newPRVInputAmountNumber = prvBalanceObj.minus(totalFee);

          if (newPRVInputAmountNumber.lt(0)) {
            //Option 1: don't est
            // await dispatch(actionEstiamteCount());
            // return;

            //Option 2:
            //Still est with old value

            await dispatch(actionEstiamteCount());
            dispatch(actionEstimateTrade());
            return;
          }

          const newPRVInputAmount = convert.toHumanAmount(
            newPRVInputAmountNumber,
            prvData.pDecimals || prvData.decimals,
          );
          const newPRVInputAmountToFixed = format.toFixed(
            newPRVInputAmount,
            prvData.pDecimals || prvData.decimals,
          );
          await dispatch(actionEstiamteCount());
          await dispatch(
            change(
              formConfigs.formName,
              formConfigs.selltoken,
              newPRVInputAmountToFixed,
            ),
          );
          dispatch(actionEstimateTrade());
        }
      } else {
        // console.log('RE ESTIMATE CASE 2 ====>>> ');
        // CASE 2:
        // SellToken: PRV
        // Fee: Token
      }
    } else {
      if (!payFeeByPRV) {
        console.log('RE ESTIMATE CASE 3 ====>>> ');
        // CASE 3:
        // SellToken: A Token
        // Fee: A Token

        // console.log('RE ESTIMATE CASE 3 sellAmount ====>>> ', sellAmount);
        // console.log('RE ESTIMATE CASE 3 feeAmount ====>>> ', feeAmount);

        let newInputAmount;
        if (new BigNumber(sellAmount).minus(feeAmount).lt(0)) {
          // console.log('newInputAmount = FeeAmount ');

          newInputAmount = convert.toHumanAmount(
            new BigNumber(feeAmount),
            sellInputToken.pDecimals,
          );
        } else {
          // console.log('newInputAmount = sellAmount -  feeAmount');

          newInputAmount = convert.toHumanAmount(
            new BigNumber(sellAmount).minus(feeAmount),
            sellInputToken.pDecimals,
          );
        }
        const newInputAmountToFixed = format.toFixed(
          newInputAmount,
          sellInputToken.pDecimals,
        );
        await dispatch(actionEstiamteCount());
        await dispatch(
          change(
            formConfigs.formName,
            formConfigs.selltoken,
            newInputAmountToFixed,
          ),
        );
        dispatch(actionEstimateTrade());
      } else {
        // console.log('RE ESTIMATE CASE 4 ====>>> ');
        // CASE 4:
        // SellToken: A Token
        // Fee: PRV Token
      }
    }
  } catch (error) {
    console.log('ERROR: ', error);
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
  return await dispatch(actionFetchPairs1(refresh));
};

export const actionFetchPairs1 = (refresh) => async (dispatch, getState) => {
  let pairs = [];
  let pDEXPairs = [];
  let pancakeTokens = [];
  let uniTokens = [];
  let curveTokens = [];
  let spookyTokens = [];
  let joeTokens = [];
  let trisolarisTokens = [];
  let interswapTokens = [];

  const state = getState();

  try {
    const { pairs: listPairs } = swapSelector(state);

    const privacyDataFilterList = getPrivacyDataFilterSelector(state);
    if (!refresh && listPairs.length > 0) {
      return listPairs;
    }

    const defaultExchange = defaultExchangeSelector(state);
    const isPrivacyApp = isPrivacyAppSelector(state);

    privacyDataFilterList.map((token: SelectedPrivacy) => {
      pairs.push(token.tokenId);

      if (isSupportByPlatform(PANCAKE_SUPPORT_NETWORK, token)) {
        pancakeTokens.push(token);
      }
      if (isSupportByPlatform(UNISWAP_SUPPORT_NETWORK, token)) {
        uniTokens.push(token);
      }
      if (isSupportByPlatform(CURVE_SUPPORT_NETWORK, token)) {
        curveTokens.push(token);
      }
      if (isSupportByPlatform(SPOOKY_SUPPORT_NETWORK, token)) {
        spookyTokens.push(token);
      }
      if (isSupportByPlatform(JOE_SUPPORT_NETWORK, token)) {
        joeTokens.push(token);
      }
      if (isSupportByPlatform(TRISOLARIS_SUPPORT_NETWORK, token)) {
        trisolarisTokens.push(token);
      }
      // interswap get all tokens
      interswapTokens.push(token);
    });

    if (isPrivacyApp) {
      switch (defaultExchange) {
        case KEYS_PLATFORMS_SUPPORTED.pancake:
          pairs = pancakeTokens.map((token) => token.tokenId);
          break;

        case KEYS_PLATFORMS_SUPPORTED.uni:
        case KEYS_PLATFORMS_SUPPORTED.uniEther:
          pairs = uniTokens.map((token) => token.tokenId);
          break;

        case KEYS_PLATFORMS_SUPPORTED.curve:
          pairs = curveTokens.map((token) => token.tokenId);
          break;

        case KEYS_PLATFORMS_SUPPORTED.spooky:
          pairs = spookyTokens.map((token) => token.tokenId);
          break;

        case KEYS_PLATFORMS_SUPPORTED.joe:
          pairs = joeTokens.map((token) => token.tokenId);
          break;

        case KEYS_PLATFORMS_SUPPORTED.trisolaris:
          pairs = trisolarisTokens.map((token) => token.tokenId);
          break;
        case KEYS_PLATFORMS_SUPPORTED.interswap:
          pairs = interswapTokens.map((token) => token.tokenId);
          break;
        default:
          break;
      }
    }
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }

  dispatch(
    actionFetchedPairs({
      pairs,
      pDEXPairs,
      pancakeTokens,
      uniTokens,
      curveTokens,
      spookyTokens,
      joeTokens,
      trisolarisTokens,
      interswapTokens,
    }),
  );
  return pairs;
};

const isSupportByPlatform = (platFormSupportNetwork: number[], token) => {
  let isSupport = platFormSupportNetwork.includes(token.currencyType);
  let isSupportUnified = platFormSupportNetwork.some((currencyType) =>
    token.listUnifiedTokenCurrencyType.includes(currencyType),
  );
  return isSupport || isSupportUnified;
};

export const actionFreeHistoryOrders = () => ({
  type: ACTION_FREE_HISTORY_ORDERS,
});

export const actionInitSwapForm =
  ({ refresh = true, defaultPair = {}, shouldFetchHistory = false } = {}) =>
  async (dispatch, getState) => {
    try {
      let state = getState();
      const feetoken = feeSelectedSelector(state);
      const defaultExchange = defaultExchangeSelector(state);
      const { slippage: defautSlippage, resetSlippage1 } = swapSelector(state);
      const isUsePRVToPayFee = feetoken === PRV.id;
      let pair = defaultPair || defaultPairSelector(state);
      batch(() => {
        dispatch(actionInitingSwapForm(true));
        dispatch(reset(formConfigs.formName));
        dispatch(actionResetData());
        dispatch(change(formConfigs.formName, formConfigs.feetoken, ''));
        dispatch(actionSetSellTokenFetched(pair?.selltoken));
        dispatch(actionSetBuyTokenFetched(pair?.buytoken));
        dispatch(actionEstimateTradeError(undefined)); //Clear Estimate Trade Error
        dispatch(actionResetExchangeSupported()); //Reset Exchange Supported
        if (refresh && shouldFetchHistory) {
          dispatch(actionFreeHistoryOrders());
        }
      });
      const pairs = await dispatch(actionFetchPairs(refresh));
      const isDefaultPairExisted =
        difference([pair?.selltoken, pair?.buytoken], pairs).length === 0;
      if (!pair?.selltoken || !pair?.buytoken || !isDefaultPairExisted) {
        state = getState();
        const listPairsSellToken = listPairsIDVerifiedSelector(state);
        const listPairsBuyToken = listPairsIDBuyTokenVerifiedSelector(state);
        pair = {
          selltoken: listPairsSellToken[0],
          buytoken: listPairsBuyToken[1],
        };
        batch(() => {
          dispatch(actionSetSellTokenFetched(pair.selltoken));
          dispatch(actionSetBuyTokenFetched(pair.buytoken));
        });
      }
      const { selltoken } = pair;
      state = getState();
      let _defautSlippage = defautSlippage;
      if (!resetSlippage1) {
        _defautSlippage = format.amountFull('0.5', 0);
        dispatch(actionResetSlippage());
      }
      batch(() => {
        dispatch(
          change(
            formConfigs.formName,
            formConfigs.slippagetolerance,
            _defautSlippage,
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
          const currentScreen = currentScreenSelector(state);
          if (currentScreen !== routeNames.Trade) {
            dispatch(actionFetchRewardHistories());
          }
        }
      });
      const currentScreen = currentScreenSelector(state);
      if (currentScreen === routeNames.Trade) {
        dispatch(setDefaultTradingPlatformOnPdexV3());
      } else {
        dispatch(actionChangeSelectedPlatform(defaultExchange));
      }
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
  const state = getState();
  const currentScreen = currentScreenSelector(state);
  try {
    const { disabledBtnSwap } = swapInfoSelector(state);
    if (disabledBtnSwap) {
      return;
    }
    setTimeout(() => {
      let analytic = '';
      let params = {
        sell_token: tokenIDToSell,
        buy_token: tokenIDToBuy,
        sell_amount: String(sellAmount),
      };
      switch (platform.id) {
        case KEYS_PLATFORMS_SUPPORTED.incognito:
          analytic = ANALYTICS.ANALYTIC_DATA_TYPE.TRADE;
          break;
        case KEYS_PLATFORMS_SUPPORTED.pancake:
          analytic = ANALYTICS.ANALYTIC_DATA_TYPE.TRADE_PANCAKE;
          break;
        case KEYS_PLATFORMS_SUPPORTED.uni:
        case KEYS_PLATFORMS_SUPPORTED.uniEther:
          analytic = ANALYTICS.ANALYTIC_DATA_TYPE.TRADE_UNISWAP;
          break;
        case KEYS_PLATFORMS_SUPPORTED.curve:
          analytic = ANALYTICS.ANALYTIC_DATA_TYPE.TRADE_CURVE;
          break;
        case KEYS_PLATFORMS_SUPPORTED.spooky:
          analytic = ANALYTICS.ANALYTIC_DATA_TYPE.TRADE_SPOOKY;
          break;
        case KEYS_PLATFORMS_SUPPORTED.joe:
          analytic = ANALYTICS.ANALYTIC_DATA_TYPE.TRADE_JOE;
          break;
        case KEYS_PLATFORMS_SUPPORTED.trisolaris:
          analytic = ANALYTICS.ANALYTIC_DATA_TYPE.TRISOLARIS;
          break;
        case KEYS_PLATFORMS_SUPPORTED.interswap:
          analytic = ANALYTICS.ANALYTIC_DATA_TYPE.INTER_SWAP;
          break;
      }
      dispatch(requestUpdateMetrics(analytic, params));
    }, 300);
    await dispatch(actionFetchingSwap(true));
    const account = defaultAccountWalletSelector(state);
    const sellInputAmount = inputAmountSelector(state)(formConfigs.selltoken);
    const buyInputAmount = inputAmountSelector(state)(formConfigs.buytoken);
    const feetokenData = feetokenDataSelector(state);
    if (!sellInputAmount || !buyInputAmount || !feetokenData) {
      return;
    }
    const {
      tokenId: tokenIDToSell,
      originalAmount: sellAmount,
      amountText: sellAmountText,
    } = sellInputAmount;
    const {
      tokenId: tokenIDToBuy,
      tokenData: tokenBuyData,
      amountText: buyAmountText,
    } = buyInputAmount;
    const { origininalFeeAmount: tradingFee, feetoken } = feetokenData;
    const pDexV3Inst = await getPDexV3Instance({ account });
    const platform = platformSelectedSelector(state);
    const exchangeData: ExchangeData = getExchangeSupportByPlatformId(state)(
      platform.id,
    );
    console.log('PlatformId: => ' + platform.id);
    const _sellAmountText = convert
      .toNumber(sellAmountText || 0, true)
      .toString();
    const _buyAmountText = convert
      .toNumber(buyAmountText || 0, true)
      .toString();

    switch (platform.id) {
      case KEYS_PLATFORMS_SUPPORTED.interswap: {
        const interSwapData = exchangeData?.interSwapData;
        if (!interSwapData || !interSwapData.midToken) throw 'Can not create transaction empty data';
        const slippage = slippagetoleranceSelector(state);
        const { midToken, midOTA, pAppNetwork, pAppName } = interSwapData;
        const payloadSubmitInterTx = {
          midOTA,
          sellTokenID: tokenIDToSell,
          buyTokenID: tokenIDToBuy,
          midToken: midToken,
          amountOutRaw: exchangeData?.amountOutRaw,
          slippage: `${slippage || 0}`,
          pAppNetwork,
          pAppName,
          inputAddress: '',
          feeAddressShardID: exchangeData?.feeAddressShardID
        };
        // create pdex tx
        if (interSwapData.fistBatchIsPDex) {
          const params: CreateTransactionPDexPayload = {
            transfer: { fee: ACCOUNT_CONSTANT.MAX_FEE_PER_TX, info: '' },
            extra: {
              tokenIDToSell,
              sellAmount: String(sellAmount),
              tokenIDToBuy: interSwapData.midToken,
              tradingFee,
              tradePath: exchangeData?.poolPairs || [''],
              feetoken,
              version: PrivacyVersion.ver2,
              minAcceptableAmount: `${new BigNumber(
                  interSwapData.pdexMinAcceptableAmount || 0,
              ).integerValue()}`,
              sellAmountText: _sellAmountText,
              buyAmountText: _buyAmountText,
              interSwapData: payloadSubmitInterTx
            },
          };
          tx = await TransactionHandler.createTransactionPDex({
            pDexV3Instance: pDexV3Inst || {},
            params,
          });
        } else {
          const midTokenData = getPrivacyDataByTokenID(state)(interSwapData?.midToken);
          const midChildToken = midTokenData?.isPUnifiedToken ?
              midTokenData.listUnifiedToken.find((token) =>
                  token.networkId === exchangeData.networkID
              ) :
              midTokenData;
          const createTransactionPAppsPayload: CreateTransactionPAppsPayload = {
            pDexV3Instance: pDexV3Inst || {},
            sellTokenID: tokenIDToSell || '',
            senderFeeAddressShardID: exchangeData.feeAddressShardID | 0,
            feeReceiverAddress: exchangeData.feeAddress || '',
            feeTokenID: exchangeData.fees[0]?.tokenid || '',
            feeAmount: exchangeData.fees[0]?.amount?.toString() || '',
            sellAmount: sellAmount.toString() || '',
            callContract: exchangeData.callContract || '',
            callData: exchangeData.callData || '',
            exchangeNetworkID: exchangeData.networkID || 0,
            sellChildTokenID: exchangeData.incTokenID || '',
            buyContractID: midChildToken?.contractId || '',
            buyTokenID: tokenIDToBuy,
            sellAmountText: _sellAmountText,
            buyAmountText: _buyAmountText,
            interSwapData: payloadSubmitInterTx
          };
          tx = await TransactionHandler.createTransactionPApps(
              createTransactionPAppsPayload,
          );
        }
        break;
      }
      case KEYS_PLATFORMS_SUPPORTED.incognito:
        {
          const params: CreateTransactionPDexPayload = {
            transfer: { fee: ACCOUNT_CONSTANT.MAX_FEE_PER_TX, info: '' },
            extra: {
              tokenIDToSell,
              sellAmount: String(sellAmount),
              tokenIDToBuy,
              tradingFee,
              tradePath: exchangeData?.poolPairs || [''],
              feetoken,
              version: PrivacyVersion.ver2,
              minAcceptableAmount: `${new BigNumber(
                exchangeData.amountOutRaw || 0,
              ).integerValue()}`,
              sellAmountText: _sellAmountText,
              buyAmountText: _buyAmountText,
            },
          };
          // tx = await pDexV3Inst.createAndSendSwapRequestTx(params);
          // if (!tx) {
          //   console.log('error');
          // }
          // console.log('sellInputAmount: => ', sellInputAmount);
          // console.log('buyInputAmount: => ', buyInputAmount);
          // console.log(
          //   '[pDex]: RepareData create TX: ',
          //   tokenBuyData,
          //   exchangeData,
          // );
          tx = await TransactionHandler.createTransactionPDex({
            pDexV3Instance: pDexV3Inst || {},
            params,
          });

          try {
            await SwapService.dexSwapMonitor({
              txhash: tx.hash,
              token_sell: sellInputAmount.tokenId,
              token_buy: buyInputAmount.tokenId,
              amount_in: sellInputAmount.amountText,
              amount_out: buyInputAmount.amountText,
            });
          } catch (error) {
            console.log('dexSwapMonitor error ', error);
          } finally {
            console.log('BY PASS dexSwapMonitor');
          }
        }
        break;
      case KEYS_PLATFORMS_SUPPORTED.pancake:
      case KEYS_PLATFORMS_SUPPORTED.uni:
      case KEYS_PLATFORMS_SUPPORTED.uniEther:
      case KEYS_PLATFORMS_SUPPORTED.curve:
      case KEYS_PLATFORMS_SUPPORTED.spooky:
      case KEYS_PLATFORMS_SUPPORTED.joe:
      case KEYS_PLATFORMS_SUPPORTED.trisolaris:
        {
          console.log(
            `[pApps - ${platform.id}]: Repair Data create TX: `,
            tokenBuyData,
            exchangeData,
          );

          const createTransactionPAppsPayload: CreateTransactionPAppsPayload = {
            pDexV3Instance: pDexV3Inst || {},
            sellTokenID: tokenIDToSell || '',
            senderFeeAddressShardID: exchangeData.feeAddressShardID | 0,
            feeReceiverAddress: exchangeData.feeAddress || '',
            feeTokenID: exchangeData.fees[0]?.tokenid || '',
            feeAmount: exchangeData.fees[0]?.amount?.toString() || '',
            sellAmount: sellAmount.toString() || '',
            callContract: exchangeData.callContract || '',
            callData: exchangeData.callData || '',
            exchangeNetworkID: exchangeData.networkID || 0,
            sellChildTokenID: exchangeData.incTokenID || '',
            buyContractID: !tokenBuyData.isPUnifiedToken
              ? tokenBuyData.contractId
              : tokenBuyData.listUnifiedToken.filter(
                  (token) => token.networkId === exchangeData.networkID,
                )[0]?.contractId || '',
            buyTokenID: tokenIDToBuy,
            sellAmountText: _sellAmountText,
            buyAmountText: _buyAmountText,
            // buyTokenID: !tokenBuyData.isPUnifiedToken
            //   ? tokenBuyData.tokenId
            //   : tokenBuyData.listUnifiedToken.filter(
            //       (token) => token.networkId === exchangeData.networkID,
            //     )[0]?.tokenId || '',
          };

          tx = await TransactionHandler.createTransactionPApps(
            createTransactionPAppsPayload,
          );
        }
        break;
      default:
        break;
    }
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    batch(() => {
      dispatch(actionFetchingSwap(false));
      dispatch(actionFetchHistory());
      // if (currentScreen !== routeNames.Trade) {
      //   dispatch(actionFetchRewardHistories());
      // }
      // Reset data after swap
      dispatch(actionResetData());
      dispatch(change(formConfigs.formName, formConfigs.feetoken, ''));
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
    // get trading platform incognito | pancake | uni | curve
    const defaultExchange = defaultExchangeSelector(state);
    // const isPrivacyApp = isPrivacyAppSelector(state);
    let callContracts = [];
    switch (defaultExchange) {
      case KEYS_PLATFORMS_SUPPORTED.incognito:
      case KEYS_PLATFORMS_SUPPORTED.interswap:
        callContracts = Object.values(CALL_CONTRACT).filter(
          (contract) => !!contract,
        );
        break;
      case KEYS_PLATFORMS_SUPPORTED.pancake:
        callContracts.push(CALL_CONTRACT.PANCAKE_BSC);
        break;
      case KEYS_PLATFORMS_SUPPORTED.uni:
        callContracts.push(CALL_CONTRACT.UNI_PLG);
        break;
      case KEYS_PLATFORMS_SUPPORTED.uniEther:
        callContracts.push(CALL_CONTRACT.UNI_ETH);
        break;
      case KEYS_PLATFORMS_SUPPORTED.spooky:
        callContracts.push(CALL_CONTRACT.SPOOKY_FTM);
        break;
      case KEYS_PLATFORMS_SUPPORTED.curve:
        callContracts.push(CALL_CONTRACT.CURVE_PLG);
        break;
      case KEYS_PLATFORMS_SUPPORTED.joe:
        callContracts.push(CALL_CONTRACT.JOE_AVAX);
        break;
      case KEYS_PLATFORMS_SUPPORTED.trisolaris:
        callContracts.push(CALL_CONTRACT.TRISOLARIS_AURORA);
        break;
      default:
        callContracts = [];
        break;
    }
    // if (!isPrivacyApp) {
    //   // Fetch history of all platform when current screen is pDexV3
    //   let swapHistory = [];
    //   let pancakeHistory = [];
    //   let uniHistory = [];
    //   let curveHistory = [];
    //   const tasks = [
    //     pDexV3.getSwapHistory({ version: PrivacyVersion.ver2 }),
    //     pDexV3.getSwapPancakeHistory(),
    //     pDexV3.getSwapUniHistoryFromApi(),
    //   ];
    //   if (CONSTANT_CONFIGS.isMainnet) {
    //     tasks.push(pDexV3.getSwapCurveHistoryFromApi());
    //     [swapHistory, pancakeHistory, uniHistory, curveHistory] =
    //       await Promise.all(tasks);
    //   } else {
    //     [swapHistory, pancakeHistory, uniHistory] = await Promise.all(tasks);
    //   }
    //   history = flatten([
    //     swapHistory,
    //     pancakeHistory,
    //     uniHistory,
    //     curveHistory,
    //   ]);
    // } else {
    //   switch (defaultExchange) {
    //     // Fetch PancakeSwap history when current screen is pPancakeSwap
    //     case KEYS_PLATFORMS_SUPPORTED.pancake: {
    //       history = await pDexV3.getSwapPancakeHistory();
    //       break;
    //     }
    //     // Fetch Uniswap history when current screen is pUniswap
    //     case KEYS_PLATFORMS_SUPPORTED.uni: {
    //       history = await pDexV3.getSwapUniHistoryFromApi();
    //       break;
    //     }
    //     // Fetch Curve history when current screen is pCurve
    //     case KEYS_PLATFORMS_SUPPORTED.curve: {
    //       history = await pDexV3.getSwapCurveHistoryFromApi();
    //       break;
    //     }
    //     default:
    //       break;
    //   }
    // }
    history = await pDexV3.getSwapHistoryStorage({ callContracts });
    history = orderBy(history, 'time', 'desc');
    await dispatch(actionFetchedOrdersHistory(history));
    return history;
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
    if (platform?.id === KEYS_PLATFORMS_SUPPORTED.pancake) {
      rewardHistoriesApiResponse = await pDexV3.getSwapPancakeRewardHistory({
        page: 0,
        limit: 1000,
      });
    }

    if (platform.id === KEYS_PLATFORMS_SUPPORTED.uni) {
      rewardHistoriesApiResponse = await pDexV3.getSwapUniRewardHistory({
        page: 0,
        limit: 1000,
      });
    }

    if (platform.id === KEYS_PLATFORMS_SUPPORTED.curve) {
      rewardHistoriesApiResponse = await pDexV3.getSwapCurveRewardHistory({
        page: 0,
        limit: 1000,
      });
    }
    console.log('rewardHistoriesApiResponse', rewardHistoriesApiResponse);
    dispatch(actionFetchedRewardHistories(rewardHistoriesApiResponse));
  } catch (error) {
    console.log('actionFetchHistory-error', error);
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
  if (!order?.requestBurnTxInc) {
    return;
  }
  try {
    await dispatch(actionFetchingOrderDetail(_order));
    const orders = (await dispatch(actionFetchHistory())) || [];
    _order = orders.find(
      ({ requestBurnTxInc }) => requestBurnTxInc === order?.requestBurnTxInc,
    );
  } catch (e) {
    console.log('error');
  } finally {
    if (_order) {
      await dispatch(actionFetchedOrderDetail(_order));
    }
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
      console.log('actionSwitchPlatform platformId ', platformId);

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
        case KEYS_PLATFORMS_SUPPORTED.uni: {
          await dispatch(actionHandleInjectEstDataForUni(platformId));
          break;
        }
        case KEYS_PLATFORMS_SUPPORTED.uniEther:
          await dispatch(actionHandleInjectEstDataForUni(platformId));
          break;
        case KEYS_PLATFORMS_SUPPORTED.curve:
          await dispatch(actionHandleInjectEstDataForCurve());
          break;
        case KEYS_PLATFORMS_SUPPORTED.spooky:
          await dispatch(actionHandleInjectEstDataForSpooky());
          break;
        case KEYS_PLATFORMS_SUPPORTED.joe:
          await dispatch(actionHandleInjectEstDataForJoe());
          break;
        case KEYS_PLATFORMS_SUPPORTED.trisolaris:
          await dispatch(actionHandleInjectEstDataForTrisolaris());
          break;
        case KEYS_PLATFORMS_SUPPORTED.interswap:
          await dispatch(actionHandleInjectEstDataForInterswap());
          break;
        default:
          break;
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
      throw error;
    }
  };

export const actionGetMaxAmount = () => async (dispatch, getState) => {
  const state = getState();
  let feeData = feetokenDataSelector(state);
  let isUseTokenFee = false;
  let platform = platformSelectedSelector(state);

  const inputAmount = inputAmountSelector(state);
  const sellInputToken = inputAmount(formConfigs.selltoken);
  if (platform.id === KEYS_PLATFORMS_SUPPORTED.pancake) {
    isUseTokenFee = feeData?.pancake?.isUseTokenFee;
  } else if (platform.id === KEYS_PLATFORMS_SUPPORTED.uni) {
    isUseTokenFee = feeData?.uni?.isUseTokenFee;
  } else if (platform.id === KEYS_PLATFORMS_SUPPORTED.uniEther) {
    isUseTokenFee = feeData?.uniEther?.isUseTokenFee;
  } else if (platform.id === KEYS_PLATFORMS_SUPPORTED.curve) {
    isUseTokenFee = feeData?.curve?.isUseTokenFee;
  } else if (platform.id === KEYS_PLATFORMS_SUPPORTED.spooky) {
    isUseTokenFee = feeData?.spooky?.isUseTokenFee;
  } else if (platform.id === KEYS_PLATFORMS_SUPPORTED.joe) {
    isUseTokenFee = feeData?.joe?.isUseTokenFee;
  } else if (platform.id === KEYS_PLATFORMS_SUPPORTED.trisolaris) {
    isUseTokenFee = feeData?.trisolaris?.isUseTokenFee;
  } else if (platform.id === KEYS_PLATFORMS_SUPPORTED.interswap) {
    isUseTokenFee = feeData?.interswap?.isUseTokenFee;
  }
  const availableOriginalAmount = sellInputToken?.availableOriginalAmount;
  if (!isUseTokenFee)
    return {
      maxAmount: availableOriginalAmount,
      availableAmountText: sellInputToken.availableAmountText,
      inputPDecimals: sellInputToken.pDecimals,
    };
  const fee = feeData?.minFeeOriginal;
  let maxAmount = availableOriginalAmount - fee;
  if (maxAmount < 0) {
    maxAmount = availableOriginalAmount;
  }

  return {
    maxAmount,
    availableAmountText: sellInputToken.availableAmountText,
    inputPDecimals: sellInputToken.pDecimals,
  };
};

export const actionSaveUnifiedAlertStateById = (payload) => ({
  type: ACTION_SAVE_UNIFIED_ALERT_STATE_BY_ID,
  payload,
});
