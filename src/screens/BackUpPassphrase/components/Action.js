import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { THEME } from '@src/styles';
import { Text, TouchableOpacity } from '@components/core';

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  label: {
    ...THEME.text.boldTextStyleSuperMedium
  },
  desc: {
    ...THEME.text.mediumTextMotto,
  },
});


const Action = ({ label, desc, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </TouchableOpacity>
  );
};

Action.propTypes = {
  label: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default Action;
