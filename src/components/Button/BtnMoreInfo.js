import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { TouchableOpacity } from '@src/components/core';
import srcInfo from '@src/assets/images/node/information.png';

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

const BtnMoreInfo = props => {
  return (
    <TouchableOpacity style={styled.btnStyle} {...props}>
      <Image
        source={srcInfo}
        style={[styled.btnStyle]}
      />
    </TouchableOpacity>
  );
};

BtnMoreInfo.propTypes = {};

export default BtnMoreInfo;
