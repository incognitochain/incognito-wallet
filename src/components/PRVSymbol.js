import React from 'react';
import PropTypes from 'prop-types';
import { Text } from '@components/core';
import { CONSTANT_COMMONS } from '@src/constants';
import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

const styles = StyleSheet.create({
  symbol: {
    fontSize: 18,
    color: COLORS.newGrey,
  },
  font: {
    fontFamily: FONT.NAME.specialRegular,
  },
});


const PRVSymbol = ({ style }) => (
  <Text style={[styles.symbol, style, styles.font]}>{CONSTANT_COMMONS.PRV_SPECIAL_SYMBOL}</Text>
);

PRVSymbol.propTypes = {
  style: PropTypes.object,
};

PRVSymbol.defaultProps = {
  style: null,
};

export default PRVSymbol;
