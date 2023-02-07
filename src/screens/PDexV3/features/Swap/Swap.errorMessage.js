import { Text } from '@components/core';
import React from 'react';

// import { MESSAGES } from '@src/constants';
import { COLORS } from '@src/styles';
import { StyleSheet } from 'react-native';

export const styled = StyleSheet.create({
  errorText: {
    color: COLORS.red,
    fontSize: 14,
    marginTop: 15,
  },
});

const ErrorMessage = ({ errorMessage }) => {
  if (!errorMessage || errorMessage === '') return null;
  return <Text style={styled.errorText}>{errorMessage}</Text>;
};
export default ErrorMessage;
