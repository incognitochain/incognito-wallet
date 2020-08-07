import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from '@components/core';
import { Row } from '@src/components';
import styles from './style';

const PairItem = ({ pair }) => {
  return (
    <View style={styles.pairItem}>
      <Row spaceBetween>
        <Text style={styles.pairName}>{pair.token1.symbol}  - {pair.token2.symbol}</Text>
        <Text style={styles.pairShare}>{pair.sharePercentDisplay}</Text>
      </Row>
    </View>
  );
};

PairItem.propTypes = {
  pair: PropTypes.object.isRequired,
};

export default PairItem;
