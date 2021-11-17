import { FONT, COLORS } from '@src/styles';
import React from 'react';
import { StyleSheet } from 'react-native';
import ButtonBasic from './ButtonBasic';

const styled = StyleSheet.create({
  btnStyle: {
    backgroundColor: COLORS.colorBlue,
    height: 50,
  },
  titleStyle: {
    color: COLORS.white,
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
  },
});

const ButtonTrade = React.memo(({ btnStyle, titleStyle, ...rest }) => {
  return (
    <ButtonBasic
      btnStyle={[styled.btnStyle, btnStyle]}
      titleStyle={[styled.titleStyle, titleStyle]}
      {...rest}
    />
  );
});

export default ButtonTrade;
