import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Hook } from '@screens/PDexV3/features/Extra';
import { orderLimitDataSelector } from './OrderLimit.selector';
import TabOrderLimitSubError from './OrderLimit.subError';

const styled = StyleSheet.create({
  container: {},
});

const OrderDetails = () => {
  const orderLimitData = useSelector(orderLimitDataSelector);
  // console.log('3333 orderLimitData ', orderLimitData);
  const {
    totalAmountData: { totalStr },
    hideNetworkFee,
    networkfeeAmountStr,
    errorNetworkFee
  } = orderLimitData;

  const factories = [
    {
      label: 'Trading fee',
      value: 'Free',
    },
    {
      label: 'Total',
      value: totalStr,
    },
    hideNetworkFee
      ? undefined
      : {
          label: 'Network Fee',
          value: networkfeeAmountStr,
        },
  ];
  return (
    <View style={styled.container}>
      {factories.map((item) => (
        <Hook {...item} />
      ))}
      {!hideNetworkFee && <TabOrderLimitSubError errorNetworkFee={errorNetworkFee} />}
    </View>
  );
};

OrderDetails.propTypes = {};

export default React.memo(OrderDetails);
