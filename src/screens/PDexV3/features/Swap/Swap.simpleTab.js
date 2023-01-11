import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Hook } from '@screens/PDexV3/features/Extra';
import { FONT, COLORS } from '@src/styles';
import { useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { Text } from '@src/components/core';
import { mapperIcon } from '@components/SelectOption/SelectOption.modalSelectItem';
import { KEYS_PLATFORMS_SUPPORTED } from '@screens/PDexV3/features/Swap/Swap.constant';
import {
  feetokenDataSelector,
  swapInfoSelector,
  selltokenSelector,
  getExchangeDataEstimateTradeSelector, buytokenSelector,
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
  dot: {
    width: 5,
    height: 5,
    borderRadius: 5 / 2,
    backgroundColor: 'white',
  },
  containerMsg: {
    // backgroundColor: '#404040',
    // paddingHorizontal: 16,
    // paddingVertical: 12,
    borderRadius: 8,
    marginTop: 32
  },
  interMsg: {
    fontSize: 13, lineHeight: 20
  }
});

export const getInterSwapTradePath = (data) => {
  let icon1, icon2, path1Str, path2Str, customElm1, customElm2, pAppName1, pAppName2, hooks;
  const { interPath } = data;
  if (interPath && interPath.pAppName) {
    const { tradePath1, tradePath2, fistBatchIsPDex, pAppName } = interPath;
    if (tradePath1 && tradePath2) {
      icon1 = mapperIcon({ id: fistBatchIsPDex
            ? KEYS_PLATFORMS_SUPPORTED.incognito
            : pAppName
      });
      const formatPAppName = pAppName.charAt(0).toUpperCase() + pAppName.slice(1);
      pAppName1 = fistBatchIsPDex ? 'Incognito Exchange' : formatPAppName;
      pAppName2 = !fistBatchIsPDex ? 'Incognito Exchange' : formatPAppName;
      path1Str = tradePath1;
      customElm1 = (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 1 }}>
          {icon1 && icon1}
          <Text style={{ color: 'white', fontWeight: '500', marginLeft: 12 }}>{tradePath1}</Text>
        </View>
      );
      icon2 = mapperIcon({ id: fistBatchIsPDex
            ? pAppName
            : KEYS_PLATFORMS_SUPPORTED.incognito
      });
      path2Str = tradePath2;
      customElm2 = (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 1 }}>
          {icon2 && icon2}
          <Text style={{ color: 'white', fontWeight: '500', marginLeft: 12 }}>{tradePath2}</Text>
        </View>
      );
       hooks = [
        {
          label: 'Trade path',
          customStyledLabel: { color: 'white' },
          value: path1Str,
          customValue: customElm1,
        },
        {
          label: '',
          value: path2Str,
          customValue: customElm2,
          customStyledLabel: { color: 'white' },
        }
      ];
    }
  } else if (data?.tradePathStr) {
    hooks = [
      {
        label: 'Trade path',
        value: data?.tradePathStr,
        valueNumberOfLine: 10,
        customValue: null,
        customStyledLabel: { color: 'white' },
      },
    ];
  }
  return {
    icon1,
    icon2,
    path1Str,
    path2Str,
    customElm1,
    customElm2,
    pAppName1,
    pAppName2,
    hooks
  };
};

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
    ];

    const { impactAmountStr } = feeTokenData;
    if (impactAmountStr && impactAmountStr !== '0') {
      result.push({
        label: 'Price impact',
        value: `${feeTokenData?.impactAmountStr}%`,
        customStyledValue: {
          color: priceImpactDecorator(parseFloat(feeTokenData.impactAmount)),
        },
      });
    }
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
      result.push({
        label: 'Network Fee',
        value: swapInfo?.networkfeeAmountStr || 0,
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

export const InterSwapMsg = React.memo(() => {
  const feeTokenData = useSelector(feetokenDataSelector);
  const interPath = getInterSwapTradePath(feeTokenData);
  if (!interPath || !interPath.path1Str || !interPath.path2Str) return null;
  return (
    <View style={styled.containerMsg}>
      <Text style={styled.interMsg}>
        The swap is performed among liquidity pools ({interPath.path1Str} with {interPath.pAppName1} then {interPath.path2Str} with {interPath.pAppName2}). USDT will be returned to your wallet if the swap fails for any reason.
      </Text>
    </View>
  );
});

export default React.memo(TabSimple);
