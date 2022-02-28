import { createSelector } from 'reselect';
import isNaN from 'lodash/isNaN';
import toLower from 'lodash/toLower';
import { getPrivacyDataByTokenID as getPrivacyDataByTokenIDSelector } from '@src/redux/selectors/selectedPrivacy';
import format from '@src/utils/format';
import { ACCOUNT_CONSTANT } from 'incognito-chain-web-js/build/wallet';
import capitalize from 'lodash/capitalize';
import { formValueSelector, isValid, getFormSyncErrors } from 'redux-form';
import convert from '@src/utils/convert';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { PRV } from '@src/constants/common';
import { sharedSelector } from '@src/redux/selectors';
import orderBy from 'lodash/orderBy';
import memoize from 'lodash/memoize';
import { getExchangeRate, getPairRate, getPoolSize } from '@screens/PDexV3';
import BigNumber from 'bignumber.js';
import isEqual from 'lodash/isEqual';
import {
  formConfigs,
  KEYS_PLATFORMS_SUPPORTED,
  PLATFORMS_SUPPORTED,
} from './Swap.constant';
import { getInputAmount, calMintAmountExpected } from './Swap.utils';

export const swapSelector = createSelector(
  (state) => state.pDexV3,
  ({ swap }) => swap,
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

export const pDexPairsSelector = createSelector(
  swapSelector,
  ({ pDEXPairs }) => pDEXPairs,
);

export const pancakePairsSelector = createSelector(
  swapSelector,
  ({ pancakeTokens }) => pancakeTokens,
);

export const uniPairsSelector = createSelector(
  swapSelector,
  ({ uniTokens }) => uniTokens,
);

export const findTokenPancakeByIdSelector = createSelector(
  pancakePairsSelector,
  (pancakeTokens) =>
    memoize((tokenID) => pancakeTokens.find((t) => t?.tokenID === tokenID)),
);

export const findTokenUniByIdSelector = createSelector(uniPairsSelector, (uniTokens) =>
  memoize((tokenID) => uniTokens.find((t) => t?.tokenID === tokenID)),
);

export const hashmapContractIDsSelector = createSelector(
  pancakePairsSelector,
  (pancakeTokens) =>
    pancakeTokens
      .filter((token) => token?.isPopular === true)
      .reduce((curr, token) => {
        const { symbol, contractIdGetRate, decimals } = token;
        curr = {
          ...curr,
          [toLower(contractIdGetRate)]: {
            symbol: toLower(symbol),
            decimals,
          },
        };
        return curr;
      }, {}),
);

export const hashmapUniContractIDsSelector = createSelector(
  uniPairsSelector,
  (uniTokens) =>
    uniTokens
      .filter((token) => token?.isPopular === true)
      .reduce((curr, token) => {
        const { symbol, contractIdGetRate, decimals } = token;
        curr = {
          ...curr,
          [toLower(contractIdGetRate)]: {
            symbol: toLower(symbol),
            decimals,
          },
        };
        return curr;
      }, {}),
);

export const getTokenIdByContractIdGetRateSelector = createSelector(
  pancakePairsSelector,
  (pancakeTokens) =>
    memoize((contractIdGetRate) => {
      let tokenID = '';
      const foundToken = pancakeTokens.find((token) =>
        isEqual(toLower(contractIdGetRate), toLower(token?.contractIdGetRate)),
      );
      if (foundToken) {
        tokenID = foundToken?.tokenID;
      }
      return tokenID;
    }),
);

export const getTokenIdByUniContractIdGetRateSelector = createSelector(
  uniPairsSelector,
  (uniTokens) =>
    memoize((contractIdGetRate) => {
      let tokenID = '';
      const foundToken = uniTokens.find((token) =>
        isEqual(toLower(contractIdGetRate), toLower(token?.contractIdGetRate)),
      );
      if (foundToken) {
        tokenID = foundToken?.tokenID;
      }
      return tokenID;
    }),
);

export const purePairsSelector = createSelector(
  swapSelector,
  ({ pairs }) => pairs || [],
);

export const listPairsSelector = createSelector(
  swapSelector,
  getPrivacyDataByTokenIDSelector,
  (
    { pairs, isPrivacyApp, defaultExchange, pancakeTokens, uniTokens },
    getPrivacyDataByTokenID,
  ) => {
    if (!pairs) {
      return [];
    }
    let list = pairs.map((tokenID) => getPrivacyDataByTokenID(tokenID));
    let result = [];
    if (isPrivacyApp) {
      switch (defaultExchange) {
      case KEYS_PLATFORMS_SUPPORTED.pancake: {
        list = list.map((token: SelectedPrivacy) => {
          let { priority, isVerified } = token;
          const foundedToken = pancakeTokens.find(
            (pt) => pt?.tokenID === token?.tokenId,
          );
          if (foundedToken) {
            priority = foundedToken?.priority;
            isVerified = foundedToken?.verify;
          }
          return {
            ...token,
            isVerified,
            priority,
          };
        });
        break;
      }
      case KEYS_PLATFORMS_SUPPORTED.uni: {
        list = list.map((token: SelectedPrivacy) => {
          let { priority, isVerified } = token;
          const foundedToken = uniTokens.find(
            (pt) => pt?.tokenID === token?.tokenId,
          );
          if (foundedToken) {
            priority = foundedToken?.priority;
            isVerified = foundedToken?.verify;
          }
          return {
            ...token,
            isVerified,
            priority,
          };
        });
        break;
      }
      default:
        break;
      }
    }
    result = orderBy(list, ['priority'], ['asc']);
    return result;
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

// platform supported
export const platformsSelector = createSelector(
  swapSelector,
  ({ platforms }) => platforms,
);

export const platformsVisibleSelector = createSelector(
  platformsSelector,
  (platforms) => platforms.filter((platform) => !!platform?.visible),
);

export const platformsSupportedSelector = createSelector(
  swapSelector,
  platformsVisibleSelector,
  isPairSupportedTradeOnPancakeSelector,
  isPairSupportedTradeOnUniSelector,
  (
    { data },
    platforms,
    isPairSupportedTradeOnPancake,
    isPairSupportedTradeOnUni,
  ) => {
    let _platforms = [...platforms];
    try {
      if (!isPairSupportedTradeOnPancake) {
        _platforms = _platforms.filter(
          (platform) => platform.id !== KEYS_PLATFORMS_SUPPORTED.pancake,
        );
      }
      if (!isPairSupportedTradeOnUni) {
        _platforms = _platforms.filter(
          (platform) => platform.id !== KEYS_PLATFORMS_SUPPORTED.uni,
        );
      }
      _platforms = _platforms.filter(({ id: platformId }) => {
        const hasError = !data[platformId]?.error;
        return hasError;
      });
      if (_platforms.length === 0 || !_platforms) {
        _platforms = [PLATFORMS_SUPPORTED[0]];
      }
    } catch (error) {
      console.log('error', error);
    }
    return _platforms;
  },
);

export const platformSelectedSelector = createSelector(
  platformsSupportedSelector,
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
  getTokenIdByContractIdGetRateSelector,
  slippagetoleranceSelector,
  (
    state,
    { data, networkfee, selltoken, buytoken },
    feetoken,
    getPrivacyDataByTokenID,
    platform,
    getTokenIdByContractIdGetRate,
    slippagetolerance,
  ) => {
    try {
      const feeTokenData: SelectedPrivacy = getPrivacyDataByTokenID(feetoken);
      const sellTokenData: SelectedPrivacy = getPrivacyDataByTokenID(selltoken);
      const buyTokenData: SelectedPrivacy = getPrivacyDataByTokenID(buytoken);
      const selector = formValueSelector(formConfigs.formName);
      const fee = selector(state, formConfigs.feetoken);
      const { id: platformID } = platform;
      const feeDataByPlatform = data[platformID];
      const { feePrv: feePrvEst = {}, feeToken: feeTokenEst = {} } =
        feeDataByPlatform;
      const {
        fee: feePrv,
        sellAmount: sellAmountPRV,
        poolDetails: poolDetailsPRV,
        route: tradePathPRV,
        maxGet: maxGetPRV,
        isSignificant: isSignificantPRV,
        impactAmount: impactAmountPRV = 0,
        tokenRoute: tokenRoutePRV = [],
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
      const tradePath = payFeeByPRV ? tradePathPRV : tradePathToken;
      const tokenRoute = payFeeByPRV ? tokenRoutePRV : tokenRouteToken;
      const impactAmount = payFeeByPRV ? impactAmountPRV : impactAmountToken;
      const impactOriginalAmount = convert.toOriginalAmount(impactAmount, 2);
      const impactAmountStr = format.amountVer2(impactOriginalAmount, 2);
      maxGet = payFeeByPRV ? maxGetPRV : maxGetToken;
      const sellOriginalAmount = payFeeByPRV ? sellAmountPRV : sellAmountToken;
      const buyOriginalAmount = calMintAmountExpected({
        maxGet: buyAmountToken,
        slippagetolerance,
      });
      const rateStr = getExchangeRate(
        sellTokenData,
        buyTokenData,
        sellOriginalAmount,
        buyOriginalAmount,
      );
      let tradePathStr = '';
      let tradePathArr = [];
      try {
        if (tokenRoute?.length > 0) {
          switch (platformID) {
          case KEYS_PLATFORMS_SUPPORTED.incognito: {
            tradePathArr = tokenRoute;
            break;
          }
          case KEYS_PLATFORMS_SUPPORTED.pancake: {
            tradePathArr = tokenRoute.map((contractId) =>
              getTokenIdByContractIdGetRate(contractId),
            );
            break;
          }
          case KEYS_PLATFORMS_SUPPORTED.uni: {
            let routes = feeDataByPlatform.route;
            for (var i = 0; i < routes?.length; i++) {
              let pathStr = '';
              for (var j = 0; j < routes[i]?.length; j++) {
                if(routes[i].length === 1) {
                  pathStr =
                    routes[i][0].tokenIn.symbol +  ' > ' + routes[i][0].tokenOut.symbol;
                } else {
                  if (routes[i][j] % 2 === 0) {
                    pathStr =
                      pathStr +
                      routes[i][j].tokenIn.symbol +
                      (j === routes[i].length - 1 ? '' : ' > ');
                  } else {
                    pathStr =
                      pathStr +
                      routes[i][j].tokenOut.symbol +
                      (j === routes[i].length - 1 ? '' : ' > ');
                  }
                }
                
              }
              tradePathArr.push({
                pathStr,
                percent: routes[i][0]?.percent,
              });
            }
            break;
          }
          default:
            break;
          }
        }
        if (platformID === KEYS_PLATFORMS_SUPPORTED.uni) {
          tradePathStr = feeDataByPlatform.routerString;
        } else {
          tradePathStr = tradePathArr
            .map((tokenID, index, arr) => {
              const token: SelectedPrivacy = getPrivacyDataByTokenID(tokenID);
              return `${token?.symbol}${index === arr?.length - 1 ? '' : ' > '}` || '';
            })
            .filter((symbol) => !!symbol)
            .join('');
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
        tradePathArr,
        impactAmountStr,
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
  (selltoken: SelectedPrivacy, feetoken, platformId, feeTokenData) => {
    const { canNotPayFeeByPRV } = feeTokenData;
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
      break;
    }
    case KEYS_PLATFORMS_SUPPORTED.uni: {
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
      let {
        sellTokenId,
        amount,
        buyTokenId,
        requestime,
        status,
        fee,
        feeToken: feeTokenId,
        fromStorage,
        amountOut,
        statusCode,
      } = order;
      let statusStr = capitalize(status);
      if (fromStorage) {
        switch (statusCode) {
        case ACCOUNT_CONSTANT.TX_STATUS.TXSTATUS_CANCELED:
        case ACCOUNT_CONSTANT.TX_STATUS.TXSTATUS_FAILED: {
          statusStr = 'Failed';
          break;
        }
        default:
          statusStr = 'Processing';
          break;
        }
      }
      const sellToken: SelectedPrivacy = getPrivacyDataByTokenID(sellTokenId);
      const buyToken: SelectedPrivacy = getPrivacyDataByTokenID(buyTokenId);
      const feeToken: SelectedPrivacy = getPrivacyDataByTokenID(feeTokenId);
      const amountStr = format.amountVer2(amount, sellToken.pDecimals);
      const buyAmountStr = format.amountVer2(amountOut, buyToken.pDecimals);
      const sellStr = `${amountStr} ${sellToken.symbol}`;
      const buyStr = `${buyAmountStr} ${buyToken.symbol}`;
      const timeStr = format.formatDateTime(requestime, 'DD MMM HH:mm');
      const rate = getPairRate({
        token1Value: amount,
        token2Value: amountOut,
        token1: sellToken,
        token2: buyToken,
      });
      const rateStr = getExchangeRate(sellToken, buyToken, amount, amountOut);
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
      const swapStr = amountOut ? `${sellStr} = ${buyStr}` : '';
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
        statusStr,
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
  (
    {
      swapHistory,
      // selltoken, buytoken
    },
    mappingOrderHistory,
  ) => {
    const history = swapHistory?.data?.map((order) =>
      mappingOrderHistory(order),
    );
    // .filter(
    //   ({ sellTokenId, buyTokenId }) =>
    //     xor([selltoken, buytoken], [sellTokenId, buyTokenId]).length === 0,
    // );
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
