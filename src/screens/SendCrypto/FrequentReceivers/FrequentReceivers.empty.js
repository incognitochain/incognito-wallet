import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import srcEmpty from '@src/assets/images/icons/address_book_empty.png';
import { FONT, COLORS } from '@src/styles';

const styled = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
    color: COLORS.colorGreyBold,
    textAlign: 'center',
    marginTop: 30,
  },
  imgEmpty: {
    width: 180,
    height: 160,
  },
});

const FrequentReceiversEmpty = () => {
  return (
    <View style={styled.container}>
      <Image style={styled.imgEmpty} source={srcEmpty} />
      <Text style={styled.title}>Your address book is currently empty</Text>
    </View>
  );
};

FrequentReceiversEmpty.propTypes = {};

export default React.memo(FrequentReceiversEmpty);
