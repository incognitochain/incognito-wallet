import React from 'react';
import { Image, StyleSheet } from 'react-native';
import srcQuestionIcon from '@src/assets/images/icons/question.png';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
});

const QuestionIcon = props => {
  const { icon = srcQuestionIcon, style = null } = props;
  return <Image source={icon} style={[styled.icon, style]} />;
};

QuestionIcon.propTypes = {
  icon: PropTypes.string,
  style: PropTypes.any,
};

export default QuestionIcon;
