import { Image, Text } from '@src/components/core';
import { View, StyleSheet } from 'react-native';
import React from 'react';
import noTransaction from '@assets/images/icons/shield_prv.png';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { useSelector } from 'react-redux';
import { COLORS, FONT } from '@src/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  text: {
    color: COLORS.colorGreyBold,
    textAlign: 'center',
    lineHeight: FONT.SIZE.regular + 4,
    fontSize: FONT.SIZE.regular,
  },
  image: {
    marginBottom: 20,
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
});

const EmptyHistory = () => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  return (
    <View style={styles.container}>
      <Image source={noTransaction} style={styles.image} />
      <Text style={styles.text}>
        {`${selectedPrivacy?.externalSymbol ||
          selectedPrivacy?.symbol} is fuel for Incognito. Use it to buy,\nsell and spend crypto privately.`}
      </Text>
    </View>
  );
};

EmptyHistory.defaultProps = {};

EmptyHistory.propTypes = {};

export default EmptyHistory;
