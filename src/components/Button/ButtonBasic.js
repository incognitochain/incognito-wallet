import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, FONT } from '@src/styles';

const styled = StyleSheet.create({
  container: {
    backgroundColor: COLORS.colorPrimary,
    borderRadius: 100,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.white,
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
  },
  disabled: {
    backgroundColor: COLORS.colorGreyMedium,
  },
});

const ButtonBasic = props => {
  const {
    title = '',
    btnStyle = null,
    titleStyle = null,
    customContent,
    disabled = false,
    ...rest
  } = props;
  return (
    <TouchableWithoutFeedback {...rest}>
      <View
        style={[styled.container, disabled ? styled.disabled : null, btnStyle]}
      >
        {customContent ? (
          customContent
        ) : (
          <Text style={[styled.title, titleStyle]}>{title}</Text>
        )}
      </View>
    </TouchableWithoutFeedback>
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
