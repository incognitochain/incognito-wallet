import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Hook } from '@screens/PDexV3/features/Extra';
import { orderLimitDataSelector } from './OrderLimit.selector';

const styled = StyleSheet.create({
  container: {
  },
});

const OrderDetails = () => {
  const orderLimitData = useSelector(orderLimitDataSelector);
  const {
    totalAmountData: { totalStr },
    balanceStr
  } = orderLimitData;
  const factories = [
    {
      label: 'Balance',
      value: balanceStr,
    },
    {
      label: 'Trading fee',
      value: 'Free',
    },
    {
      label: 'Total',
      value: totalStr,
    },
  ];
  return (
    <View style={styled.container}>
      {factories.map((item) => (
        <Hook {...item} />
      ))}
    </View>
  );
};

OrderDetails.propTypes = {};

export default React.memo(OrderDetails);
