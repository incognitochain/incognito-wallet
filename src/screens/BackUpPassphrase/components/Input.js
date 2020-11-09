import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { BaseTextInput, View, Text } from '@components/core';
import { THEME } from '@src/styles';
import Row from '@components/Row';

const styles = StyleSheet.create({
  label: {
    ...THEME.text.boldTextStyleSuperMedium,
  },
  input: {
    marginTop: 15,
    marginBottom: 30,
    ...THEME.text.superMediumTextMotto,
  },
  left: {
    flex: 1,
    marginRight: 15,
  },
});

const Input = ({ label, value, onChangeText, placeholder, style, autoCapitalize, rightComponent }) => {
  const input = (
    <BaseTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={[styles.input, style, !!rightComponent && styles.left]}
      autoCapitalize={autoCapitalize}
    />
  );

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {rightComponent ? (
        <Row spaceBetween center>
          {input}
          {rightComponent}
        </Row>
      ) : input}
    </View>
  );
};

Input.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChangeText: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  style: PropTypes.object,
  autoCapitalize: PropTypes.string,
  rightComponent: PropTypes.element,
};

Input.defaultProps = {
  value: '',
  style: null,
  autoCapitalize: 'words',
  rightComponent: null,
};

export default Input;

