import React from 'react';
import { Image } from 'react-native';
import srcExportIcon from '@src/assets/images/icons/export_key.png';

const DeleteIcon = (props) => {
  const defaultStyle = {
    width: 50,
    height: 30,
  };
  const { style, source, ...rest } = props;
  return (
    <Image source={srcExportIcon} style={[defaultStyle, style]} {...rest} />
  );
};

export default DeleteIcon;
