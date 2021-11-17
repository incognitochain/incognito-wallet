import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from '@components/core';
import { COLORS, FONT } from '@src/styles';
import PropTypes from 'prop-types';

const BottomView = ({ title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styled.container}>
        <Text style={styled.title}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const styled = StyleSheet.create({
  container: {
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopRightRadius: 8,
    paddingRight: 25
  },
  title: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    color: COLORS.black,
  },
});

BottomView.propTypes = {
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default memo(BottomView);
