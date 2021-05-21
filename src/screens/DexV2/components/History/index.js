/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { View, Text, TouchableOpacity } from '@components/core';
import { withLayout_2 } from '@components/Layout';
import Header from '@components/Header/index';
import { FlatList } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import ROUTE_NAMES from '@routers/routeNames';
import withPairs from '@screens/DexV2/components/pdexPair.enhance';
import withAccount from '@screens/DexV2/components/account.enhance';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { ArrowRightGreyIcon } from '@components/Icons';
import styleSheet from '@components/HistoryList/style';
import styles from './style';
import withHistories from '../histories.enhance';

const History = ({
  histories,
  refreshing,
  isLoadMore,
  onReloadHistories,
  onLoadMoreHistories,
}) => {
  const detectRef = React.useRef(null);
  const navigation = useNavigation();
  const viewDetail = (item) => {
    navigation.navigate(ROUTE_NAMES.TradeHistoryDetail, { history: item });
  };

  // eslint-disable-next-line react/prop-types
  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity key={item.id} style={styles.historyItem} onPress={() => viewDetail(item)}>
      <View style={styles.rowCenter}>
        <Text style={styles.buttonTitle}>{item.type}</Text>
        <Text numberOfLines={1} ellipsizeMode="middle" style={[styles.content, styles.txHash]}>
          #{item.id}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.content, styles.ellipsis]} numberOfLines={1}>{item.description}</Text>
        <View style={[styles.row, styles.center]}>
          <Text style={styles.content} numberOfLines={1}>{item.status}</Text>
          <ArrowRightGreyIcon style={{ marginLeft: 10 }} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <Header title="pDEX" />
      <Text style={[styles.buttonTitle, styles.historyTitle]}>Order history</Text>
      <View style={styles.wrapper}>
        {histories.length ? (
          <FlatList
            data={histories}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => `${index}`}
            onScroll={() => detectRef.current = true}
            refreshing={refreshing}
            showsVerticalScrollIndicator={false}
            onRefresh={() => {
              if (typeof onReloadHistories === 'function') {
                onReloadHistories();
              }
            }}
            onEndReachedThreshold={0.7}
            onEndReached={() => {
              if(typeof onLoadMoreHistories === 'function' && detectRef.current) {
                onLoadMoreHistories();
              }
            }}
            ListFooterComponent={
              isLoadMore ? (
                <View style={styleSheet.loadingContainer}>
                  <LoadingContainer />
                </View>
              ) : null
            }
          />
        ) : <LoadingContainer /> }
      </View>
    </View>
  );
};

History.propTypes = {
  histories: PropTypes.array,
  refreshing: PropTypes.bool,
  isLoadMore: PropTypes.bool,
};

History.defaultProps = {
  histories: null,
  refreshing: false,
  isLoadMore: false
};

export default compose(
  withLayout_2,
  withPairs,
  withAccount,
  withHistories,
)(History);
