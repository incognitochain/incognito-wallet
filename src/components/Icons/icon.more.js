import React from 'react';
import Svg, { Path } from 'react-native-svg';
import {View} from 'react-native';
import PropTypes from 'prop-types';

const SelectMore = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      d="M6.75 10.5C8.82107 10.5 10.5 8.82107 10.5 6.75C10.5 4.67893 8.82107 3 6.75 3C4.67893 3 3 4.67893 3 6.75C3 8.82107 4.67893 10.5 6.75 10.5Z"
      fill="#1A73E8"
    />
    <Path
      d="M17.25 10.5C19.3211 10.5 21 8.82107 21 6.75C21 4.67893 19.3211 3 17.25 3C15.1789 3 13.5 4.67893 13.5 6.75C13.5 8.82107 15.1789 10.5 17.25 10.5Z"
      fill="#1A73E8"
    />
    <Path
      d="M6.75 21C8.82107 21 10.5 19.3211 10.5 17.25C10.5 15.1789 8.82107 13.5 6.75 13.5C4.67893 13.5 3 15.1789 3 17.25C3 19.3211 4.67893 21 6.75 21Z"
      fill="#1A73E8"
    />
    <Path
      d="M17.25 21C19.3211 21 21 19.3211 21 17.25C21 15.1789 19.3211 13.5 17.25 13.5C15.1789 13.5 13.5 15.1789 13.5 17.25C13.5 19.3211 15.1789 21 17.25 21Z"
      fill="#1A73E8"
    />
  </Svg>
);


const UnSelectMore = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      d="M6.75 10.5C8.82107 10.5 10.5 8.82107 10.5 6.75C10.5 4.67893 8.82107 3 6.75 3C4.67893 3 3 4.67893 3 6.75C3 8.82107 4.67893 10.5 6.75 10.5Z"
      fill="#9C9C9C"
    />
    <Path
      d="M17.25 10.5C19.3211 10.5 21 8.82107 21 6.75C21 4.67893 19.3211 3 17.25 3C15.1789 3 13.5 4.67893 13.5 6.75C13.5 8.82107 15.1789 10.5 17.25 10.5Z"
      fill="#9C9C9C"
    />
    <Path
      d="M6.75 21C8.82107 21 10.5 19.3211 10.5 17.25C10.5 15.1789 8.82107 13.5 6.75 13.5C4.67893 13.5 3 15.1789 3 17.25C3 19.3211 4.67893 21 6.75 21Z"
      fill="#9C9C9C"
    />
    <Path
      d="M17.25 21C19.3211 21 21 19.3211 21 17.25C21 15.1789 19.3211 13.5 17.25 13.5C15.1789 13.5 13.5 15.1789 13.5 17.25C13.5 19.3211 15.1789 21 17.25 21Z"
      fill="#9C9C9C"
    />
  </Svg>
);

const MoreIcon = React.memo(({ style, active }) => (
  <View style={style}>
    {active ? <SelectMore /> : <UnSelectMore />}
  </View>
));

MoreIcon.defaultProps = {
  style: null,
  active: false
};

MoreIcon.propTypes = {
  style: PropTypes.any,
  active: PropTypes.bool
};

export default MoreIcon;