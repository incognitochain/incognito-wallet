import React from 'react';
import { TouchableOpacity, Text } from '@src/components/core';
import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  text: {
    ...FONT.STYLE.medium,
    fontSize: 15,
    color: COLORS.black,
  }
});

const BtnResume = (props) => {
  return (
    <TouchableOpacity {...props}>
      <Text style={style.text}>
        Resume
      </Text>
    </TouchableOpacity>
  );
};

export default React.memo(BtnResume);