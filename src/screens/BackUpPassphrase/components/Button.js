import React from 'react';
import PropTypes from 'prop-types';
import { RoundCornerButton } from '@components/core';
import { StyleSheet } from 'react-native';
import { COLORS } from '@src/styles';

const styles = StyleSheet.create({
  btn: {
    marginBottom: 30,
    backgroundColor: COLORS.black2,
    marginTop: 50,
  },
});

const Button = ({ label, onPress, style, disabled }) => {
  return (
    <RoundCornerButton style={[styles.btn, style]} title={label} onPress={onPress} disabled={disabled} />
  );
};

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  style: {},
  disabled: false,
};

export default Button;

