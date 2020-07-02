import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, ScrollView, TouchableOpacity } from '@components/core';
import mainStyle from '@screens/PoolV2/style';
import { compose } from 'recompose';
import { withLayout_2 } from '@components/Layout/index';
import withCoinsData from '@screens/PoolV2/Withdraw/SelectCoin/coins.enhance';
import withDefaultAccount from '@components/Hoc/withDefaultAccount';
import ROUTE_NAMES from '@routers/routeNames';
import { useNavigation } from 'react-navigation-hooks';
import { Header, Row } from '@src/components/';
import { COINS } from '@src/constants';

const SelectCoin = ({
  coins,
  totalRewards,
  displayFullTotalRewards,
}) => {
  const navigation = useNavigation();

  const handleWithdrawReward = () =>{
    navigation.navigate(ROUTE_NAMES.PoolV2WithdrawRewards, {
      totalRewards,
      displayFullTotalRewards,
    });
  };

  const handleSelect = (coin) => {
    navigation.navigate(ROUTE_NAMES.PoolV2WithdrawProvision, {
      coin
    });
  };

  const prv = COINS.PRV;

  return (
    <View style={mainStyle.flex}>
      <Header title="Withdraw" />
      <ScrollView style={mainStyle.coinContainer}>
        <TouchableOpacity
          style={[mainStyle.coin, !totalRewards && mainStyle.disabled]}
          onPress={handleWithdrawReward}
          disabled={!totalRewards}
        >
          <Row spaceBetween>
            <Text style={mainStyle.coinName}>{prv.symbol}</Text>
            <Text style={mainStyle.coinName}>{displayFullTotalRewards}</Text>
          </Row>
          <Text style={mainStyle.coinExtra}>Rewards</Text>
        </TouchableOpacity>
        {coins.map(coin => (
          <TouchableOpacity
            key={coin.id}
            style={[mainStyle.coin, !coin.balance && mainStyle.disabled]}
            onPress={() => handleSelect(coin)}
            disabled={!coin.balance}
          >
            <Row spaceBetween>
              <Text style={mainStyle.coinName}>{coin.symbol}</Text>
              <Text style={mainStyle.coinName}>{coin.displayBalance}</Text>
            </Row>
            <Text style={mainStyle.coinExtra}>Provision</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

SelectCoin.propTypes = {
  coins: PropTypes.array.isRequired,
  displayFullTotalRewards: PropTypes.string.isRequired,
  totalRewards: PropTypes.number.isRequired,
};

export default compose(
  withLayout_2,
  withDefaultAccount,
  withCoinsData,
)(SelectCoin);

