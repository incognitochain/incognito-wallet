import React from 'react';
import { TouchableOpacity } from 'react-native';
import { CopyIcon } from '@src/components/Icons';

const BtnCopy = (props) => {
  const { ...rest } = props;
  return (
    <TouchableOpacity {...rest}>
      <CopyIcon />
    </TouchableOpacity>
  );
};

export default BtnCopy;
