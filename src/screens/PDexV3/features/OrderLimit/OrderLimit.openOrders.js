import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { FlatList, RefreshControl } from '@src/components/core';
import Extra from '@screens/PDexV3/features/Extra';
import { openOrdersSelector } from './OrderLimit.selector';
import Order from './OrderLimit.order';

const styled = StyleSheet.create({
  container: {},
});

const OpenOrders = () => {
  const { history = [], isFetching } = useSelector(openOrdersSelector);
  return (
    <View style={styled.container}>
      <Extra title="Open orders" />
      <FlatList
        refreshControl={<RefreshControl refreshing={isFetching} />}
        data={history}
        keyExtractor={(item) => item?.requestTx}
        renderItem={({ item, index }) => (
          <Order data={item} visibleDivider={index !== history.length - 1} />
        )}
      />
    </View>
  );
};

OpenOrders.propTypes = {};

export default React.memo(OpenOrders);
