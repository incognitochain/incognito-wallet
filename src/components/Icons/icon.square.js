import React from 'react';
import Svg, { Rect } from 'react-native-svg';

const SquareIcon = (props) => (
  <Svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect
      x={0.75}
      y={0.75}
      width={14.5}
      height={14.5}
      rx={3.25}
      stroke="#9C9C9C"
      strokeWidth={1.5}
    />
  </Svg>
);

export default SquareIcon;
