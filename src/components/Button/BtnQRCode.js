import React from 'react';
import { Image, StyleSheet } from 'react-native';
import QrCodeSrc from '@src/assets/images/icons/qr_code.png';
import { TouchableOpacity } from '@src/components/core';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  icon: {
    width: 20,
    height: 20,
  },
});

const BtnQRCode = ({ source, ...rest }) => {
  return (
    <TouchableOpacity {...rest}>
      <Image style={styled.icon} source={source} />
    </TouchableOpacity>
  );
};

BtnQRCode.defaultProps = {
  source: QrCodeSrc,
};

BtnQRCode.propTypes = {
  source: PropTypes.string,
};

export default BtnQRCode;
