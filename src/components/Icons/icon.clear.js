import React from 'react';
import {Image} from 'react-native';
import srcClearIcon from '@src/assets/images/icons/clear.png';

const ClearIcon = () => {
  return (
    <Image
      source={srcClearIcon}
      style={{
        width: 24,
        height: 24,
      }}
    />
  );
};

export default ClearIcon;
