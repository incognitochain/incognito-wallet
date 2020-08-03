/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { compose } from 'recompose';
import { View, Text, TouchableOpacity, ActivityIndicator } from '@components/core';
import { withLayout_2 } from '@components/Layout';
import Header from '@components/Header/index';
import { VirtualizedList } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import ROUTE_NAMES from '@routers/routeNames';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { LIMIT } from '@screens/DexV2/constants';
import { ArrowRightGreyIcon } from '@components/Icons';
import withHistories from '@screens/PoolV2/histories.enhance';
import withDefaultAccount from '@components/Hoc/withDefaultAccount';
import styles from './style';

const History = ({
  histories,
  isLoadingHistories,
  onReloadHistories,
  onLoadMoreHistories,
  isLoadingMoreHistories,
}) => {
  const navigation = useNavigation();
  const viewDetail = (item) => {
    navigation.navigate(ROUTE_NAMES.PoolV2HistoryDetail, { history: item });
  };

  // eslint-disable-next-line react/prop-types
  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity key={item.id} style={styles.historyItem} onPress={() => viewDetail(item)}>
      <Text style={styles.buttonTitle}>{item.type}</Text>
      <View style={styles.row}>
        <Text style={[styles.content, styles.ellipsis]} numberOfLines={1}>{item.description}</Text>
        <View style={[styles.row, styles.center, styles.status]}>
          <Text style={[styles.content]} numberOfLines={1}>{item.status}</Text>
          <ArrowRightGreyIcon style={{ marginLeft: 10 }} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => isLoadingMoreHistories ?
    <ActivityIndicator /> : null;


  return (
    <View style={styles.wrapper}>
      <Header title="Provider history" />
      <View style={[styles.wrapper, styles.historyTitle]}>
        {histories.length ? (
          <VirtualizedList
            data={histories}
            renderItem={renderHistoryItem}
            getItem={(data, index) => data[index]}
            getItemCount={data => data.length}
            refreshing={isLoadingHistories}
            onRefresh={onReloadHistories}
            keyExtractor={(item, index) => `list-item-${index}`}
            onEndReached={(histories || []).length >= LIMIT ? onLoadMoreHistories : _.noop}
            onEndReachedThreshold={0.1}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            ListFooterComponent={renderFooter}
          />
        ) : <LoadingContainer /> }
      </View>
    </View>
  );
};

History.propTypes = {
  histories: PropTypes.array,
  isLoadingHistories: PropTypes.bool,
  isLoadingMoreHistories: PropTypes.bool,
};

History.defaultProps = {
  histories: null,
  isLoadingHistories: false,
  isLoadingMoreHistories: false,
};

export default compose(
  withLayout_2,
  withDefaultAccount,
  withHistories,
)(History);
