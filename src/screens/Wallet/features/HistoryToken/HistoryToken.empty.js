import { Image, Text } from '@src/components/core';
import { View, StyleSheet } from 'react-native';
import React from 'react';
import noTransaction from '@assets/images/icons/shield.png';
import { selectedPrivacySelector } from '@src/redux/selectors';
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
    lineHeight: FONT.SIZE.regular + 5,
    fontSize: FONT.SIZE.regular,
    fontFamily: FONT.NAME.medium,
  },
  image: {
    marginBottom: 30,
    width: 52,
    height: 60,
  },
});

const EmptyHistory = () => {
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  if (selectedPrivacy?.isDeposable) {
    return (
      <View style={styles.container}>
        <Image source={noTransaction} style={styles.image} />
        <Text style={styles.text}>
          {`Shield some ${selectedPrivacy?.externalSymbol ||
            selectedPrivacy?.symbol} to start\ntransacting anonymously.`}
        </Text>
      </View>
    );
  }
  return null;
};

EmptyHistory.defaultProps = {};

EmptyHistory.propTypes = {};

export default EmptyHistory;
