/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { compose } from 'recompose';
import { View, Text, TouchableOpacity } from '@components/core';
import { withLayout_2 } from '@components/Layout';
import Header from '@components/Header/index';
import { VirtualizedList } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import ROUTE_NAMES from '@routers/routeNames';
import withPairs from '@screens/DexV2/components/pdexPair.enhance';
import withAccount from '@screens/DexV2/components/account.enhance';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { LIMIT } from '@screens/DexV2/constants';
import withOldHistories from '@screens/DexV2/components/oldHistories.enhance';
import { ArrowRightGreyIcon } from '@components/Icons';
import styles from './style';
import withHistories from '../histories.enhance';

const History = ({
  histories,
  oldHistories,
  isLoadingHistories,
  onReloadHistories,
  onLoadMoreHistories,
}) => {
  const navigation = useNavigation();
  const viewDetail = (item) => {
    navigation.navigate(ROUTE_NAMES.TradeHistoryDetail, { history: item });
  };

  // eslint-disable-next-line react/prop-types
  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity key={item.id} style={styles.historyItem} onPress={() => viewDetail(item)}>
      <Text style={styles.buttonTitle}>{item.type}   <Text style={styles.content}>#{item.id}</Text></Text>
      <View style={styles.row}>
        <Text style={[styles.content, styles.ellipsis]} numberOfLines={1}>{item.description}</Text>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.content} numberOfLines={1}>{item.status}</Text>
          <ArrowRightGreyIcon style={{ marginLeft: 10 }} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const allHistories = histories.concat(oldHistories);

  return (
    <View style={styles.wrapper}>
      <Header title="pDEX" />
      <Text style={[styles.buttonTitle, styles.historyTitle]}>Order history</Text>
      <View style={styles.wrapper}>
        {allHistories.length ? (
          <VirtualizedList
            data={allHistories}
            renderItem={renderHistoryItem}
            getItem={(data, index) => data[index]}
            getItemCount={data => data.length}
            refreshing={isLoadingHistories}
            onRefresh={onReloadHistories}
            onEndReached={(histories || []).length >= LIMIT ? onLoadMoreHistories : _.noop}
            onEndReachedThreshold={0.1}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
        ) : <LoadingContainer /> }
      </View>
    </View>
  );
};

History.propTypes = {
  histories: PropTypes.array,
  oldHistories: PropTypes.array,
  isLoadingHistories: PropTypes.bool,
};

History.defaultProps = {
  histories: null,
  oldHistories: null,
  isLoadingHistories: false,
};

export default compose(
  withLayout_2,
  withPairs,
  withAccount,
  withHistories,
  withOldHistories,
)(History);
