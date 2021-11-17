import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Text } from '@src/components/core';
import { COLORS, FONT } from '@src/styles';

const styled = StyleSheet.create({
  hook: {
    marginBottom: 30,
  },
  value: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
    color: COLORS.colorGreyBold,
  },
});

const Hook = (props) => {
  const { value } = props;
  return (
    <View style={styled.hook}>
      <Text style={styled.value}>{value}</Text>
    </View>
  );
};

Hook.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default React.memo(Hook);
