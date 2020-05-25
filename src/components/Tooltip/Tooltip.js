import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { View } from '@components/core';
import { COLORS } from '@src/styles';

const styled = StyleSheet.create({
  container: {
    padding: 0,
    margin: 0,
    paddingBottom: 20,
    width: '100%',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.white,
    position: 'absolute',
    bottom: -15,
    transform: [{ rotate: '180deg' }],
  },
  triangleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const Tooltip = ({
  content,
  containerStyle,
  triangleStyle,
  triangleContainerStyle,
}) => (
  <View style={[styled.container, containerStyle]}>
    {content}
    <View style={[styled.triangleContainer, triangleContainerStyle]}>
      <View style={[styled.triangle, triangleStyle]} />
    </View>
  </View>
);

Tooltip.defaultProps = {
  containerStyle: null,
  triangleStyle: null,
  triangleContainerStyle: null,
};

Tooltip.propTypes = {
  content: PropTypes.element.isRequired,
  containerStyle: PropTypes.any,
  triangleStyle: PropTypes.any,
  triangleContainerStyle: PropTypes.any,
};

export default React.memo(Tooltip);
