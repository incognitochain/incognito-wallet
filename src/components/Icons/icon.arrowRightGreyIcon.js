import React from 'react';
import { Image, StyleSheet } from 'react-native';
import chevronRight from '@src/assets/images/icons/icon_chevron_right.png';

const styled = StyleSheet.create({
  icon: {
    width: 8,
    height: 12,
  },
});

const ArrowRightGreyIcon = (props) => {
  const { style, source, ...rest } = props;
  return <Image source={chevronRight} style={[styled.icon, style]} {...rest} />;
};

export default ArrowRightGreyIcon;
