import { createSelector } from 'reselect';
import BigNumber from 'bignumber.js';
import { getDataByPoolIdSelector } from '@screens/PDexV3/features/Pools';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { COLORS } from '@src/styles';
import orderBy from 'lodash/orderBy';
import moment from 'moment';
import format from '@src/utils/format';
import convert from '@src/utils/convert';
import { mappingOrderBook } from './Chart.utils';

export const chartSelector = createSelector(
  (state) => state.pDexV3.chart,
  (chart) => chart,
);

export const poolSelectedSelector = createSelector(
  chartSelector,
  getDataByPoolIdSelector,
  ({ poolid }, getDataByPoolId) => getDataByPoolId(poolid),
);

export const priceHistorySelector = createSelector(
  chartSelector,
  poolSelectedSelector,
  ({ priceHistory, poolid }, pool) => {
    const { data, period } = priceHistory;
    const size = data.length;
    const space = 4;
    const xSpace = Math.ceil(size / space);
    const token2: SelectedPrivacy = pool?.token2;
    let history = data.map(({ open, close, timestamp }, index) => {
      const x = timestamp;
      const isBeforeCurDate = moment(x).isBefore(moment(), 'date');
      const y = new BigNumber(open)
        .plus(close)
        .dividedBy(2)
        .abs()
        .toNumber();
      const yOriginalAmount = convert.toOriginalAmount(
        y,
        token2?.pDecimals,
        true,
      );
      const yFormat = format.amountFull(
        yOriginalAmount,
        token2?.pDecimals,
        true,
      );
      let xFormat = '';
      let _xFormat = '';
      let xVisible = index % xSpace === 0;
      switch (period) {
      case '15m':
      case '1h':
      case '4h':
        xFormat = format.formatDateTime(x, 'HH:mm');
        break;
      case '1d':
        xFormat = format.formatDateTime(x, 'DD/MM/YY');
        break;
      case 'W':
        xFormat = format.formatDateTime(x, 'DD/MM/YY');
        break;
      case 'M':
        xFormat = format.formatDateTime(x, 'MM/YY');
        break;
      case 'Y':
        xFormat = format.formatDateTime(x, 'YYYY');
        break;
      default:
        xFormat = format.formatDateTime(x, '');
        break;
      }
      _xFormat = xFormat;
      switch (period) {
      case '15m':
      case '1h':
      case '4h':
        isBeforeCurDate
          ? (_xFormat = format.formatDateTime(x, 'DD/MM HH:mm'))
          : false;
        break;
      default:
        break;
      }
      return {
        x,
        y,
        xFormat,
        yFormat,
        xVisible,
        _xFormat,
      };
    });
    return {
      ...priceHistory,
      poolid,
      history,
    };
  },
);

export const priceHistoryCandlesSelector = createSelector(
  chartSelector,
  poolSelectedSelector,
  ({ priceHistory }, pool) => {
    const { data } = priceHistory;
    let history = data.map(({ timestamp, ...rest }) => ({
      ...rest,
      time: timestamp,
    }));
    return {
      history,
      pool,
    };
  },
);

export const orderBookSelector = createSelector(
  chartSelector,
  poolSelectedSelector,
  ({ orderBook }, pool) => {
    const token1: SelectedPrivacy = pool?.token1;
    const token2: SelectedPrivacy = pool?.token2;
    const { data } = orderBook;
    const { buy = [], sell = [] } = data;
    const _buy = orderBy(
      mappingOrderBook({ data: buy, token1, token2, isBuy: true }).map((o) => ({
        ...o,
        color: COLORS.green,
      })),
      'price',
      'desc',
    );
    const _sell = orderBy(
      mappingOrderBook({ data: sell, token1, token2, isSell: true }).map(
        (o) => ({
          ...o,
          color: COLORS.red,
        }),
      ),
      'price',
      'asc',
    );
    return {
      ...orderBook,
      buy: _buy,
      sell: _sell,
      poolid: pool?.poolId,
    };
  },
);

export const detailsSelector = createSelector(
  poolSelectedSelector,
  (pool) => {
    const {
      volumeToAmountStr,
      poolSizeStr,
    } = pool;
    const factories = [
      {
        label: 'Trading volume',
        value: volumeToAmountStr,
      },
      {
        label: 'Pool size',
        value: poolSizeStr,
      },
    ];
    return {
      factories,
    };
  },
);
