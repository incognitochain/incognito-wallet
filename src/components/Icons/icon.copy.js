import React from 'react';
import { Image, StyleSheet } from 'react-native';
import srcCopy from '@src/assets/images/icons/copy.png';

const styled = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
  },
});

const IconCopy = props => {
  return <Image style={[styled.container, props?.style]} source={srcCopy} />;
};

IconCopy.propTypes = {};

export default IconCopy;
