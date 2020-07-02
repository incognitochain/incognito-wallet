import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { TouchableOpacity } from '@src/components/core';
import srcInfo from '@src/assets/images/node/info.png';

const styled = StyleSheet.create({
  btnStyle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center'
  },
});

const BtnInformation = props => {
  return (
    <TouchableOpacity style={styled.btnStyle} {...props}>
      <Image
        source={srcInfo}
        style={[styled.btnStyle]}
      />
    </TouchableOpacity>
  );
};

BtnInformation.propTypes = {};

export default BtnInformation;
