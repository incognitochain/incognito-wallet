import React from 'react';
import { Image, StyleSheet } from 'react-native';
import srcIcon from '@assets/images/icons/token_verified.png';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  container: {
    width: 14,
    height: 14,
  },
});

const TokenVerified = ({ style }) => {
  return <Image style={[styled.container, style]} source={srcIcon} />;
};

TokenVerified.defaultProps = {
  style: null,
};

TokenVerified.propTypes = {
  style: PropTypes.object,
};

export default TokenVerified;
