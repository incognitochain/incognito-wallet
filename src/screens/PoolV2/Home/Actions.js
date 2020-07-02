import React from 'react';
import PropTypes from 'prop-types';
import { RoundCornerButton } from '@components/core';
import ROUTE_NAMES from '@routers/routeNames';
import { useNavigation } from 'react-navigation-hooks';
import { Row } from '@src/components/';
import mainStyle from '@screens/PoolV2/style';
import styles from './style';

const Actions = ({
  buy,
  coins,
  data,
  totalRewards,
  displayFullTotalRewards,
}) => {
  const navigation = useNavigation();

  const handleBuy = () => {
    navigation.navigate(ROUTE_NAMES.Trade);
  };

  const handleWithdraw = () => {
    navigation.navigate(ROUTE_NAMES.PoolV2WithdrawSelectCoin, {
      data,
      totalRewards,
      displayFullTotalRewards,
    });
  };

  const handleProvide = () => {
    navigation.navigate(ROUTE_NAMES.PoolV2ProvideSelectCoin, {
      coins
    });
  };

  const provideButton = (
    <RoundCornerButton
      title={buy ? 'Provide now' : 'Provide more'}
      style={[styles.actionButton, mainStyle.button]}
      onPress={handleProvide}
    />
  );
  const buyButton = (
    <RoundCornerButton
      title="Buy crypto"
      style={[styles.actionButton, mainStyle.button]}
      onPress={handleBuy}
    />
  );
  const withdrawButton = (
    <RoundCornerButton
      title="Withdraw"
      style={[styles.actionButton, mainStyle.button]}
      onPress={handleWithdraw}
    />
  );

  return (
    <Row center style={styles.actions}>
      {provideButton}
      {buy ? buyButton : withdrawButton}
    </Row>
  );
};

Actions.propTypes = {
  buy: PropTypes.bool,
  coins: PropTypes.array,
  data: PropTypes.array,
  totalRewards: PropTypes.number,
  displayFullTotalRewards: PropTypes.string,
};

Actions.defaultProps = {
  buy: false,
  coins: [],
  data: [],
  totalRewards: 0,
  displayFullTotalRewards: '',
};

export default React.memo(Actions);
