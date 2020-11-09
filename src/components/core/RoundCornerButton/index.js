import React from 'react';
import PropTypes from 'prop-types';
import styles from './style';
import Button from '../Button';

const RoundCornerButton = ({ style, titleStyle, title, isLoading, disabled, ...props }) => (
  <Button
    style={[styles.button, style]}
    titleStyle={[styles.buttonTitle, titleStyle]}
    title={title}
    isLoading={isLoading}
    disabled={isLoading || disabled}
    isAsync={isLoading}
    {...props}
  />
);

RoundCornerButton.propTypes = {
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  titleStyle: PropTypes.object,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  title: PropTypes.string,
};

RoundCornerButton.defaultProps = {
  style: null,
  titleStyle: null,
  isLoading: false,
  disabled: false,
  title: '',
};

export default RoundCornerButton;

