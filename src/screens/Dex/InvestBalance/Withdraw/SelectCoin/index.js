import React from 'react';
import PropTypes from 'prop-types';
import { View } from '@components/core';
import mainStyle from '@screens/Dex/style';
import { compose } from 'recompose';
import { withLayout_2 } from '@components/Layout/index';
import ROUTE_NAMES from '@routers/routeNames';
import { useNavigation } from 'react-navigation-hooks';
import { Header, Row } from '@src/components/';
import { COINS } from '@src/constants';
import CoinList from '@screens/Dex/InvestBalance/CoinList';
import withWithdrawCoins from '@screens/Dex/InvestBalance/Withdraw/SelectCoin/data.enhance';
import {IGNORED_ACCOUNTS} from '@screens/Dex/constants';

const SelectCoin = ({
  followingCoins,
}) => {
  const navigation = useNavigation();
  const handleSelect = (coin) => {
    navigation.navigate(ROUTE_NAMES.SelectAccount, {
      onSelect: handleSelectAccount(coin),
      ignoredAccounts: IGNORED_ACCOUNTS,
    });
  };

  const handleSelectAccount = (coin) => () => {
    const prv = followingCoins.find(item => item.id === COINS.PRV_ID);
    navigation.navigate(ROUTE_NAMES.InvestWithdrawInput, {
      coin,
      prvBalance: prv.balance,
    });
  };

  return (
    <View style={mainStyle.flex}>
      <Header title="Withdraw balance" />
      <CoinList coins={followingCoins} onPress={handleSelect} />
    </View>
  );
};

SelectCoin.propTypes = {
  followingCoins: PropTypes.array.isRequired,
};

export default compose(
  withLayout_2,
  withWithdrawCoins,
)(SelectCoin);

