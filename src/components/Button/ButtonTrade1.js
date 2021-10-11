import { COLORS } from '@src/styles';
import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import ButtonBasic from './ButtonBasic';

const styled = StyleSheet.create({
  btnStyle: {
    backgroundColor: COLORS.colorGrey,
  },
  titleStyle: {
    color: COLORS.black,
  },
});

const ButtonTrade1 = React.memo(({ btnStyle, titleStyle, ...rest }) => {
  return (
    <ButtonBasic
      btnStyle={[styled.btnStyle, btnStyle]}
      titleStyle={[styled.titleStyle, titleStyle]}
      {...rest}
    />
  );
});

ButtonTrade1.defaultProps = {
  btnStyle: undefined,
  titleStyle: undefined
};

ButtonTrade1.propTypes = {
  btnStyle: PropTypes.any,
  titleStyle: PropTypes.any,
};

export default ButtonTrade1;
