import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { CircleBack } from '@src/components/Icons';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  btnStyle: {
    width: 34,
    height: 34,
    justifyContent: 'center',
  },
});

const BtnCircleBack = props => {
  const { btnStyle } = props;
  return (
    <TouchableOpacity style={[styled.btnStyle, btnStyle]} {...props}>
      <CircleBack />
    </TouchableOpacity>
  );
};

BtnCircleBack.defaultProps = {
  btnStyle: null,
};

BtnCircleBack.propTypes = {
  btnStyle: PropTypes.any,
};

export default BtnCircleBack;
