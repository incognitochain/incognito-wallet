import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import srcIcon from '@assets/images/icons/token_verified.png';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 16,
    height: 16,
  },
});

const TokenVerified = ({ style, containerStyled, sourceIcon }) => {
  return (
    <View style={[styled.container, containerStyled]}>
      <Image style={[styled.icon, style]} source={sourceIcon} />
    </View>
  );
};

TokenVerified.defaultProps = {
  style: null,
  containerStyled: null,
  sourceIcon: srcIcon,
};

TokenVerified.propTypes = {
  style: PropTypes.object,
  containerStyled: PropTypes.object,
  sourceIcon: PropTypes.string,
};

export default TokenVerified;
