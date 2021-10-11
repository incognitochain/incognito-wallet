import React, {memo} from 'react';
import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import styled from '@screens/PDexV3/features/LiquidityHistories/LiquidityHistories.styled';
import {useSelector} from 'react-redux';
import {liquidityHistorySelector} from '@screens/PDexV3/features/LiquidityHistories/index';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {ActivityIndicator} from '@components/core';
import {EmptyBookIcon} from '@components/Icons';

const Item = React.memo(({ history, isLast }) => {
  const navigation = useNavigation();
  const onNextPress = () => {
    navigation.navigate(routeNames.RemoveLPDetail, { history });
  };
  return (
    <TouchableOpacity style={[styled.wrapperItem, isLast && { marginBottom: 20 }]} onPress={onNextPress}>
      <View style={styled.topRow}>
        <Text style={styled.title}>Remove</Text>
        <Text style={styled.status}>{history?.statusStr}</Text>
      </View>
      <View style={styled.bottomRow}>
        <Text style={styled.desc}>{history?.removeLPAmountDesc}</Text>
      </View>
    </TouchableOpacity>
  );
});

const RemoveLP = () => {
  const isFetching = useSelector(liquidityHistorySelector.isFetchingRemoveLP);
  const histories = useSelector(liquidityHistorySelector.mapRemoveLPData);
  const renderItem = (data) => <Item history={data.item} isLast={data.index === (histories.length - 1)} />;
  const renderContent = () => {
    if (isEmpty(histories) && isFetching) return <View style={{ marginTop: 25 }}><ActivityIndicator /></View>;
    return (
      <View style={{ paddingTop: 20 }}>
        <FlatList
          data={histories}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            <EmptyBookIcon message="Your history is empty" />
          }
        />
      </View>
    );
  };
  return (
    renderContent()
  );
};

Item.propTypes = {
  history: PropTypes.object.isRequired,
  isLast: PropTypes.bool.isRequired
};

export default memo(RemoveLP);

