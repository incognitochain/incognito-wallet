import { createSelector } from 'reselect';
import isNaN from 'lodash/isNaN';
import { getPrivacyDataByTokenID as getPrivacyDataByTokenIDSelector , getPrivacyPRVInfo, validatePRVBalanceSelector } from '@src/redux/selectors/selectedPrivacy';
import format from '@src/utils/format';
import { formValueSelector, isValid, getFormSyncErrors } from 'redux-form';
import convert from '@src/utils/convert';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { PRV } from '@src/constants/common';
import { sharedSelector } from '@src/redux/selectors';
import memoize from 'lodash/memoize';
import { getExchangeRate2, getPoolSize } from '@screens/PDexV3';
import BigNumber from 'bignumber.js';
import {
  getCurrentPaymentAddressSelector,
  switchAccountSelector,
} from '@src/redux/selectors/account';
import { checkConvertSelector } from '@src/screens/ConvertToUnifiedToken/state/selectors';
import { minPRVNeededSelector } from '@src/screens/RefillPRV/RefillPRV.selector';

import { MESSAGES } from '@src/constants';
import {
  formConfigs,
  KEYS_PLATFORMS_SUPPORTED,
  PLATFORMS_SUPPORTED,
  getExchangeDataWithCallContract,
  ONE_DAY,
} from './Swap.constant';
import { getInputAmount, calMintAmountExpected } from './Swap.utils';

export const swapSelector = createSelector(
  (state) => state.pDexV3,
  ({ swap }) => swap,
);

export const getSlippageSelector = createSelector(
  swapSelector,
  ({ slippage }) => slippage,
);

export const getEsimateCountSelector = createSelector(
  swapSelector,
  ({ estimateCount }) => estimateCount,
);

export const exchangeSupportsListSelector = createSelector(
  swapSelector,
  ({ exchangeSupportsList }) => exchangeSupportsList,
);

export const slippagetoleranceSelector = createSelector(
  (state) => state,
  (state) => {
    const selector = formValueSelector(formConfigs.formName);
    let slippagetolerance = selector(state, formConfigs.slippagetolerance);
    slippagetolerance = convert.toNumber(slippagetolerance || 0, true);
    slippagetolerance = Number(slippagetolerance);
    if (isNaN(slippagetolerance)) {
      return 0;
    }
    return slippagetolerance;
  },
);

export const pancakePairsSelector = createSelector(
  swapSelector,
  ({ pancakeTokens }) => pancakeTokens,
);

export const uniPairsSelector = createSelector(
  swapSelector,
  ({ uniTokens }) => uniTokens,
);

export const curvePairsSelector = createSelector(
  swapSelector,
  ({ curveTokens }) => curveTokens || [],
);

export const spoonkyPairsSelector = createSelector(
  swapSelector,
  ({ spookyTokens }) => spookyTokens,
);

export const joePairsSelector = createSelector(
  swapSelector,
  ({ joeTokens }) => joeTokens,
);

export const trisolarisPairsSelector = createSelector(
  swapSelector,
  ({ trisolarisTokens }) => trisolarisTokens,
);

export const interswapPairsSelector = createSelector(
    swapSelector,
    ({ interswapTokens }) => interswapTokens,
);

export const findTokenPancakeByIdSelector = createSelector(
  pancakePairsSelector,
  (pancakeTokens) =>
    memoize((tokenID) =>
      pancakeTokens.find(
        (t) => t?.tokenID === tokenID || t?.tokenId === tokenID,
      ),
    ),
);

export const findTokenUniByIdSelector = createSelector(
  uniPairsSelector,
  (uniTokens) =>
    memoize((tokenID) =>
      uniTokens.find((t) => t?.tokenID === tokenID || t?.tokenId === tokenID),
    ),
);

export const findTokenCurveByIdSelector = createSelector(
  curvePairsSelector,
  (curveTokens) =>
    memoize((tokenID) =>
      curveTokens.find((t) => t?.tokenID === tokenID || t?.tokenId === tokenID),
    ),
);

export const findTokenSpookyByIdSelector = createSelector(
  spoonkyPairsSelector,
  (spookyTokens) =>
    memoize((tokenID) =>
      spookyTokens.find(
        (t) => t?.tokenID === tokenID || t?.tokenId === tokenID,
      ),
    ),
);

export const findTokenJoeByIdSelector = createSelector(
  joePairsSelector,
  (joeTokens) =>
    memoize((tokenID) =>
      joeTokens.find((t) => t?.tokenID === tokenID || t?.tokenId === tokenID),
    ),
);

export const findTokenTrisolarisByIdSelector = createSelector(
  trisolarisPairsSelector,
  (trisolarisTokens) =>
    memoize((tokenID) =>
      trisolarisTokens.find(
        (t) => t?.tokenID === tokenID || t?.tokenId === tokenID,
      ),
    ),
);

