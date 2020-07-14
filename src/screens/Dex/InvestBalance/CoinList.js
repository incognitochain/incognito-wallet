import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from '@components/core/index';
import mainStyle from '@screens/Dex/style';
import CoinItem from '@screens/Dex/InvestBalance/CoinItem';

const CoinList = ({
  coins,
  onPress,
}) => {
  return (
    <ScrollView style={mainStyle.coinContainer}>
      {coins.map(coin => (
        <CoinItem coin={coin} key={coin.id} onPress={onPress} />
      ))}
    </ScrollView>
  );
};

CoinList.propTypes = {
  coins: PropTypes.array.isRequired,
  onPress: PropTypes.func,
};

CoinList.defaultProps = {
  onPress: undefined,
};

export default CoinList;

