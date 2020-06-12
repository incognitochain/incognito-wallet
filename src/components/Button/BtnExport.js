import React from 'react';
import { TouchableOpacity } from '@src/components/core';
import { ExportIcon } from '../Icons';

const BtnExport = (props) => {
  return (
    <TouchableOpacity {...props}>
      <ExportIcon />
    </TouchableOpacity>
  );
};

BtnExport.propTypes = {};

export default BtnExport;
