import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Hook } from '@screens/PDexV3/features/Extra';
import { useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import {
  feetokenDataSelector,
  swapInfoSelector,
  selltokenSelector,
} from './Swap.selector';

const styled = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
});

export const useTabFactories = () => {
  const swapInfo = useSelector(swapInfoSelector);
  const selltoken: SelectedPrivacy = useSelector(selltokenSelector);
  const feeTokenData = useSelector(feetokenDataSelector);
  const hooksFactories = React.useMemo(() => {
    let result = [
      {
        label: `${selltoken?.symbol} Balance`,
        value: swapInfo?.balanceStr,
      },
      swapInfo?.showPRVBalance
        ? {
          label: 'PRV Balance',
          value: swapInfo?.prvBalanceStr ?? '',
        }
        : {},
    ];
    if (feeTokenData.isMainCrypto) {
      result.push({
        label: 'Fee',
        value: feeTokenData?.totalFeePRVText ?? '',
        hasQuestionIcon: true,
        onPressQuestionIcon: () => null,
      });
    } else {
      result.push(
        {
          label: 'Trading fee',
          value: feeTokenData?.feeAmountText ?? '',
          hasQuestionIcon: true,
          onPressQuestionIcon: () => null,
        },
        {
          label: 'Network fee',
          value: swapInfo?.networkfeeAmountStr ?? '',
          hasQuestionIcon: true,
          onPressQuestionIcon: () => null,
        },
      );
    }
    return result.filter((hook) => !isEmpty(hook));
  }, [swapInfo]);
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
