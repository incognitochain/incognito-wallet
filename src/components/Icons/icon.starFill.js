import React, {memo} from 'react';
import {Image} from 'react-native';
import star from '@assets/images/new-icons/star-fill.png';

const StarFillIcon = () => {
  return (
    <Image
      style={{width: 17, height: 16}}
      source={star}
    />
  );
};

export default memo(StarFillIcon);
