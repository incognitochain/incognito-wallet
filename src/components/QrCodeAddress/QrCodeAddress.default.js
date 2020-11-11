import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LoadingContainer from '@src/components/LoadingContainer';
import QrCodeGenerate from '@src/components/QrCodeGenerate';
import { CopiableTextDefault as CopiableText } from '@src/components/CopiableText';
import PropTypes from 'prop-types';
import { FONT, COLORS } from '@src/styles';

const styled = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 50,
  },
  label: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    color: COLORS.black,
  },
  qrCode: {
    marginVertical: 30,
  },
});

const QrCodeAddress = props => {
  const { address, label } = props;
  if (!address) {
    return <LoadingContainer />;
  }
  return (
    <View style={styled.container}>
      <Text style={styled.label}>{label}</Text>
      <View style={styled.qrCode}>
        <QrCodeGenerate value={address} size={150} />
      </View>
      <CopiableText data={address} />
    </View>
  );
};

QrCodeAddress.propTypes = {
  address: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default QrCodeAddress;
