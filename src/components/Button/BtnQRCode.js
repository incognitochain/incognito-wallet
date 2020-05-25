import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import QrCodeSrc from '@src/assets/images/icons/qr_code.png';

const styled = StyleSheet.create({
  icon: {
    width: 20,
    height: 20,
  },
});

const BtnQRCode = props => {
  return (
    <TouchableOpacity {...props}>
      <Image style={styled.icon} source={QrCodeSrc} />
    </TouchableOpacity>
  );
};

BtnQRCode.propTypes = {};

export default BtnQRCode;
