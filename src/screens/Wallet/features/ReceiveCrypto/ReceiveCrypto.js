import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { COLORS, FONT } from '@src/styles';
import Header from '@src/components/Header';
import { useSelector } from 'react-redux';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import LoadingContainer from '@components/LoadingContainer/index';
import QrCodeGenerate from '@src/components/QrCodeGenerate';
import { CopiableTextDefault as CopiableText } from '@src/components/CopiableText';
import withReceiveCrypto from './ReceiveCrypto.enhance';

export const homeStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  desc: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
    color: COLORS.colorGreyBold,
    textAlign: 'center',
    marginVertical: 30,
  },
  scrollview: {
    flex: 1,
    marginTop: 42,
  },
});

const ReceiveCrypto = () => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const address = selectedPrivacy?.paymentAddress;
  if (!selectedPrivacy) return <LoadingContainer />;
  return (
    <View style={homeStyle.container}>
      <Header title="Receive" />
      <ScrollView style={homeStyle.scrollview}>
        <QrCodeGenerate value={address} size={175} />
        <Text style={homeStyle.desc}>
          {
            'This is your address.\nUse it to receive any cryptocurrency\nfrom another Incognito address.'
          }
        </Text>
        <CopiableText data={address} />
      </ScrollView>
    </View>
  );
};

ReceiveCrypto.propTypes = {};

export default withReceiveCrypto(ReceiveCrypto);
