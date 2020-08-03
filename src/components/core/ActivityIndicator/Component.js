import React from 'react';
import { ActivityIndicator as RNComponent } from 'react-native';
import { COLORS } from '@src/styles';
import PropTypes from 'prop-types';

const ActivityIndicator = (props) => {
  const { size } = props;
  return <RNComponent color={COLORS.black} size={size} {...props} />;
};

ActivityIndicator.propTypes = {
  size: PropTypes.string,
};

ActivityIndicator.defaultProps = {
  size: 'small',
};

export default ActivityIndicator;
