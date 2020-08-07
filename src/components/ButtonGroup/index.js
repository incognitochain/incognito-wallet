import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text } from '@components/core';
import { Row } from '@components/';
import styles from './style';

const ButtonGroup = ({
  buttons,
  selectedButton,
  onPress,
}) => {
  return (
    <Row style={styles.group}>
      {buttons.map(button => (
        <TouchableOpacity
          key={button.id}
          onPress={() => onPress(button.id)}
          style={[styles.button, selectedButton === button.id && styles.active]}
        >
          <Text style={[styles.text, selectedButton === button.id && styles.activeText]}>{button.title}</Text>
        </TouchableOpacity>
      ))}
    </Row>
  );
};

ButtonGroup.propTypes = {
  buttons: PropTypes.array.isRequired,
  selectedButton: PropTypes.string,
  onPress: PropTypes.func.isRequired,
};

ButtonGroup.defaultProps = {
  selectedButton: ''
};

export default ButtonGroup;
