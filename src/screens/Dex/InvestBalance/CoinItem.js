import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { Text, ActivityIndicator, TouchableOpacity } from '@components/core/index';
import mainStyle from '@screens/Dex/style';
import { Row } from '@src/components/';
import { useSelector } from 'react-redux';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { COLORS, FONT, UTILS } from '@src/styles';

const styles = StyleSheet.create({
  coin: {
    marginTop: -UTILS.heightScale(20),
    marginBottom: UTILS.heightScale(25),
    color: COLORS.lightGrey16,
    ...FONT.STYLE.medium,
    fontSize: 16,
  }
});

const CoinItem = ({
  coin,
  onPress,
}) => {
  const token = useSelector(state => selectedPrivacySeleclor.getPrivacyDataByTokenID(state)(coin.id));
  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(coin)}
      disabled={coin.balance === 0}
      style={onPress && coin.balance === 0 ? mainStyle.disabled : null}
    >
      <Row
        key={coin.id}
        spaceBetween
        style={mainStyle.coin}
      >
        <Text style={mainStyle.coinName}>{coin.name}</Text>
        {coin.displayClipBalance ?
          <Text style={mainStyle.coinName}>{coin.displayClipBalance}</Text> :
          <ActivityIndicator />
        }
      </Row>
      <Text style={styles.coin}>{coin.symbol} ({token.networkName})</Text>
    </TouchableOpacity>
  );
};

CoinItem.propTypes = {
  coin: PropTypes.object.isRequired,
  onPress: PropTypes.func,
};

CoinItem.defaultProps = {
  onPress: undefined,
};

export default CoinItem;

