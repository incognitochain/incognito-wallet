import React from 'react';
import { Image, StyleSheet } from 'react-native';
import chevronRight from '@src/assets/images/icons/icon_chevron_right.png';
import Svg, { Path } from 'react-native-svg';

const styled = StyleSheet.create({
  icon: {
    width: 8,
    height: 12,
  },
});

const ArrowRightGreyIcon = (props) => {
  const { style, source, ...rest } = props;
  return <Image source={chevronRight} style={[styled.icon, style]} {...rest} />;
};


export const ArrowRight = (props) => (
  <Svg
    width={11}
    height={17}
    viewBox="0 0 11 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M10.6171 8.47381C10.6171 8.96836 10.4052 9.39227 10.0519 9.67487L2.13908 16.6693C1.57387 17.1638 0.726067 17.0932 0.302164 16.528C-0.12174 15.9628 -0.12174 15.1856 0.443465 14.6911L7.36722 8.61511C7.43787 8.54446 7.43787 8.47381 7.36722 8.33251L0.443465 2.25656C-0.12174 1.76201 -0.12174 0.914198 0.372814 0.419644C0.867368 -0.0749099 1.64452 -0.14556 2.20973 0.278343L10.1226 7.2021C10.4052 7.55535 10.6171 7.97926 10.6171 8.47381Z"
      fill="#C0C0C0"
    />
  </Svg>
);

export default ArrowRightGreyIcon;
