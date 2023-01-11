import { createSelector } from 'reselect';
import { getPrivacyDataByTokenID as getPrivacyDataByTokenIDSelector , getPrivacyPRVInfo } from '@src/redux/selectors/selectedPrivacy';
import BigNumber from 'bignumber.js';
import {
  getExchangeRate,
  getPrincipal,
  getShareStr,
} from '@screens/PDexV3';
import format from '@src/utils/format';
import convert from '@utils/convert';
import {getValidRealAmountNFTSelector, isFetchingNFTSelector} from '@src/redux/selectors/account';


export const portfolioSelector = createSelector(
  (state) => state.pDexV3,
  ({ portfolio }) => {
    return portfolio;
  },
);

export const shareDetailsSelector = createSelector(
  portfolioSelector,
  ({ shareDetails }) => shareDetails
);

export const isFetchingSelector = createSelector(
  portfolioSelector,
  ({ isFetching }) => isFetching
);

const mapRewardToUSD = ({ rewards, getPrivacyDataByTokenID }) => {
  let mapRewards = Object.keys(rewards).map(tokenId => ({
    tokenId,
    reward: rewards[tokenId]
  }));
  mapRewards = mapRewards.map(item => {
    const token = getPrivacyDataByTokenID(item.tokenId);
    const rewardUSD = convert.toHumanAmount(new BigNumber(item.reward).multipliedBy(token.priceUsd).toNumber(), token.pDecimals);
    const rewardUSDStr = format.toFixed(rewardUSD, token.pDecimals);
    const rewardUSDSymbolStr = `${rewardUSDStr} ${token.symbol}`;
    const rewardStr = `${format.amountFull(item.reward, token.pDecimals)} ${token.symbol}`;
    return {
      ...item,
      token,
      rewardUSD,
      rewardUSDStr,
      rewardUSDSymbolStr,
      rewardStr
    };
  });
  return mapRewards;
};

