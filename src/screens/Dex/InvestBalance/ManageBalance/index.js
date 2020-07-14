import React from 'react';
import PropTypes from 'prop-types';
import { View, RoundCornerButton } from '@components/core/index';
import mainStyle from '@screens/Dex/style';
import { compose } from 'recompose';
import { withLayout_2 } from '@components/Layout/index';
import withDefaultAccount from '@components/Hoc/withDefaultAccount';
import { Header, Row } from '@src/components/';
import withDexAccounts from '@screens/Dex/dexAccount.enhance';
import withBalance from '@screens/Dex/InvestBalance/balance.enhance';
import { useNavigation } from 'react-navigation-hooks';
import CoinList from '@screens/Dex/InvestBalance/CoinList';
import routeNames from '@routers/routeNames';
import withFollowingCoins from '@screens/Dex/InvestBalance/followingCoin.enhance';

const ManageBalance = ({
  followingCoins
}) => {
  const navigation = useNavigation();

  const handleTopUp = () => {
    navigation.navigate(routeNames.InvestTopUp);
  };

  const handleWithdraw = () => {
    navigation.navigate(routeNames.InvestWithdraw, {
      followingCoins: followingCoins.filter(coin => coin.balance),
    });
  };

  return (
    <View style={mainStyle.flex}>
      <Header title="Manage Balance" />
      <View style={mainStyle.coinContainer}>
        <Row spaceBetween>
          <RoundCornerButton
            style={[mainStyle.flex, mainStyle.button, mainStyle.margin]}
            title="Top up"
            onPress={handleTopUp}
          />
          <RoundCornerButton
            style={[mainStyle.flex, mainStyle.button, mainStyle.margin]}
            title="Withdraw"
            onPress={handleWithdraw}
            disabled={followingCoins.some(coin => !coin.displayBalance)}
          />
        </Row>
        <CoinList coins={followingCoins} />
      </View>
    </View>
  );
};

ManageBalance.propTypes = {
  followingCoins: PropTypes.array.isRequired,
};

export default compose(
  withLayout_2,
  withDefaultAccount,
  withDexAccounts,
  withFollowingCoins,
  withBalance,
)(ManageBalance);

