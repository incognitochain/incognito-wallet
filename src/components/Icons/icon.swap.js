import React from 'react';
import { View } from '@src/components/core';
import { Image, StyleSheet } from 'react-native';
import srcSwapIcon from '@src/assets/images/new-icons/swap.png';
import { COLORS } from '@src/styles';

const styled = StyleSheet.create({
  icon: {
    width: '100%',
    height: '100%',
  },
  wrapper: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: 32,
    borderColor: COLORS.colorGrey4,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
});

const SwapIcon = (props) => {
  const { style, source, ...rest } = props;
  return (
    <View style={styled.wrapper}>
      <Image source={srcSwapIcon} style={[styled.icon, style]} {...rest} />
    </View>
  );
};

export default SwapIcon;
