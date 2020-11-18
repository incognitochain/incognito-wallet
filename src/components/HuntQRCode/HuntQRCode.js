import React, {memo, useEffect, useState} from 'react';
import { ActivityIndicator, Clipboard, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import PropTypes from 'prop-types';
import { COLORS } from '@src/styles';
import { apiGetQrCodeHunt } from '@components/HuntQRCode/HuntQRCode.sevice';
import { Toast } from '@components/core';
import { ArrowRightGreyIcon } from '@components/Icons';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import styles from './Hunt.styles';

const TEXT_CONST = {
  title:      'Booya! You found a code.',
  head:       'Scan it from the Quest',
  subHead:    'tab to unlock a prize. ',
  learnMore:  'Learn more'
};

const HuntQRCode = ({ code }) => {
  const navigation = useNavigation();

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

  const onLearnMorePress = () => {
    if (!qrCode) return;
    navigation?.navigate(routeNames.pApp, { url: qrCode });
  };

  const onCopyQRCode = () => {
    Clipboard.setString(qrCode);
    Toast.showSuccess('Copied');
  };

  const renderHeader = () => (
    <View style={styles.wrapperHeader}>
      <Text style={styles.labelBold}>
        {TEXT_CONST.title}
      </Text>
      <Text style={styles.labelGray}>
        {TEXT_CONST.head}
      </Text>
      <View style={styles.row}>
        <Text style={styles.labelGray}>
          {TEXT_CONST.subHead}
        </Text>
        <TouchableOpacity onPress={onLearnMorePress} style={styles.row}>
          <Text style={[styles.labelGray, { color: COLORS.black }]}>
            {TEXT_CONST.learnMore}
          </Text>
          <ArrowRightGreyIcon style={styles.arrow} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={onCopyQRCode}
    >
      <View style={styles.wrapperCode}>
        <QRCode
          value={qrCode}
          size={121}
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
  );

  useEffect(() => {
    getQrcode().then();
  }, [code]);

  if (!loaded && !qrCode) return (<LoadingView />);

  return (
    <>
      {!!qrCode && (
        <>
          {renderHeader()}
          {renderContent()}
        </>
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

export default memo(HuntQRCode);