import React from 'react';
import PropTypes from 'prop-types';
import { View as RNComponent, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

const FlexView = ({ style, ...otherProps }) => <RNComponent style={[style, styles.flex]} {...otherProps} />;

FlexView.propTypes = {
  style: PropTypes.any,
};

FlexView.defaultProps = {
  style: null,
};

export default FlexView;
