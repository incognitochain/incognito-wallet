import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Header from '@components/Header';
import { FONT, COLORS } from '@src/styles';
import { withLayout_2 } from '@src/components/Layout';
import { ScrollView } from '@src/components/core';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 9,
    color: COLORS.colorGreyBold,
    marginBottom: 30,
  },
  scrollview: {
    paddingTop: 42,
  },
});

const WhyStreamLine = () => {
  const factories = [
    'Just like how spending hard cash in real life results in small change being accumulated, spending cryptocurrency results in UTXOs being accumulated.',
    'Rummaging through a pocket full of coins is not very efficient when you have to pay for anything, and large numbers of UTXOs cause unwanted behaviors like delayed or unsuccessful transactions.',
    'There’s a straightforward fix: consolidate your UTXOs. This is like exchanging a pile of coins for larger notes. Keeps your wallet streamlined and your transactions efficient.',
  ];
  return (
    <View style={styled.container}>
      <Header title="More on consolidating UTXOs" />
      <ScrollView style={styled.scrollview}>
        {factories.map((item, id) => (
          <Text style={styled.text} key={id}>
            {item}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

WhyStreamLine.propTypes = {};

export default React.memo(withLayout_2(WhyStreamLine));
