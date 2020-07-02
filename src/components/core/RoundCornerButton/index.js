import React from 'react';
import PropTypes from 'prop-types';
import styles from './style';
import Button from '../Button';

const RoundCornerButton = ({ style, titleStyle, ...props }) => (
  <Button
    style={[styles.button, style]}
    titleStyle={styles.buttonTitle}
    {...props}
  />
);

RoundCornerButton.propTypes = {
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  titleStyle: PropTypes.object,
};

RoundCornerButton.defaultProps = {
  style: null,
  titleStyle: null,
};

export default RoundCornerButton;

