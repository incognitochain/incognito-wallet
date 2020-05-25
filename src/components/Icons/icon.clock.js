import React from 'react';
import { Image } from 'react-native';
import srcClockIcon from '@src/assets/images/icons/clock.png';
import PropTypes from 'prop-types';

const ClockIcon = props => {
  const defaultStyle = {
    width: 50,
    height: 50,
  };
  const { style, source, ...rest } = props;
  return <Image source={source} style={[defaultStyle, style]} {...rest} />;
};

ClockIcon.propTypes = {
  source: PropTypes.any,
};

ClockIcon.defaultProps = {
  source: srcClockIcon,
};

export default ClockIcon;
