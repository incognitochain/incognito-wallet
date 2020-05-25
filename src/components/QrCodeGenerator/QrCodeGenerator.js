import { Text, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import RNQRCode from 'react-native-qrcode-svg';

const styled = StyleSheet.create({
  qrCode: {},
  copiableText: {},
});

const QrCode = ({ value, size, style }) => {
  const [error, setError] = useState(null);
  return (
    <View style={[styled.qrCode, style]}>
      {error ? (
        <Text>Can not show QR code</Text>
      ) : (
        <RNQRCode value={value} size={size} onError={setError} />
      )}
    </View>
  );
};

const CopiableText = ({ value }) => {
  return (
    <View style={[styled.copiableText]}>
      <Text numberOfLines={1} ellipsizeMode="middle">
        {value}
      </Text>
    </View>
  );
};

const QrCodeGenerator = () => {
  return;
};

QrCode.defaultProps = {
  size: 200,
  style: null,
};

QrCode.propTypes = {
  value: PropTypes.string.isRequired,
  size: PropTypes.number,
  style: PropTypes.any,
};

export default QrCodeGenerator;
