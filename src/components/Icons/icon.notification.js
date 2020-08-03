import React from 'react';
import { Image } from 'react-native';
import srcNotificationIcon from '@src/assets/images/icons/notification.png';

const NotificationIcon = (props) => {
  const defaultStyle = {
    width: 50,
    height: 40,
  };
  const { style, source, ...rest } = props;
  return (
    <Image
      source={srcNotificationIcon}
      style={[defaultStyle, style]}
      {...rest}
    />
  );
};

export default NotificationIcon;
