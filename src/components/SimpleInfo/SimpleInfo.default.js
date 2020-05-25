import React from 'react';
import PropTypes from 'prop-types';
import { Container, ScrollView, Text, View } from '@src/components/core';
import Icons from 'react-native-vector-icons/AntDesign';
import { COLORS } from '@src/styles';
import style from './style';

const getColor = type => {
  switch (type) {
  case 'warning':
    return COLORS.orange;
  case 'success':
    return COLORS.green;
  case 'info':
    return COLORS.blue;
  case 'error':
    return COLORS.red;
  default:
    // info as default
    return COLORS.blue;
  }
};

const SimpleInfo = props => {
  const {
    type,
    text,
    subText,
    button = null,
    icon = (
      <Icons
        name="exclamationcircleo"
        style={style.icon}
        color={getColor(type)}
      />
    ),
  } = props;

  return (
    <ScrollView contentContainerStyle={style.container}>
      <Container style={style.mainContainer}>
        <View style={style.iconContainer}>{icon}</View>
        {text && <Text style={style.text}>{text}</Text>}
        {subText && <Text style={style.subText}>{subText}</Text>}
        {button && <View style={style.buttonContainer}>{button}</View>}
      </Container>
    </ScrollView>
  );
};

SimpleInfo.propTypes = {
  text: PropTypes.string.isRequired,
  subText: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['warning', 'info', 'success', 'error']).isRequired,
  icon: PropTypes.element,
  button: PropTypes.element,
};

export default SimpleInfo;
