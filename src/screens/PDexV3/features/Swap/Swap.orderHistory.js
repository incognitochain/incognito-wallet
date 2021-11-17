import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Divider,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
} from '@src/components/core';
import { useDispatch, useSelector } from 'react-redux';
import { Header, Row } from '@src/components';
import { COLORS, FONT } from '@src/styles';
import { useFocusEffect, useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { actionFetchHistory, actionFetchedOrderDetail } from './Swap.actions';
import { swapHistorySelector } from './Swap.selector';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatlist: {
    paddingVertical: 24,
  },
  order: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 5,
    color: COLORS.colorGrey3,
    maxWidth: 200,
  },
  swap: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 5,
    color: COLORS.black,
    marginRight: 15,
    flex: 1,
  },
  statusStr: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
    color: COLORS.colorGreyBold,
  },
  wrapperOrder: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dividerStyled: {
    marginVertical: 16,
  },
  title: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
    color: COLORS.black,
  },
});

const Order = React.memo(({ data, visibleDivider }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  if (!data?.requestTx) {
    return null;
  }
  const { rateStr, statusStr, swapStr, requestTx } = data;
  const handleNavOrderDetail = async () => {
    await dispatch(actionFetchedOrderDetail(data));
    navigation.navigate(routeNames.OrdeSwapDetail);
  };
  return (
    <>
      <TouchableOpacity style={styled.order} onPress={handleNavOrderDetail}>
        <View style={styled.wrapperOrder}>
          <Row style={{ ...styled.row, marginBottom: 4 }}>
            <Text
              style={styled.orderId}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {`#${requestTx}`}
            </Text>
            <Text style={styled.title}>Swap</Text>
          </Row>
          <Row style={styled.row}>
            <Text style={styled.swap}>{swapStr}</Text>
            <Text style={styled.statusStr}>{statusStr}</Text>
          </Row>
        </View>
      </TouchableOpacity>
      {visibleDivider && <Divider dividerStyled={styled.dividerStyled} />}
    </>
  );
});

const OrderHistory = () => {
  const dispatch = useDispatch();
  const onRefresh = () => dispatch(actionFetchHistory());
  const { isFetching, history = [] } = useSelector(swapHistorySelector);
  useFocusEffect(
    React.useCallback(() => {
      dispatch(actionFetchHistory());
    }, []),
  );
  return (
    <View style={styled.container}>
      <Header title="Swap history" />
      <FlatList
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
        }
        data={history}
        keyExtractor={(item) => item?.requestTx}
        renderItem={({ item, index }) => (
          <Order data={item} visibleDivider={index !== history.length - 1} />
        )}
        contentContainerStyle={styled.flatlist}
      />
    </View>
  );
};

OrderHistory.propTypes = {};

export default React.memo(OrderHistory);
