import React from 'react';
import { StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, FONT } from '@src/styles';
import { TouchableOpacity } from '@src/components/core';

const styled = StyleSheet.create({
  container: {
    backgroundColor: COLORS.colorPrimary,
    borderRadius: 100,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  title: {
    color: COLORS.white,
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 3,
  },
  disabled: {
    backgroundColor: COLORS.colorGreyMedium,
  },
});

const ButtonBasic = (props) => {
  const {
    title = '',
    btnStyle = null,
    titleStyle = null,
    customContent,
    disabled = false,
    ...rest
  } = props;
  return (
    <TouchableOpacity
      style={[styled.container, btnStyle, disabled ? styled.disabled : null]}
      {...rest}
    >
      {customContent ? (
        customContent
      ) : (
        <Text style={[styled.title, titleStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

ButtonBasic.propTypes = {
  title: PropTypes.string,
  btnStyle: PropTypes.any,
  titleStyle: PropTypes.any,
  customContent: PropTypes.element,
  disabled: PropTypes.bool,
};

export default ButtonBasic;
