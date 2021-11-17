import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { View } from '@src/components/core';
import srcCopy from '@src/assets/images/new-icons/arrow-down.png';

const styled = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 12,
    height: 8,
  },
});

const ArrowGregDown = (props) => {
  return (
    <View style={styled.container}>
      <Image style={[styled.icon, props?.style]} source={srcCopy} />
    </View>
  );
};

ArrowGregDown.propTypes = {};

export default ArrowGregDown;
