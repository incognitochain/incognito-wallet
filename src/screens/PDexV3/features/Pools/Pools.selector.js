import { createSelector } from 'reselect';
import format from '@src/utils/format';
import { getPrivacyDataByTokenID as getPrivacyDataByTokenIDSelector } from '@src/redux/selectors/selectedPrivacy';
import { COLORS } from '@src/styles';
import { getExchangeRate } from '@screens/PDexV3';
import BigNumber from 'bignumber.js';
import convert from '@src/utils/convert';
import uniq from 'lodash/uniq';
import isEqual from 'lodash/isEqual';

export const poolsSelector = createSelector(
  (state) => state.pDexV3,
  ({ pools }) => pools,
);

export const tradingVolume24hSelector = createSelector(
  poolsSelector,
  ({ tradingVolume24h }) => format.amountSuffix(tradingVolume24h, 9),
);

export const listPoolsIDsSelector = createSelector(
  poolsSelector,
  ({ listPools }) => listPools.map((pool) => pool.poolId),
);

export const followPoolIdsSelector = createSelector(
  poolsSelector,
  ({ followIds }) => followIds || [],
);

export const listPoolsPureSelector = createSelector(
  poolsSelector,
  ({ listPools }) => listPools,
);

export const poolPairIdsSelector = createSelector(
  listPoolsPureSelector,
  (listPools) => listPools.map((pool) => pool.poolId),
);

export const listPoolsSelector = createSelector(
  listPoolsPureSelector,
  getPrivacyDataByTokenIDSelector,
  followPoolIdsSelector,
  (listPools, getPrivacyDataByTokenID, followIds) => {
    let pools = [];
    try {
      if (listPools.length === 0) {
        return [];
      }
      pools = listPools.map((pool) => {
        const {
          volume,
          priceChange,
          poolId,
          token1Value,
          token2Value,
          apy,
          amp,
          priceChange24H,
          token1Id,
          token2Id,
          virtual1Value,
          virtual2Value,
          price,
        } = pool;
        const volumeOriginal = Math.ceil(
          new BigNumber(volume || 0).multipliedBy(Math.pow(10, 9)),
        );
        const volumeToAmount = format.amountVer2(volumeOriginal, 9);
        const volumeSuffix = format.amountSuffix(volumeOriginal, 9);
        const priceChangeToAmount = format.amountVer2(priceChange, 0);
        const perChange24h = priceChange24H;
        const perChange24hToStr = `${format.toFixed(perChange24h, 2)}%`;
        let perChange24hColor;
        let perChange24hBGColor;
        if (perChange24h > 0) {
          perChange24hColor = COLORS.green;
          perChange24hBGColor = COLORS.green;
        } else if (perChange24h < 0) {
          perChange24hColor = COLORS.red;
          perChange24hBGColor = COLORS.red;
        }
        const token1 = getPrivacyDataByTokenID(token1Id);
        const token2 = getPrivacyDataByTokenID(token2Id);
        let pool1ValueStr = format.amountVer2(
          token1Value,
          token1.pDecimals,
          false,
        );
        let pool2ValueStr = format.amountVer2(token2Value, token2.pDecimals);
        const poolSizeStr = `${pool1ValueStr} ${token1?.symbol} + ${pool2ValueStr} ${token2?.symbol}`;
        const originalPrice = convert.toOriginalAmount(
          price,
          token2?.pDecimals,
          true,
        );
        const priceStr = format.amountVer2(originalPrice, token2?.pDecimals);
        const poolStr = `${token1?.symbol || ''} / ${token2?.symbol || ''}`;

        let networkPairStr = '';
        let poolTitle =  '';
        let isPRVUSDTPair = false;
        if ((token1?.symbol === 'PRV' && token2?.symbol === 'USDT')) {
            poolTitle =  `${token2?.symbol} / ${token1?.symbol}`;
            networkPairStr =  `${token2?.network} / ${token1?.network}`;
            isPRVUSDTPair =  true;
        } else {
            poolTitle =  `${token1?.symbol} / ${token2?.symbol}`;
            networkPairStr =  `${token1?.network} / ${token2?.network}`;
            isPRVUSDTPair = false;
        }

        return {
          ...pool,
          token1,
          token2,
          volumeToAmount,
          priceChangeToAmount,
          perChange24hToStr,
          perChange24hColor,
          perChange24hBGColor,
          isFollowed:
            followIds?.findIndex((_poolId) => poolId === _poolId) > -1 || false,
          poolTitle,
          poolSizeStr,
          exchangeRateStr: getExchangeRate(
            token1,
            token2,
            token1Value,
            token2Value,
          ),
          volumeToAmountStr: `$${volumeToAmount}`,
          volumeSuffix,
          volumeSuffixStr: `${volumeSuffix}$`,
          ampStr: `${amp}`,
          apyStr: `${format.amountVer2(apy, 0)}%`,
          priceChangeToAmountStr: `$${priceChangeToAmount}`,
          virtualValue: {
            [token1Id]: virtual1Value,
            [token2Id]: virtual2Value,
          },
          priceStr,
          poolStr,
          networkPairStr,
          isPRVUSDTPair
        };
      });
    } catch (error) {
      console.log('error-listPoolsSelector', error);
    }
    return pools;
  },
);

export const listPoolsFollowingSelector = createSelector(
  listPoolsSelector,
  (listPools) => listPools.filter((pool) => !!pool?.isFollowed),
);

export const getDataByPoolIdSelector = createSelector(
  listPoolsSelector,
  (listPools) => (poolId) =>
    poolId && listPools.find((pool) => pool?.poolId === poolId),
);

export const isFetchingSelector = createSelector(
  poolsSelector,
  ({ isFetching }) => isFetching,
);

export const defaultPoolSelector = createSelector(
  listPoolsSelector,
  (pools) => pools[0]?.poolId,
);

export const listPoolsVerifySelector = createSelector(
  listPoolsSelector,
  (pools) => pools.filter(({ isVerify }) => !!isVerify),
);

export const findPoolByPairSelector = createSelector(
  listPoolsVerifySelector,
  (pools) =>
    ({ token1Id, token2Id }) =>
      pools.find(({ token1, token2 }) =>
        isEqual([token1?.tokenId, token2?.tokenId], [token1Id, token2Id]),
      ) || pools.find(({ token1 }) => token1?.tokenId === token1Id),
);

export const getAllTokenIDsInPoolsSelector = createSelector(
  listPoolsVerifySelector,
  (pools) =>
    uniq(
      pools.reduce((prev, cur) => {
        const {
          token1: { tokenId: token1ID },
          token2: { tokenId: token2ID },
        } = cur;
        return [...prev, token1ID, token2ID];
      }, []),
    ),
);