export const listShareSelector = createSelector(
  portfolioSelector,
  shareDetailsSelector,
  getPrivacyDataByTokenIDSelector,
  getValidRealAmountNFTSelector,
  isFetchingNFTSelector,
  getPrivacyPRVInfo,
  (portfolio, shareDetails, getPrivacyDataByTokenID, getValidRealAmountNFT, isFetchingNFT, prvBalanceInfo) => {
    const { data } = portfolio;
    return data.map((item) => {
      const {
        share,
        totalShare,
        poolId,
        withdrawing,
        withdrawable,
        tokenId1,
        tokenId2,
        rewards,
        orderRewards,
        nftId
      } = item;
      const poolDetail = shareDetails.find((share) => poolId === share.poolId);
      let { amp, apy, token1Value: token1PoolValue, token2Value: token2PoolValue } = poolDetail || {};
      apy = apy || 0;
      const token1 = getPrivacyDataByTokenID(tokenId1);
      const token2 = getPrivacyDataByTokenID(tokenId2);
      const shareId = `${nftId}-${poolId}`;
      const exchangeRateStr = getExchangeRate(
        token1,
        token2,
        token1PoolValue,
        token2PoolValue,
      );
      const principal = getPrincipal({
        token1,
        token2,
        shareData: {
          ...item,
          token1PoolValue,
          token2PoolValue,
        }
      });

      const { isEnoughNetworkFeeDefault, feeAndSymbol } = prvBalanceInfo;
      const principalUSDHuman = new BigNumber(principal.token1USDHuman).plus(principal.token2USDHuman).toNumber();
      const principalUSD = format.amountVer2(Math.ceil(new BigNumber(principalUSDHuman).multipliedBy(Math.pow(10, 9)).toNumber()), 9);

      const shareStr = getShareStr(share, totalShare);
      const validNFT = !!getValidRealAmountNFT(nftId);
      
      const disableBtn = isFetchingNFT || !validNFT || !isEnoughNetworkFeeDefault;
      const mapLPRewards = mapRewardToUSD({
        rewards: rewards || {},
        getPrivacyDataByTokenID
      }) || [];
      const mapOrderRewards = mapRewardToUSD({
        rewards: orderRewards  || {},
        getPrivacyDataByTokenID
      }) || [];
      const totalRewardUSD = mapLPRewards.concat(mapOrderRewards).reduce((prev, curr) => new BigNumber(prev).plus(curr.rewardUSD).toNumber(), 0);
      const totalRewardAmount = Math.ceil(new BigNumber(totalRewardUSD).multipliedBy(Math.pow(10, 9)).toNumber());
      const totalRewardUSDStr = format.amountVer2(totalRewardAmount, 9);
      const rewardUSDSymbolStr = `$${totalRewardUSDStr}`;
      const hookLPRewards = mapLPRewards.map((item) => ({
        label: 'Fees collected',
        valueText: item.rewardStr,
      }));

      const hookOrderRewards = mapOrderRewards.map((item) => ({
        label: 'Order reward',
        valueText: item.rewardStr,
      }));

      const hookFactories = [
        {
          label: `${token1.symbol} Balance`,
          value: principal.token1,
        },
        {
          label: `${token2.symbol} Balance`,
          value: principal.token2,
        },
        {
          label: 'Rewards collected',
          value: rewardUSDSymbolStr,
        },
      ];
      const apyStr = format.amount(apy, 0);
      let token1Network = '';
      let token2Network = '';
      if (token1.network) {
        token1Network = `(${token1.network})`;
      }
      if (token2.network) {
        token2Network = `(${token2.network})`;
      }
      const hookFactoriesDetail = [
        {
          label: 'APR',
          valueText: `${apyStr}%`,
        },
        {
          label: `${token1.symbol} Balance`,
          valueText: `${principal.token1} ${token1Network}`,
        },
        {
          label: `${token2.symbol} Balance`,
          valueText: `${principal.token2} ${token2Network}`,
        },
        ...hookLPRewards,
        ...hookOrderRewards,
        !isEnoughNetworkFeeDefault ? {
          label: 'Network Fee',
          valueText: `${feeAndSymbol}`,
        } : undefined,
      ];

      return {
        ...item,
        shareId,
        token1,
        token2,
        exchangeRateStr,
        principal,
        shareStr,
        hookFactories,
        amp,
        apy,
        apyStr,
        token1PoolValue,
        token2PoolValue,
        hookFactoriesDetail,
        withdrawing,
        withdrawable,
        nftId,
        poolId,
        validNFT,
        disableBtn,
        mapLPRewards,
        mapOrderRewards,
        totalRewardUSD,
        totalRewardUSDStr,
        rewardUSDSymbolStr,
        totalRewardAmount,
        token1USDHuman: principal.token1USDHuman,
        token2USDHuman: principal.token2USDHuman,
        principalUSD,
        isEnoughNetworkFeeDefault
      };
    });
  },
);

export const listShareIDsSelector = createSelector(
  listShareSelector,
  (listShare) => listShare.reduce((prev, cur) => {
    if (cur.share) prev.push(cur?.shareId);
    return prev;
  }, []),
);

export const getDataByShareIdSelector = createSelector(
  listShareSelector,
  (listShare) => (shareId) =>
    listShare.find((item) => item?.shareId === shareId),
);

export const getDataShareByPoolIdSelector = createSelector(
  listShareSelector,
  (listShare) => (poolId) =>
    listShare.find((item) => item?.poolId === poolId),
);

export const totalRewardCollectedSelector = createSelector(
  listShareSelector,
  (listShare) => {
    const rewardUSD = listShare.reduce((prev, cur) => {
      return prev.plus(cur.totalRewardUSD);
    }, new BigNumber('0')).toNumber();
    const originalAmount = convert.toOriginalAmount(rewardUSD, 9, true);
    return format.amountVer2(originalAmount, 9);
  }
);

export const totalContributedUSDSelector = createSelector(
  listShareSelector,
  (listShare) => {
    const principalUSD = listShare.reduce((prev, cur) => {
      return prev.plus(cur.token1USDHuman || 0).plus(cur.token2USDHuman || 0);
    }, new BigNumber('0')).toNumber();
    return format.amountVer2(Math.ceil(new BigNumber(principalUSD).multipliedBy(Math.pow(10, 9)).toNumber()), 9);
  }
);

export const modalDataSelector = createSelector(
  portfolioSelector,
  ({ modal }) => modal
);
