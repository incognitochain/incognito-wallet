import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { View, TouchableOpacity } from '@components/core';
import { compose } from 'recompose';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { withLayout_2 } from '@components/Layout';
import { Header } from '@src/components';
import { VirtualizedList } from 'react-native';
import PairItem from './PairItem';
import styles from './style';
import withTokenSelect from './enhance';

const TokenSelect = ({
  pairs,
}) => {
  const onSelectPair = useNavigationParam('onSelectPair') || _.noop();
  const navigation = useNavigation();
  const selectPair = (token) => {
    onSelectPair(token);
    navigation.goBack();
  };

  const renderPairItem = (data) => {
    const pair = data.item;
    return (
      <TouchableOpacity key={`${pair.token1.symbol}-${pair.token2.symbol}`} onPress={() => selectPair(pair)}>
        <PairItem pair={pair} />
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <Header title="Select pair" />
      <View style={[styles.container]}>
        <VirtualizedList
          data={pairs}
          renderItem={renderPairItem}
          getItem={(data, index) => data[index]}
          getItemCount={data => data.length}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

TokenSelect.propTypes = {
  pairs: PropTypes.array,
};

TokenSelect.defaultProps = {
  pairs: [],
};

export default compose(
  withTokenSelect,
  withLayout_2,
)(TokenSelect);
