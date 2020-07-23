import React from 'react';
import {Image} from 'react-native';
import srcHasNotificationIcon from '@src/assets/images/icons/has_notification.png';

const HasNotificationIcon = props => {
  const defaultStyle = {
    width: 50,
    height: 40,
  };
  const {style, source, ...rest} = props;
  return <Image source={srcHasNotificationIcon} style={[defaultStyle, style]} {...rest} />;
};

export default HasNotificationIcon;
