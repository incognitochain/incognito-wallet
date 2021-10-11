import React from 'react';
import {Image} from 'react-native';
import star from '@src/assets/images/new-icons/star-stroke.png';

const StarStrokeIcon = React.memo(() => {
  return (
    <Image
      style={{width: 17, height: 16}}
      source={star}
    />
  );
});

export default StarStrokeIcon;
