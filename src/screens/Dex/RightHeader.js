import React from 'react';
import PropTypes from 'prop-types';
import { ButtonBasic } from '@components/Button';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

const styles = StyleSheet.create({
  btnStyle: {
    backgroundColor: COLORS.colorGrey,
    height: 40,
    paddingHorizontal: 15,
  },
  hook: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: FONT.NAME.medium,
    fontSize: 15,
    lineHeight: 19,
    color: COLORS.black,
  },
});

const RightHeader = () => {
  const navigation = useNavigation();

  return (
    <ButtonBasic
      title="Balance"
      onPress={() => navigation.navigate(routeNames.InvestBalance)}
      btnStyle={styles.btnStyle}
      customContent={(
        <View style={styles.hook}>
          <Text numberOfLines={1} style={styles.name}>
            Balance
          </Text>
        </View>
      )}
    />
  );
};

RightHeader.propTypes = {
  coins: PropTypes.array.isRequired,
};

export default React.memo(RightHeader);

