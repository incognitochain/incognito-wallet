import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { COLORS, FONT } from '@src/styles';
import Header from '@src/components/Header';
import { useSelector } from 'react-redux';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import LoadingContainer from '@components/LoadingContainer/index';
import QrCodeGenerate from '@src/components/QrCodeGenerate';
import { CopiableTextDefault as CopiableText } from '@src/components/CopiableText';
import { TouchableOpacity } from '@src/components/core';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import withReceiveCrypto from './ReceiveCrypto.enhance';

export const homeStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  desc: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 4,
    color: COLORS.colorGreyBold,
    textAlign: 'center',
    marginVertical: 30,
  },
  sub: {
    color: COLORS.black,
    textDecorationLine: 'underline',
  },
});

const ReceiveCrypto = () => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const address = selectedPrivacy?.paymentAddress;
  const navigation = useNavigation();
  if (!selectedPrivacy) return <LoadingContainer />;
  return (
    <View style={homeStyle.container}>
      <Header title="Receive" />
      <ScrollView>
        <QrCodeGenerate
          value={address}
          size={175}
          style={{
            marginTop: 50,
          }}
        />
        <Text style={homeStyle.desc}>
          {
            'This is your address.\nUse it to receive any cryptocurrency\nfrom another Incognito address.'
          }
        </Text>
        <CopiableText data={address} />
        {selectedPrivacy?.isDeposable && (
          <TouchableOpacity
            onPress={() => navigation.navigate(routeNames.Shield)}
          >
            <Text style={homeStyle.desc}>
              {'To receive from outside Incognito,\n please use '}
              <Text style={[homeStyle.desc, homeStyle.sub]}>Shield.</Text>
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

ReceiveCrypto.propTypes = {};

export default withReceiveCrypto(ReceiveCrypto);
