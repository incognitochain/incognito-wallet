import React from 'react';
import { Image } from 'react-native';
import srcInfiniteIcon from '@src/assets/images/icons/infinite.png';

const InfiniteIcon = () => {
  return (
    <Image
      source={srcInfiniteIcon}
      style={{
        width: 26,
        height: 12,
      }}
    />
  );
};

export default InfiniteIcon;
