import React from 'react';
import {StyleSheet, TouchableOpacity, Text} from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, FONT } from '@src/styles';

const styled = StyleSheet.create({
  btnStyle: {
    height: 38,
    padding: 22,
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 20,
    marginBottom: 4,
    justifyContent: 'center',
    backgroundColor: COLORS.lightGreyBlur
  },
  text: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    color: COLORS.colorPrimary
  }
});

const BtnWithBlur = props => {
  const {btnStyle, text} = props;
  return (
    <TouchableOpacity style={[styled.btnStyle, btnStyle]} {...props}>
      <Text style={styled.text}>{text || ''}</Text>
    </TouchableOpacity>
  );
};

BtnWithBlur.defaultProps = {
  btnStyle: null,
};

BtnWithBlur.propTypes = {
  btnStyle: PropTypes.any,
};
export default BtnWithBlur;
