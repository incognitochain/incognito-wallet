import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Hook } from '@screens/PDexV3/features/Extra';
import { FONT, COLORS } from '@src/styles';
import { useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import SelectedPrivacy from '@src/models/selectedPrivacy';
// import { Text } from '@src/components/core';
import {
  feetokenDataSelector,
  swapInfoSelector,
  selltokenSelector,
  getExchangeDataEstimateTradeSelector,
} from './Swap.selector';
// import { KEYS_PLATFORMS_SUPPORTED, platformIdSelectedSelector } from '.';

const styled = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
  text: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
  },
  tradePathRightContainer: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: 20,
  },
  percentContainer: {
    width: 60,
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#404040',
    borderRadius: 4,
    marginLeft: 8,
  },
  tradePathItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export const useTabFactories = () => {
  const swapInfo = useSelector(swapInfoSelector);
  const selltoken: SelectedPrivacy = useSelector(selltokenSelector);
  const feeTokenData = useSelector(feetokenDataSelector);
  const currentExchangeData = useSelector(getExchangeDataEstimateTradeSelector);

  const priceImpactDecorator = (priceImpactValue) => {
    if (priceImpactValue >= 15) return COLORS.red;
    if (priceImpactValue >= 5) return COLORS.lightOrange;
    return COLORS.white;
  };

  const hooksFactories = React.useMemo(() => {
    let result = [
      {
        label: `${selltoken?.symbol || ''} Balance`,
        value: swapInfo?.balanceStr,
      },
      {
        label: 'Minimum received',
        value: currentExchangeData
          ? currentExchangeData.minimumReceived
          : undefined,
      },
      {
        label: 'Rate',
        value: feeTokenData?.rateStr,
      },
      {
        label: 'Trade path',
        value: feeTokenData?.tradePathStr,
        valueNumberOfLine: 10,
        // customValue:
        //   platformId === KEYS_PLATFORMS_SUPPORTED.uni
        //     ? renderTradePath()
        //     : null,
        customValue: null,
      },
      {
        label: 'Price impact',
        value: `${feeTokenData?.impactAmountStr}%`,
        customStyledValue: {
          color: priceImpactDecorator(parseFloat(feeTokenData.impactAmount)),
        },
      },
    ];
    if (feeTokenData.isMainCrypto) {
      result.push({
        label: 'Fee',
        value: feeTokenData?.totalFeePRVText ?? '',
      });
    } else {
      result.push({
        label: 'Fee',
        value: feeTokenData?.feeAmountText ?? '',
      });
    }
    return result.filter((hook) => !isEmpty(hook) && !!hook?.value);
  }, [swapInfo, feeTokenData, currentExchangeData]);
  return {
    hooksFactories,
  };
};

const TabSimple = React.memo(() => {
  const { hooksFactories } = useTabFactories();
  return (
    <View style={styled.container}>
      {hooksFactories.map((item) => (
        <Hook {...item} key={item.label} />
      ))}
    </View>
  );
});

export default React.memo(TabSimple);
