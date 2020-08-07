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
import withDefaultAccount from '@components/Hoc/withDefaultAccount';
import withFollowingCoins from '@screens/Dex/InvestBalance/followingCoin.enhance';
import withBalance from '@screens/Dex/InvestBalance/balance.enhance';
import CoinList from '@screens/Dex/InvestBalance/CoinList';
import { IGNORED_ACCOUNTS } from '@screens/Dex/constants';
import Toast from '@components/core/Toast/Toast';

const SelectCoin = ({
  followingCoins,
  account,
}) => {
  const navigation = useNavigation();
  const handleSelect = (coin) => {
    if (IGNORED_ACCOUNTS.includes(account.name.toLowerCase())) {
      return Toast.showInfo('Please select another account to top up your pDEX', { duration: 10000 });
    }

    const prv = followingCoins.find(item => item.id === COINS.PRV_ID);
    navigation.navigate(ROUTE_NAMES.InvestTopUpInput, {
      coin,
      prvBalance: prv.balance,
    });
  };

  return (
    <View style={mainStyle.flex}>
      <Header title="Top up balance" accountSelectable ignoredAccounts={IGNORED_ACCOUNTS} />
      <CoinList
        coins={followingCoins}
        onPress={handleSelect}
      />
    </View>
  );
};

SelectCoin.propTypes = {
  followingCoins: PropTypes.array.isRequired,
  account: PropTypes.object.isRequired,
};

export default compose(
  withLayout_2,
  withDefaultAccount,
  withFollowingCoins,
  withBalance,
)(SelectCoin);

