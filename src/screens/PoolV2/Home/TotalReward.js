import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from '@components/core';
import HelpIcon from '@components/HelpScreen/Icon';
import ROUTE_NAMES from '@routers/routeNames';
import { Row } from '@src/components/';
import PRVSymbol from '@components/PRVSymbol';
import styles from './style';

const TotalReward = ({
  total,
}) => {
  return (
    <View>
      <Row center style={styles.rewards}>
        <Text>
          <PRVSymbol style={styles.symbol} />&nbsp;
          <Text style={styles.amount}>{total}</Text>
        </Text>
      </Row>
      <Row center>
        <Text style={[styles.center, styles.rateStyle]}>Compounding Rewards</Text>
        <HelpIcon screen={ROUTE_NAMES.PoolV2Help} style={styles.icon} />
      </Row>
    </View>
  );
};

TotalReward.propTypes = {
  total: PropTypes.string.isRequired,
};

export default React.memo(TotalReward);
