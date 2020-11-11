import React, {memo, useEffect, useState} from 'react';
import {ActivityIndicator, Clipboard, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import PropTypes from 'prop-types';
import { COLORS, FONT } from '@src/styles';
import { apiGetQrCodeHunt } from '@components/HuntQRCode/HuntQRCode.sevice';
import { Toast } from '@components/core';

const HuntQRCode = ({ code }) => {

  const [qrCode, setQrCode] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const getQrcode = async () => {
    try {
      if (!code) return;
      const { qrCode } = await apiGetQrCodeHunt(code) || {};
      setQrCode(qrCode);
    } catch (error) {
      console.log('GET HUNT QRCODE WITH ERROR: ', error);
    } finally {
      setLoaded(true);
    }
  };

  const onCopyQRCode = () => {
    Clipboard.setString(qrCode);
    Toast.showSuccess('Copied');
  };

  useEffect(() => {
    getQrcode().then();
  }, [code]);

  if (!loaded && !qrCode) return (<LoadingView />);

  return (
    <>
      {!!qrCode && (
        <TouchableOpacity
          style={styles.wrapper}
          onPress={onCopyQRCode}
        >
          <View style={styles.wrapperCode}>
            <QRCode
              value={qrCode}
              size={98}
              color={COLORS.black}
              backgroundColor={COLORS.white}
            />
          </View>
          <View style={styles.wrapperBottom}>
            <Text style={styles.label}>
              GUEST
            </Text>
          </View>
        </TouchableOpacity >
      )}
    </>
  );
};

const LoadingView = () => (
  <View style={styles.wrapperLoading}>
    <ActivityIndicator size='small' />
  </View>
);

HuntQRCode.propTypes = {
  code: PropTypes.number
};

HuntQRCode.defaultProps = {
  code: null
};


const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 4,
    paddingTop: 4,
    backgroundColor: '#333335',
    borderRadius: 6,
    marginTop: 50,
    marginBottom: 50
  },
  wrapperCode: {
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 3
  },
  wrapperBottom: {
    height: 35,
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    ...FONT.STYLE.medium,
    fontSize: 19,
    color: COLORS.white
  },
  wrapperLoading: {
    marginTop: 20
  }
});

export default memo(HuntQRCode);