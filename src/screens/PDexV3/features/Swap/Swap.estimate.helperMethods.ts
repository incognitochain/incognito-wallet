import { PRV_ID } from '@src/constants/common';
import SelectedPrivacy from '@src/models/selectedPrivacy';

import BigNumber from 'bignumber.js';
import {
  NETWORK_NAME_SUPPORTED,
  KEYS_PLATFORMS_SUPPORTED,
} from './Swap.constant';

import {
  ExchangeData,
  EstimateRawData,
  ExchangeRawDetail,
  KeysPlatformSupported,
  MAIN_NETWORK,
  NETWORK_IDS_MAPPING,
  EXCHANGES_NETWROK_ID, InterSwapData,
} from './Swap.types';

const parseExchangeSupport = (
  estimateData,
  sellToken,
  networkName,
): ExchangeData[] => {
  let exchangeSupport = [];
  let estimateFeeExchanges: ExchangeRawDetail[] = estimateData[networkName];
  if (estimateFeeExchanges) {
    let incTokenId = getIncognitoTokenId(
      sellToken,
      NETWORK_IDS_MAPPING[networkName],
    );
    if (Array.isArray(estimateFeeExchanges)) {
      exchangeSupport = estimateFeeExchanges.map((exchange) => {
        return parseExchangeDataModelResponse(
          exchange,
          networkName,
          NETWORK_IDS_MAPPING[networkName],
          incTokenId,
          sellToken
        );
      });
    }
  }

  return exchangeSupport;
};

const getIncognitoTokenId = (
  tokenModel: any,
  networkId: EXCHANGES_NETWROK_ID,
) => {
  if (!tokenModel) return '';

  let incTokenId = tokenModel.tokenId;

  if (!tokenModel.listUnifiedToken) return incTokenId;
  if (tokenModel.isPUnifiedToken) {
    const childToken = tokenModel.listUnifiedToken.find(
      (token) => token.networkId === networkId,
    );
    incTokenId = childToken ? childToken.tokenId : incTokenId;
  }
  return incTokenId;
};

const parseExchangeDataModelResponse = (
  // Data response from api estimate swap fee
  data: ExchangeRawDetail,
  // Swap network name
  networkName: string,
  // Swap networkID
  networkID: EXCHANGES_NETWROK_ID,
  // Child buy tokenId
  incTokenID: string,

  sellToken: SelectedPrivacy
): ExchangeData => {
  let exchangeData: ExchangeData = {
    amountIn: parseFloat(data.AmountIn) || 0,
    amountInRaw: parseFloat(data.AmountInRaw) || 0,
    amountOut: parseFloat(data.AmountOut) || 0,
    amountOutStr: data.AmountOut || '0',
    amountOutRaw: parseFloat(data.AmountOutRaw) || 0,
    appName: data.AppName === 'pdex' ? 'incognito' : data.AppName,
    exchangeName: data.AppName || '',
    amountOutPreSlippage: data.AmountOutPreSlippage || '0',
    amountOutPreSlippageNumber: parseFloat(data.AmountOutPreSlippage || '0'),
    fees: data.Fee || [],
    routes: data.Paths || '',
    incTokenID: incTokenID || '',
    feeAddress: data.FeeAddress || '',
    callContract: data.CallContract,
    callData: data.Calldata,
    poolPairs: data.PoolPairs || '',
    impactAmount: data.ImpactAmount || 0,
    networkID,
    networkName,
    feeAddressShardID: data.FeeAddressShardID,
    platformNameSupported: convertAppNameToPlatformSupported(
      data.AppName,
      networkID,
    ),
    redepositReward: parseFloat(data.RedepositReward) || 0,
    rate: parseFloat(data.Rate) || 0,
    rateStr: data.Rate || '0',
    interSwapData: undefined,
  };

  // format
  const isInterSwap = exchangeData?.appName === KEYS_PLATFORMS_SUPPORTED.interswap;
  if (isInterSwap) {
    let path: any = [];
    const respDetails = data?.Details;
    if (respDetails && !!respDetails.length) {
      const firstBatch = respDetails[0];
      const secondBatch = respDetails[1];
      const callContract = firstBatch?.CallContract;
      const callData = firstBatch?.Calldata;
      const fistBatchIsPDex = firstBatch.AppName.toLowerCase() === 'pdex';

      respDetails.forEach((trade) => {
        if (trade.Paths) {
          const logoIcon = '';
          path.push({
            logoIcon,
            tradePath: trade.Paths,
          });
        }
      });

      let pAppName = fistBatchIsPDex ? secondBatch?.AppName : firstBatch.AppName;
      let pAppNetwork = fistBatchIsPDex ? secondBatch?.PAppNetwork : firstBatch.PAppNetwork;

      let incTokenID = sellToken?.tokenId;
      let networkID = NETWORK_IDS_MAPPING[firstBatch.PAppNetwork]
          ? NETWORK_IDS_MAPPING[firstBatch.PAppNetwork]
          : sellToken?.networkId || 0;
      if (sellToken?.isPUnifiedToken && !fistBatchIsPDex) {
        const childToken: SelectedPrivacy = (sellToken?.listUnifiedToken || sellToken?.listChildToken)?.find(
            (token: SelectedPrivacy) => token?.networkId === networkID
        );
        if (childToken?.networkId && childToken?.tokenId) {
          networkID = childToken.networkId;
          incTokenID = childToken?.tokenId;
        }
      }

      let poolPairs, feeAddress;
      if (fistBatchIsPDex) {
        poolPairs = firstBatch.PoolPairs;
      } else {
        feeAddress = firstBatch?.FeeAddress;
      }

      const interSwapData: InterSwapData = {
        midOTA: data?.MidOTA,
        midToken: data?.MidToken,
        fistBatchIsPDex,
        pdexMinAcceptableAmount: new BigNumber(firstBatch?.AmountOutRaw || 0).toString(),
        pAppName,
        pAppNetwork,
        path,
      };

      exchangeData = {
        ...exchangeData,
        callData,
        callContract,

        poolPairs,
        feeAddress,

        networkID,
        incTokenID,

        interSwapData,
      };
    }
  }
  return exchangeData;
};

