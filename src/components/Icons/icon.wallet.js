import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { View } from '@src/components/core';
import srcIcon from '@src/assets/images/new-icons/wallet.png';

const styled = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 17.53,
    height: 20,
  },
});

const IconWallet = (props) => {
  return (
    <View style={[styled.container, props?.containerStyle]}>
      <Image style={[styled.icon, props?.style]} source={srcIcon} />
    </View>
  );
};

IconWallet.propTypes = {};

export default IconWallet;
