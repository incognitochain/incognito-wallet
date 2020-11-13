import React from 'react';
import PropTypes from 'prop-types';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';
import { COLORS, FONT } from '@src/styles';
import { View } from 'react-native';
import styles from '@screens/DexV2/components/Trade/style';
import { Text } from '@components/core';
import stylesheet from '@screens/DexV2/components/ExtraInfo/style';
import Help from '@components/Help';
import routeNames from '@routers/routeNames';
import helperConst from '@src/constants/helper';
import { useNavigation } from 'react-navigation-hooks';

const colors = {
  'Incognito': COLORS.black,
  'Kyber': COLORS.green,
  'Uniswap': COLORS.pink,
};

const Powered = ({ network }) => {
  if (!network) {
    return null;
  }

  return (
    <ExtraInfo
      left=""
      right={`Powered by ${network}`}
      style={{
        color: colors[network] || COLORS.lightGrey17,
      }}
    />
  );
};

export const PowerTrade = ({ network }) => {
  const navigation = useNavigation();
  if (!network) {
    return null;
  }

  const onHelpPress = () => {
    navigation.navigate(routeNames.Helper, {
      ...helperConst.HELPER_CONSTANT.COMPANY,
      title: network
    });
  };

  return (
    <View style={styles.row}>
      <Text style={[
        stylesheet.text,
        stylesheet.textLeft,
        {
          ...FONT.STYLE.bold,
          color: colors[network] || COLORS.lightGrey17,
          marginRight: 0
        }
      ]}
      >
        {network}
      </Text>
      <Help onPress={onHelpPress} />
    </View>
  );
};

Powered.propTypes = {
  network: PropTypes.string.isRequired,
};

PowerTrade.propTypes = {
  network: PropTypes.string.isRequired,
};

export default Powered;
