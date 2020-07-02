import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { View, Text } from '@components/core';
import { COLORS, FONT, UTILS } from '@src/styles';

const styles = StyleSheet.create({
  container: {
    paddingBottom: 25,
  },
  title: {
    ...FONT.STYLE.bold,
    fontSize: 16,
    lineHeight: 28,
  },
  description: {
    color: COLORS.lightGrey1,
    fontFamily: FONT.NAME.medium,
    fontSize: 16,
    lineHeight: 22,
  },
});

const Section = ({title, description}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
  </View>
);

Section.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default React.memo(Section);