export const findTokenInterSwapByIdSelector = createSelector(
    interswapPairsSelector,
    (interswapTokens) =>
        memoize((tokenID) =>
            interswapTokens.find(
                (t) => t?.tokenID === tokenID || t?.tokenId === tokenID,
            ),
        ),
);

export const purePairsSelector = createSelector(
  swapSelector,
  ({ pairs }) => pairs || [],
);

export const listPairsSelector = createSelector(
  swapSelector,
  getPrivacyDataByTokenIDSelector,
  ({ pairs }, getPrivacyDataByTokenID) => {
    if (!pairs) {
      return [];
    }
    let list = pairs.map((tokenID) => getPrivacyDataByTokenID(tokenID));
    return list;
  },
);

export const listPairsIDVerifiedSelector = createSelector(
  listPairsSelector,
  (pairs) => {
    const result = pairs
      .filter((token: SelectedPrivacy) => !!token?.isVerified)
      .map((token) => token?.tokenId);
    return result;
  },
);

export const listPairsIDBuyTokenVerifiedSelector = createSelector(
  listPairsSelector,
  (pairs) => {
    const result = pairs
      .filter((token: SelectedPrivacy) => !!token?.isVerified)
      .map((token) => token?.tokenId);
    return result;
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

export const isPairSupportedTradeOnPancakeSelector = createSelector(
  findTokenPancakeByIdSelector,
  selltokenSelector,
  buytokenSelector,
  (
    getPancakeTokenParamReq,
    sellToken: SelectedPrivacy,
    buyToken: SelectedPrivacy,
  ) => {
    let isSupported = false;
    try {
      const tokenSellPancake = getPancakeTokenParamReq(sellToken.tokenId);
      const tokenBuyPancake = getPancakeTokenParamReq(buyToken.tokenId);
      if (!!tokenSellPancake && !!tokenBuyPancake) {
        isSupported = true;
      }
    } catch (error) {
      //
      console.log('platformsSupportedSelector-error', error);
    }
    return isSupported;
  },
);

export const isPairSupportedTradeOnUniSelector = createSelector(
  findTokenUniByIdSelector,
  selltokenSelector,
  buytokenSelector,
  (
    getUniTokenParamReq,
    sellToken: SelectedPrivacy,
    buyToken: SelectedPrivacy,
  ) => {
    let isSupported = false;
    try {
      const tokenSellUni = getUniTokenParamReq(sellToken.tokenId);
      const tokenBuyUni = getUniTokenParamReq(buyToken.tokenId);
      if (!!tokenSellUni && !!tokenBuyUni) {
        isSupported = true;
      }
    } catch (error) {
      //
      console.log('platformsSupportedSelector-error', error);
    }
    return isSupported;
  },
);

export const isPairSupportedTradeOnCurveSelector = createSelector(
  findTokenCurveByIdSelector,
  selltokenSelector,
  buytokenSelector,
  (
    getCurveTokenParamReq,
    sellToken: SelectedPrivacy,
    buyToken: SelectedPrivacy,
  ) => {
    let isSupported = false;
    try {
      const tokenSellCurve = getCurveTokenParamReq(sellToken.tokenId);
      const tokenBuyCurve = getCurveTokenParamReq(buyToken.tokenId);
      if (!!tokenSellCurve && !!tokenBuyCurve) {
        isSupported = true;
      }
    } catch (error) {
      //
      console.log('platformsSupportedSelector-error', error);
    }
    return isSupported;
  },
);

// platform supported
export const platformsSelector = createSelector(
  swapSelector,
  ({ platforms }) => platforms,
);

export const platformsVisibleSelector = createSelector(
  platformsSelector,
  (platforms) => platforms.filter((platform) => !!platform?.visible),
);

export const platformsSupportedSelector1 = createSelector(
  platformsSelector,
  exchangeSupportsListSelector,
  (platforms, exchangeSupportsList) => {
    let _platforms = [...platforms];
    try {
      if (!exchangeSupportsList || exchangeSupportsList.length === 0) {
        _platforms = [PLATFORMS_SUPPORTED[0]];
      } else {
        const platformNameSupportedList = exchangeSupportsList.map(
          (exchange) => exchange.platformNameSupported,
        );
        _platforms = _platforms.filter((platform) =>
          platformNameSupportedList.includes(platform.id),
        );
      }
    } catch (error) {
      console.log('error', error);
    }
    return _platforms;
  },
);

export const getExchangeSupportByPlatformId = createSelector(
  exchangeSupportsListSelector,
  (exchangeSupportsList) => (platformSelectedId) => {
    try {
      const exchangeFounded = exchangeSupportsList.find(
        (ex) => ex.platformNameSupported === platformSelectedId,
      );
      if (!exchangeFounded) {
        console.error(
          `[getExchangeSupportByPlatformId] NOT FOUND , platformSelectedId = ${platformSelectedId}`,
        );
        return;
      }
      return exchangeFounded;
    } catch (error) {
      console.log('error', error);
    }
  },
);

export const platformSelectedSelector = createSelector(
  platformsSupportedSelector1,
  (platforms) =>
    platforms.find((platform) => !!platform.isSelected) ||
    PLATFORMS_SUPPORTED[0],
);

export const platformIdSelectedSelector = createSelector(
  platformSelectedSelector,
  (platform) => platform.id,
);

export const isExchangeVisibleSelector = createSelector(
  platformsSelector,
  (platforms) =>
    memoize((exchange) => {
      const foundPlatform = platforms.find(
        (platform) => platform?.id === exchange,
      );
      return !!foundPlatform?.visible;
    }),
);

export const isPlatformSelectedSelector = createSelector(
  platformIdSelectedSelector,
  (platformIdSelected) =>
    memoize((platformId) => platformIdSelected === platformId),
);

// fee data selector

export const feeSelectedSelector = createSelector(
  swapSelector,
  ({ feetoken }) => feetoken || '',
);

export const feetokenDataSelector = createSelector(
  (state) => state,
  swapSelector,
  feeSelectedSelector,
  getPrivacyDataByTokenIDSelector,
  platformSelectedSelector,
  slippagetoleranceSelector,
  (
    state,
    { data, networkfee, selltoken, buytoken },
    feetoken,
    getPrivacyDataByTokenID,
    platform,
    slippagetolerance,
  ) => {
    try {
      const feeTokenData: SelectedPrivacy = getPrivacyDataByTokenID(feetoken);
      const sellTokenData: SelectedPrivacy = getPrivacyDataByTokenID(selltoken);
      const buyTokenData: SelectedPrivacy = getPrivacyDataByTokenID(buytoken);
      const PRVPrivacy: SelectedPrivacy = getPrivacyDataByTokenID(PRV.id);
      const prvBalance = PRVPrivacy?.amount || 0;

      const selector = formValueSelector(formConfigs.formName);
      const fee = selector(state, formConfigs.feetoken);
      const { id: platformID } = platform;
      const feeDataByPlatform = data[platformID];
      const {
        feePrv: feePrvEst = {},
        feeToken: feeTokenEst = {},
        rateValue = 0,
      } = feeDataByPlatform;
      const {
        fee: feePrv,
        sellAmount: sellAmountPRV,
        poolDetails: poolDetailsPRV,
        route: tradePathPRV,
        maxGet: maxGetPRV,
        isSignificant: isSignificantPRV,
        impactAmount: impactAmountPRV = 0,
        tokenRoute: tokenRoutePRV = [],
        interSwapData: interSwapDataPRV
      } = feePrvEst;
      const {
        fee: feeToken,
        sellAmount: sellAmountToken,
        buyAmount: buyAmountToken,
        poolDetails: poolDetailsToken,
        route: tradePathToken,
        maxGet: maxGetToken,
        isSignificant: isSignificantToken,
        impactAmount: impactAmountToken = 0,
        tokenRoute: tokenRouteToken = [],
        interSwapData: interSwapDataToken
      } = feeTokenEst;
      let allPoolSize = [];
      let maxGet = 0;
      const payFeeByPRV = feetoken === PRV.id;
      const isSignificant = payFeeByPRV ? isSignificantPRV : isSignificantToken;
      const minFeeOriginal = payFeeByPRV ? feePrv : feeToken;
      let feeAmount = convert.toNumber(fee, true) || 0;
      const feeToNumber = convert.toNumber(fee, true);
      const feeToOriginal = convert.toOriginalAmount(
        feeToNumber,
        feeTokenData?.pDecimals,
      );
      const feeAmountText = `${format.amountFull(
        new BigNumber(feeToOriginal),
        feeTokenData?.pDecimals,
        false,
      )} ${feeTokenData?.symbol || ''}`;
      const origininalFeeAmount =
        convert.toOriginalAmount(feeAmount, feeTokenData?.pDecimals, true) || 0;
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
      const minFeeAmountStr = `${minFeeAmountText} ${
        feeTokenData?.symbol || ''
      }`;
      const totalFeePRV = format.amountFull(
        new BigNumber(origininalFeeAmount).plus(networkfee).toNumber(),
        PRV.pDecimals,
        false,
      );
      const totalFeePRVText = `${totalFeePRV} ${PRV.symbol}`;

      const minFeeOriginalToken = feeToken;
      const minFeeTokenAmount = convert.toHumanAmount(
        minFeeOriginalToken,
        sellTokenData.pDecimals,
      );
      const minFeeTokenFixed = format.toFixed(
        minFeeTokenAmount,
        sellTokenData?.pDecimals,
      );
      const availableHunmanAmountToken = convert.toHumanAmount(
        sellAmountToken,
        sellTokenData.pDecimals,
      );
      const availableFixedSellAmountToken = format.toFixed(
        availableHunmanAmountToken,
        sellTokenData.pDecimals,
      );

      const minFeeOriginalPRV = feePrv;
      const minFeePRVAmount = convert.toHumanAmount(
        minFeeOriginalPRV,
        PRV.pDecimals,
      );
      const minFeePRVFixed = format.toFixed(minFeePRVAmount, PRV.pDecimals);
      const availableHunmanAmountPRV = convert.toHumanAmount(
        sellAmountPRV,
        sellTokenData.pDecimals,
      );
      const availableFixedSellAmountPRV = format.toFixed(
        availableHunmanAmountPRV,
        sellTokenData.pDecimals,
      );
      const canNotPayFeeByPRV =
        !sellTokenData.isMainCrypto && feeToken && !feePrv;
      try {
        allPoolSize = Object.entries(
          payFeeByPRV ? poolDetailsPRV : poolDetailsToken,
        ).map(([, value]) => {
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
      let tradePath = payFeeByPRV ? tradePathPRV : tradePathToken;
      const tokenRoute = payFeeByPRV ? tokenRoutePRV : tokenRouteToken;
      const impactAmount = payFeeByPRV ? impactAmountPRV : impactAmountToken;
      const impactOriginalAmount = convert.toOriginalAmount(impactAmount, 2);
      let impactAmountStr = format.amountVer2(impactOriginalAmount, 2);
      maxGet = payFeeByPRV ? maxGetPRV : maxGetToken;
      const sellOriginalAmount = payFeeByPRV ? sellAmountPRV : sellAmountToken;
      const buyOriginalAmount = calMintAmountExpected({
        maxGet: buyAmountToken,
        slippagetolerance,
      });

      // const rateStr = getExchangeRate(
      //   sellTokenData,
      //   buyTokenData,
      //   sellAmountToken,
      //   buyAmountToken
      // );

      // const rateStr = getExchangeRate1(
      //   sellTokenData,
      //   buyTokenData,
      //   convert.toHumanAmount(sellAmountToken, sellTokenData?.pDecimals),
      //   maxGet ? parseFloat(maxGet) : buyAmountToken,
      // );

      const rateStr = getExchangeRate2(sellTokenData, buyTokenData, rateValue);

      let tradePathStr = '';
      let interPath = undefined;

      const mapPath = (routes) => {
        return routes
            ?.map((tokenID, index, arr) => {
              const token: SelectedPrivacy =
                  getPrivacyDataByTokenID(tokenID);
              return (
                  `${token?.symbol}${
                      index === arr?.length - 1 ? '' : ' > '
                  }` || ''
              );
            })
            .filter((symbol) => !!symbol)
            .join('');
      };

      try {
        if (tokenRoute?.length > 0) {
          switch (platformID) {
            case KEYS_PLATFORMS_SUPPORTED.incognito: {
              tradePath = [tokenRoute.join('-')];
              break;
            }
          }
        }
        switch (platformID) {
          case KEYS_PLATFORMS_SUPPORTED.interswap: {
            if (tokenRoute && tokenRoute.length > 1) {
              const interSwapData = interSwapDataPRV || interSwapDataToken;
              interPath = {
                tradePath1: typeof tokenRoute[0].tradePath === 'string'
                    ? tokenRoute[0].tradePath
                    : mapPath(tokenRoute[0].tradePath),
                tradePath2: typeof tokenRoute[1].tradePath === 'string'
                    ? tokenRoute[1].tradePath
                    : mapPath(tokenRoute[1].tradePath),
                pAppName: interSwapData?.pAppName,
                fistBatchIsPDex: interSwapData?.fistBatchIsPDex,
              };
            }
            break;
          }
          case KEYS_PLATFORMS_SUPPORTED.incognito:
            {
              tradePathStr = tokenRoute
                ?.map((tokenID, index, arr) => {
                  const token: SelectedPrivacy =
                    getPrivacyDataByTokenID(tokenID);
                  return (
                    `${token?.symbol}${
                      index === arr?.length - 1 ? '' : ' > '
                    }` || ''
                  );
                })
                .filter((symbol) => !!symbol)
                .join('');
            }
            break;
          case KEYS_PLATFORMS_SUPPORTED.pancake:
          case KEYS_PLATFORMS_SUPPORTED.uni:
          case KEYS_PLATFORMS_SUPPORTED.uniEther:
          case KEYS_PLATFORMS_SUPPORTED.curve:
          case KEYS_PLATFORMS_SUPPORTED.spooky:
          case KEYS_PLATFORMS_SUPPORTED.joe:
          case KEYS_PLATFORMS_SUPPORTED.trisolaris:
            tradePathStr = tokenRoute || '';
            break;
          default:
            break;
        }
      } catch (error) {
        console.log('GET TRADE PATH ERROR', error);
      }
      return {
        ...feeTokenData,
        ...data,
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
        payFeeByPRV,
        minFeeTokenFixed,
        minFeePRVFixed,
        canNotPayFeeByPRV,
        minFeeOriginalPRV,
        minFeeOriginalToken,
        availableFixedSellAmountPRV,
        availableOriginalSellAmountPRV: sellAmountPRV,
        availableFixedSellAmountToken,
        availableOriginalSellAmountToken: sellAmountToken,
        tradePath,
        maxGet,
        allPoolSize,
        isSignificant,
        feeDataByPlatform,
        feePrvEst,
        feeTokenEst,
        sellOriginalAmount,
        buyOriginalAmount,
        rateStr,
        tradePathStr,
        impactAmountStr,
        impactAmount,
        prvBalance,
        PRVPrivacy,
        interPath
      };
    } catch (error) {
      console.log('feetokenDataSelector-error', error);
    }
  },
);

export const feeTypesSelector = createSelector(
  selltokenSelector,
  feeSelectedSelector,
  platformIdSelectedSelector,
  feetokenDataSelector,
  getPrivacyDataByTokenIDSelector,
  (
    selltoken: SelectedPrivacy,
    feetoken,
    platformId,
    feeTokenData,
    getPrivacyDataByTokenID,
  ) => {
    const { canNotPayFeeByPRV } = feeTokenData;
    const feeToken = getPrivacyDataByTokenID(feetoken);
    let types = [
      {
        tokenId: PRV.id,
        symbol: PRV.symbol,
        actived: feetoken === PRV.id,
      },
    ];
    switch (platformId) {
      case KEYS_PLATFORMS_SUPPORTED.incognito:
        if (selltoken?.tokenId && !selltoken.isMainCrypto) {
          types.push({
            tokenId: selltoken.tokenId,
            symbol: selltoken.symbol,
            actived: feetoken === selltoken.tokenId,
          });
        }
        if (canNotPayFeeByPRV) {
          types = types.filter((type) => type.tokenId !== PRV.id);
        }
        break;
      case KEYS_PLATFORMS_SUPPORTED.pancake: {
        types = [
          {
            tokenId: feeToken.tokenId,
            symbol: feeToken.symbol,
            actived: feetoken === feetoken,
          },
        ];
        break;
      }
      case KEYS_PLATFORMS_SUPPORTED.uni:
      case KEYS_PLATFORMS_SUPPORTED.uniEther: {
        types = [
          {
            tokenId: feeToken.tokenId,
            symbol: feeToken.symbol,
            actived: feetoken === feetoken,
          },
        ];
        break;
      }
      case KEYS_PLATFORMS_SUPPORTED.curve: {
        types = [
          {
            tokenId: feeToken.tokenId,
            symbol: feeToken.symbol,
            actived: feetoken === feetoken,
          },
        ];
        break;
      }

      case KEYS_PLATFORMS_SUPPORTED.spooky: {
        types = [
          {
            tokenId: feeToken.tokenId,
            symbol: feeToken.symbol,
            actived: feetoken === feetoken,
          },
        ];
        break;
      }

      case KEYS_PLATFORMS_SUPPORTED.joe: {
        types = [
          {
            tokenId: feeToken.tokenId,
            symbol: feeToken.symbol,
            actived: feetoken === feetoken,
          },
        ];
        break;
      }

      case KEYS_PLATFORMS_SUPPORTED.trisolaris: {
        types = [
          {
            tokenId: feeToken.tokenId,
            symbol: feeToken.symbol,
            actived: feetoken === feetoken,
          },
        ];
        break;
      }

      case KEYS_PLATFORMS_SUPPORTED.interswap: {
        types = [
          {
            tokenId: feeToken.tokenId,
            symbol: feeToken.symbol,
            actived: feetoken === feeToken
          },
        ];
        break;
      }

      default:
        break;
    }

    return types;
  },
);

export const inputAmountSelector = createSelector(
  (state) => state,
  inpuTokenSelector,
  focustokenSelector,
  feetokenDataSelector,
  sharedSelector.isGettingBalance,
  getInputAmount,
);

export const sellInputTokenSelector = createSelector(
  inputAmountSelector,
  (getInputAmount) => getInputAmount(formConfigs.selltoken),
);

export const buyInputTokenSeletor = createSelector(
  inputAmountSelector,
  (getInputAmount) => getInputAmount(formConfigs.buytoken),
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
      toggleProTab,
    },
    feeTokenData,
    getInputAmount,
    state,
    getPrivacyDataByTokenID,
  ) => {
    try {
      const sellInputAmount = getInputAmount(formConfigs.selltoken);
      const buyInputAmount = getInputAmount(formConfigs.buytoken);
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
      const sellInputBalanceStr = `${sellInputAmount?.balanceStr || '0'} ${
        sellInputAmount?.symbol || ''
      }`;
      const buyInputBalanceStr = `${buyInputAmount?.balanceStr || '0'} ${
        buyInputAmount?.symbol || ''
      }`;
      const sellInputAmountStr = `${sellInputAmount?.amountText} ${sellInputAmount?.symbol}`;
      const buyInputAmountStr = `${buyInputAmount?.amountText} ${buyInputAmount?.symbol}`;
      const prv: SelectedPrivacy = getPrivacyDataByTokenID(PRV.id);
      const showPRVBalance = !sellInputAmount?.isMainCrypto;
      const prvBalance = format.amountVer2(prv.amount, PRV.pDecimals);
      const prvBalanceStr = `${prvBalance} ${PRV.symbol}`;
      const defaultPair = {
        selltoken: sellInputAmount.tokenId,
        buytoken: buyInputAmount.tokenId,
      };
      return {
        balanceStr: sellInputBalanceStr,
        networkfeeAmountStr,
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
        refreshing: initing,
        defaultPair,
        toggleProTab,
        isFetching,
        isFetched,
        accountBalance: prv?.amount || 0,
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
      const {
        requestBurnTxInc,
        buyTokenID,
        sellTokenID,
        status,
        color,
        callContract,
        sellAmountText,
        buyAmountText: buyAmountStorage,
        time,
        outchainTxStatus,
        swapExchangeStatus,
        redepositStatus,
        pAppNetwork,
        refundTxID,
        refundOriginalAmount,
        refundTokenID,
        buyOriginalAmount,
        pAppTxID: reqPAppTxID,
        pDexTxID: reqPDexTxID,
      } = order;

      const sellToken = getPrivacyDataByTokenID(sellTokenID);
      const buyToken = getPrivacyDataByTokenID(buyTokenID);
      const { name: exchange, exchangeScan } = getExchangeDataWithCallContract({
        callContract,
        pAppNetwork
      });

      let buyAmountText = buyAmountStorage;
      if (buyOriginalAmount) {
        buyAmountText = convert.toNumber(
            format.amountFull(buyOriginalAmount, buyToken.pDecimals),
            true
        );
      }

      const sellAmountStr = format.amountVer2(sellAmountText, 0);
      const sellStr = `${sellAmountStr} ${sellToken.symbol}`;
      const buyAmountStr = format.amountVer2(buyAmountText, 0);
      const buyStr = `${buyAmountStr} ${buyToken.symbol}`;
      const swapStr = `${sellStr} = ${buyStr}`;
      const rateStr = `1 ${sellToken.symbol} = ${format.amountVer2(
        new BigNumber(buyAmountText || 0).div(sellAmountText) || 0,
        0,
      )} ${buyToken.symbol}`;
      const timeStr = format.formatDateTime(time, 'DD MMM HH:mm');
      const statusStr = status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : '';
      const outchainTxStatusStr = outchainTxStatus
        ? outchainTxStatus.charAt(0).toUpperCase() + outchainTxStatus.slice(1)
        : '';
      const swapExchangeStatusStr = swapExchangeStatus
        ? swapExchangeStatus.charAt(0).toUpperCase() +
          swapExchangeStatus.slice(1)
        : '';
      const redepositStatusStr = redepositStatus
        ? redepositStatus.charAt(0).toUpperCase() + redepositStatus.slice(1)
        : '';

      let refundAmountStr = '';
      if (refundOriginalAmount && refundTokenID) {
        const refundToken = getPrivacyDataByTokenID(refundTokenID);
        refundAmountStr = `${format.amountVer2(
            refundOriginalAmount,
            refundToken.pDecimals,
        )} ${refundToken.symbol} (${refundToken.network})`;
      }

      let pAppTxID = reqPAppTxID;
      let pDexTxID = reqPDexTxID;
      if (reqPAppTxID && reqPAppTxID === requestBurnTxInc) {
        pAppTxID = undefined;
      }

      if (reqPDexTxID && reqPDexTxID === requestBurnTxInc) {
        pDexTxID = undefined;
      }

      return {
        ...order,
        statusStr,
        statusColor: color,
        exchange,
        swapStr,
        timeStr,
        sellStr,
        buyStr,
        sellTokenNetwork: sellToken.network,
        buyTokenNetwork: buyToken.network,
        outchainTxStatusStr,
        swapExchangeStatusStr,
        redepositStatusStr,
        exchangeScan,
        rateStr,
        refundTxID,
        refundOriginalAmount,
        refundTokenID,
        refundAmountStr,
        pAppTxID,
        pDexTxID
      };
    } catch (error) {
      console.log('mappingOrderHistorySelector1-error', error);
    }
  },
);

export const swapHistorySelector = createSelector(
  swapSelector,
  mappingOrderHistorySelector,
  (
    {
      swapHistory,
      // selltoken, buytoken
    },
    mappingOrderHistory,
  ) =>
    memoize(() => {
      const history = swapHistory?.data?.map((order) =>
        mappingOrderHistory(order),
      );
      return {
        ...swapHistory,
        history,
      };
    }),
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

export const swapFormErrorSelector = createSelector(
  (state) => state,
  (state) => getFormSyncErrors(formConfigs.formName)(state),
);

export const defaultExchangeSelector = createSelector(
  swapSelector,
  ({ defaultExchange }) => defaultExchange,
);

export const isPrivacyAppSelector = createSelector(
  swapSelector,
  ({ isPrivacyApp }) => isPrivacyApp,
);

export const errorEstimateTradeSelector = createSelector(
  swapSelector,
  platformIdSelectedSelector,
  ({ data }, platformId) => data[platformId]?.error || '',
);

export const exchangeNetworkSelector = createSelector(
  swapSelector,
  ({ network }) => network,
);

export const getExchangeDataEstimateTradeSelector = createSelector(
  swapSelector,
  platformIdSelectedSelector,
  ({ data }, platformId) => data[platformId] || undefined,
);

export const getEsimateTradeError = createSelector(
  swapSelector,
  ({ estimateTradeError }) => estimateTradeError,
);

export const validatePRVNetworkFee = createSelector(
  swapInfoSelector,
  feetokenDataSelector,
  getPrivacyDataByTokenIDSelector,
  selltokenSelector,
  inputAmountSelector,
  (swapInfo, feeTokenData, getPrivacyDataByTokenID, selltoken, inputAmount) => {

    const PRVPrivacy: SelectedPrivacy = getPrivacyDataByTokenID(PRV.id);

    const { payFeeByPRV, feetoken, minFeeOriginalPRV, origininalFeeAmount } = feeTokenData;
    const { networkfee } = swapInfo;
    const prvBalance = PRVPrivacy?.amount || 0;

    const totalFeePRV = payFeeByPRV
      ? minFeeOriginalPRV + networkfee
      : networkfee;

    // console.log('prvBalance ', prvBalance);
    // console.log('totalFeePRV ', totalFeePRV);

    if (new BigNumber(prvBalance).minus(totalFeePRV).lt(0)) {
      return MESSAGES.PRV_NOT_ENOUGHT;
    }
    return undefined;
  },
);


export const validateTotalBurningPRVSelector = createSelector(
  swapInfoSelector,
  feetokenDataSelector,
  getPrivacyDataByTokenIDSelector,
  selltokenSelector,
  inputAmountSelector,
  minPRVNeededSelector,
  getPrivacyPRVInfo,
  validatePRVBalanceSelector,
  (swapInfo, feeTokenData, getPrivacyDataByTokenID, selltoken, inputAmount, minPRVNeeded, prvBalanceInfo, validatePRVBalanceFn) => {
    try {
      // console.log('[validateTotalBurningPRVSelector] ==>> ', {
      //   swapInfo,
      //   feeTokenData,
      //   PRVPrivacy,
      //   selltoken,
      //   sellinputAmount
      // });
      // const PRVPrivacy: SelectedPrivacy = getPrivacyDataByTokenID(PRV.id);
      const sellinputAmount = inputAmount(formConfigs.selltoken);
      const { tokenId: sellTokenId } = selltoken;
      const { originalAmount: sellOriginalAmount } = sellinputAmount;
      const { payFeeByPRV, minFeeOriginalPRV } = feeTokenData;
      const { networkfee } = swapInfo;
      const { PRV_ID, feePerTx } = prvBalanceInfo;
  
      let totalBurningPRV = 0;

  
      // SellToken = PRV
      if (sellTokenId === PRV_ID) {
        totalBurningPRV = sellOriginalAmount;
      } else {
        totalBurningPRV = 0;
      }
  
      // PayFee = PRV
      if (payFeeByPRV) {
        totalBurningPRV = totalBurningPRV + minFeeOriginalPRV + networkfee;
      } else {
        totalBurningPRV = totalBurningPRV + networkfee;
      }

      if (!totalBurningPRV || totalBurningPRV == 0) {
        totalBurningPRV = feePerTx;
      }

      return validatePRVBalanceFn(totalBurningPRV);

    } catch (error) {
      console.log('[validateTotalBurningPRVSelector] ERROR ', error);
    }
  }
);

export const getIsNavigateFromMarketTab = createSelector(
  swapSelector,
  ({ isNavigateFromMarketTab }) => isNavigateFromMarketTab,
);

export const getIsNavigateToSelectToken = createSelector(
  swapSelector,
  ({ isNavigateToSelection }) => isNavigateToSelection,
);

export const getSearchTokenListByField = createSelector(
  [listPairsSelector, selltokenSelector, buytokenSelector],
  (pairsToken, selltoken, buytoken) =>
    memoize((field, tokenId) => {
      let tokensFilter = [];
      if (field === 'sellToken') {
        tokensFilter =
          pairsToken.filter(
            (token: SelectedPrivacy) => token.tokenId !== tokenId,
          ) || [];
      } else {
        const sellChildNetworks = selltoken.isPUnifiedToken
          ? selltoken.listUnifiedToken.map((child) => child.groupNetworkName)
          : [selltoken.groupNetworkName];
        const tokenFilters =
          pairsToken.filter((token: SelectedPrivacy) => {
            if (token?.tokenId === buytoken?.tokenId) return false;
            if (token?.movedUnifiedToken) return false; // not supported moved unified token
            if (!!selltoken?.defaultPoolPair || !!token.defaultPoolPair) return true; //Swappable on pDex

            const tokenChildNetworks = token.isPUnifiedToken
              ? token.listUnifiedToken.map((child) => child.groupNetworkName)
              : [token.groupNetworkName];

            return sellChildNetworks.some(
              (networkName) =>
                networkName && tokenChildNetworks.includes(networkName),
            );
          }) || [];

        return tokenFilters;
        // const tokenFilters =
        //   pairsToken.filter(
        //     (token: SelectedPrivacy) => token.tokenId !== tokenId,
        //   ) || [];
        // return tokenFilters;
      }
      return tokensFilter;
    }),
);

export const feeErorSelector = createSelector(
  [feetokenDataSelector, inputAmountSelector, getPrivacyDataByTokenIDSelector],
  (feetokenData, inputAmount, getPrivacyDataByTokenID) => {
    const sellinputAmount = inputAmount(formConfigs.selltoken);
    const buyinputAmount = inputAmount(formConfigs.buytoken);
    const prv: SelectedPrivacy = getPrivacyDataByTokenID(PRV.id);

    const sellTokenIsPRV = sellinputAmount?.tokenId === PRV.id;
    const payFeeByPRV = feetokenData?.feetoken === PRV.id;
    const prvBalance = prv?.amount || 0;

    if (sellTokenIsPRV) return undefined;
    if (!payFeeByPRV) return undefined;
    if (
      !buyinputAmount ||
      !buyinputAmount.amountText ||
      buyinputAmount.amountText.length < 1
    )
      return undefined;

    // console.log('prvBalance ', prvBalance);
    // console.log('feetokenData ', feetokenData);

    let availableOriginalPRVFeeAmount = new BigNumber(prvBalance).minus(
      feetokenData?.minFeeOriginal,
    );
    if (availableOriginalPRVFeeAmount.lt(0)) {
      return true;
    }
    return undefined;
  },
);

export const unifiedInforAlertHashSelector = createSelector(
  swapSelector,
  ({ unifiedInforAlertHash }) => unifiedInforAlertHash,
);

export const isToggleUnifiedInfoSelector = createSelector(
  [
    (state) => state.navigation,
    unifiedInforAlertHashSelector,
    getCurrentPaymentAddressSelector,
    checkConvertSelector,
    switchAccountSelector,
  ],
  (
    navigation,
    unifiedInforAlertHash,
    currentPaymentAddress,
    isExistUnUnifiedToken,
    isSwitchingAccount,
  ) => {
    // console.log({
    //   navigation,
    //   unifiedInforAlertHash,
    //   currentPaymentAddress,
    //   isExistUnUnifiedToken,
    //   isSwitchingAccount,
    //   dataHash: unifiedInforAlertHash[currentPaymentAddress],
    // });

    if (navigation.currentScreen !== 'Trade') return false;
    if (isSwitchingAccount || !isExistUnUnifiedToken) return false;
    if (!currentPaymentAddress || !unifiedInforAlertHash) return false;
    if (!unifiedInforAlertHash[currentPaymentAddress]) return true; //The first time
    if (unifiedInforAlertHash[currentPaymentAddress]) {
      const { timeStamp, answer } =
        unifiedInforAlertHash[currentPaymentAddress];
      const isMoreThanADay = new Date().getTime() - timeStamp > ONE_DAY;

      // console.log('isMoreThanADay ', isMoreThanADay);

      if (isMoreThanADay) return true;
      // if (!answer) {
      //   const isMoreThanADay = new Date().getTime() - timeStamp > ONE_DAY;
      //   if (isMoreThanADay) return true;
      // }
    }
    return false;
  },
);
