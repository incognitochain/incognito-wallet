import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { withLayout_2 } from '@src/components/Layout';
import Header from '@src/components/Header';
import { COLORS, FONT } from '@src/styles';
import { useBackHandler } from '@src/components/UseEffect';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollview: {
    marginTop: 22,
  },
  text: {
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 9,
    marginBottom: 22,
  },
  title: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
    color: COLORS.black,
    marginBottom: 5,
  },
});

const WhyUnshield = (props) => {
  useBackHandler();
  return (
    <View style={styled.container}>
      <Header title="What is Unshield?" />
      <ScrollView style={styled.scrollview}>
        <Text style={styled.title}>
          {'Use Unshield to send assets to a\nnon-Incognito address.'}
        </Text>
        <Text style={styled.text}>
          Assets are only privacy-protected within the Incognito network. The
          transaction leaving the Incognito chain remains private, so the sender
          is not disclosed. However, the received transaction will be a normal
          public transaction, and will be visible on its corresponding block
          explorer, such as Bitcoin or Ethereum.
        </Text>
        <Text style={styled.title}>
          Want to send to another Incognito address?
        </Text>
        <Text style={styled.text}>
          Simply tap on any coin in the main assets screen to view send and
          receive options. Your transaction will be completely anonymous from
          start to finish.
        </Text>
      </ScrollView>
    </View>
  );
};

WhyUnshield.propTypes = {};

export default withLayout_2(WhyUnshield);
