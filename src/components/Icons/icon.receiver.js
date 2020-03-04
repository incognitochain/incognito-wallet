import React from 'react';
import {Image} from 'react-native';
import srcReceiverIcon from '@src/assets/images/icons/receiver.png';

const ReceiverIcon = () => {
  return (
    <Image
      source={srcReceiverIcon}
      style={{
        width: 48,
        height: 48,
      }}
    />
  );
};

export default ReceiverIcon;
