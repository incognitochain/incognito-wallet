import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@src/components/core';
// import { colorsSelector } from '@src/theme';
import { COLORS, FONT } from '@src/styles';
import { MESSAGES } from '@src/constants';

const styled = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 0,
  },
  text: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
    color: COLORS.red,
    marginRight: 5,
  },
});

const TabOrderLimitSubError = ({errorNetworkFee}) => {
  if (!errorNetworkFee) return null;
  return (
    <View style={styled.container}>
      <Text style={styled.text}>{MESSAGES.PRV_NOT_ENOUGHT}</Text>
    </View>
  );
};

TabOrderLimitSubError.propTypes = {};

export default TabOrderLimitSubError;