const convertAppNameToPlatformSupported = (
  appName: string, //appName field from Back End
  networkID: EXCHANGES_NETWROK_ID,
): KeysPlatformSupported => {
  switch (appName) {
    case 'pdex':
      return 'incognito';
    case 'pancake':
      return 'pancake';
    case 'uniswap':
      {
        if (networkID === MAIN_NETWORK.ETH) return 'uniEther';
        if (networkID === MAIN_NETWORK.POLYGON) return 'uni';
      }
      break;
    case 'curve':
      return 'curve';
    case 'spooky':
      return 'spooky';
    case 'joe':
      return 'joe';
    case 'trisolaris':
      return 'trisolaris';
    case 'interswap':
      return 'interswap';
    default:
      console.log(
        `[convertAppNameToPlatformSupported] appName NOT FOUND, appName = ${appName}. Return default: incognito `,
      );
      return 'incognito';
  }
};

const isUseTokenFeeParser = (fees) => {
  let flag = true;
  if (!Array.isArray(fees)) flag = false;
  if (fees[0].tokenId === PRV_ID || fees[0].tokenid === PRV_ID) flag = false;
  return [flag, fees[0].amount || 0];
};

export const flattenEstimateRawData = (estimateRawData) => {
  let results = [];
  for (const value of Object.entries(estimateRawData)) {
    results = [...results, ...value];
  }
  return results;
};

export const filterExchangeSupportWithDefaultExchange = (
  flattenEstimateData: ExchangeData[],
  currentPlatformSelected = KEYS_PLATFORMS_SUPPORTED.incognito,
): ExchangeData[] => {
  //Trading incognito platform => Get all data (pancake, uniswap, curve, pdex)
  if (currentPlatformSelected === KEYS_PLATFORMS_SUPPORTED.incognito)
    return flattenEstimateData;

  //otherwise, filter only data with currentPlatformSelected (pancake | uniswap | curve)

  if (
    currentPlatformSelected === 'uni' ||
    currentPlatformSelected === 'uniEther'
  ) {
    return flattenEstimateData.filter(
      (item) =>
        item.platformNameSupported === 'uni' ||
        item.platformNameSupported === 'uniEther',
    );
  }
  return flattenEstimateData.filter(
    (item) => item.platformNameSupported === currentPlatformSelected,
  );
};

const parseEstimateDataOnEachNetwork = (
  estimateRawData,
  sellToken,
): ExchangeData[] => {
  const exchangeSupports = Object.values(NETWORK_NAME_SUPPORTED).reduce(
    (results, networkName) => {
      results = [
        ...results,
        ...parseExchangeSupport(estimateRawData, sellToken, networkName),
      ];
      return results;
    },
    [],
  );
  return exchangeSupports;
};

export const extractEstimateData = async (
  estimateRawData: EstimateRawData,
  sellToken,
  defaultExchange,
): Promise<{
  bestRateExchange: ExchangeData;
  exchangeSupports: ExchangeData[];
}> => {
  let exchangeSupports: ExchangeData[] = parseEstimateDataOnEachNetwork(
    estimateRawData,
    sellToken,
  );

  exchangeSupports =
    filterExchangeSupportWithDefaultExchange(
      exchangeSupports,
      defaultExchange,
    ) || [];

  if (!exchangeSupports.length)
    throw new Error(
      'Can not find any trading platform that supports for this pair token',
    );

  // Find Best Rate
  const bestRateExchange: ExchangeData = exchangeSupports.reduce(
    (prev, current) =>
      prev.amountOut - parseFloat(prev.fees[0].amountInBuyToken || '0') >
      current.amountOut - parseFloat(current.fees[0].amountInBuyToken || '0')
        ? prev
        : current,
  );

  console.log('extractEstimateData : ', { bestRateExchange, exchangeSupports });
  console.log('LOGS: extractEstimateData', { exchangeSupports, bestRateExchange, estimateRawData });
  return { bestRateExchange, exchangeSupports };
};

export {
  parseExchangeSupport,
  getIncognitoTokenId,
  parseExchangeDataModelResponse,
  isUseTokenFeeParser,
};
