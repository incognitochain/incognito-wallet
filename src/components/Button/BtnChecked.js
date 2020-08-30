import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { CheckedIcon } from '@src/components/Icons';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  btnStyle: {},
});

const BtnBack = (props) => {
  const { btnStyle, checked, ...rest } = props;
  return (
    <TouchableOpacity style={[styled.btnStyle, btnStyle]} {...rest}>
      <CheckedIcon checked={checked} />
    </TouchableOpacity>
  );
};

BtnBack.defaultProps = {
  btnStyle: null,
};

BtnBack.propTypes = {
  btnStyle: PropTypes.any,
  checked: PropTypes.bool.isRequired,
};

export default BtnBack;
