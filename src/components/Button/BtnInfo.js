import React from 'react';
import { TouchableOpacity } from '@src/components/core';
import { InfoIcon } from '@src/components/Icons';

const BtnInfo = (props) => {
  return (
    <TouchableOpacity {...props}>
      <InfoIcon />
    </TouchableOpacity>
  );
};

BtnInfo.propTypes = {};

export default BtnInfo;
