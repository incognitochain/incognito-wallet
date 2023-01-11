import PropTypes from 'prop-types';
import React from 'react';
import clipboard from '@src/services/clipboard';
import { BtnQRCode, BtnCopy } from '@src/components/Button';
import Header from '@src/components/Header';
import srcQrCodeLight from '@src/assets/images/icons/qr_code_light.png';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { View, Text, ScrollViewBorder } from '@src/components/core';
import { Text3 } from '@src/components/core/Text';
import withExportAccount from './ExportAccount.enhance';
import styleSheet from './ExportAccount.styled';

const ExportItem = ({ label, data, onPress, onPressQRCode }) => (
  <View onPress={onPress} style={styleSheet.itemContainer}>
    <View style={styleSheet.extra}>
      <Text style={styleSheet.label}>{label}</Text>
      <View style={styleSheet.hook}>
        <BtnQRCode
          style={styleSheet.qrCode}
          onPress={onPressQRCode}
          source={srcQrCodeLight}
        />
        <BtnCopy onPress={onPress} />
      </View>
    </View>
    <Text3 style={styleSheet.itemData}>{data}</Text3>
  </View>
);

export const parseShard = (bytes) => {
    const arr = bytes.split(',');
    const lastByte = arr[arr.length - 1];
    return (lastByte % 8).toString();
};

const ExportAccount = ({ account, token, title }) => {
  const navigation = useNavigation();
  const renderItem = (label, value) =>
    value ? (
      <ExportItem
        label={label}
        data={value}
        onPressQRCode={() =>
          navigation.navigate(routeNames.ExportAccountModal, {
            params: {
              value,
              label,
            },
          })
        }
        onPress={() => {
          clipboard.set(value, { copiedMessage: `${label} was copied.` });
        }}
      />
    ) : null;
  return (
    <>
      <Header title={title} />
      <ScrollViewBorder>
        {renderItem('Your incognito address', account?.PaymentAddress)}
        {renderItem('Private key', account?.PrivateKey)}
        {renderItem('Public key', account?.PublicKeyCheckEncode)}
        {renderItem('Readonly key', account?.ReadonlyKey)}
        {renderItem('Validator key', account?.ValidatorKey)}
        {renderItem('Validator Public key', account?.BLSPublicKey)}
        {renderItem('OTA key', account?.OTAKey)}
        {__DEV__ || global.isDEV ? renderItem('Device token', token) : null}
        {renderItem('ID', account?.ID.toString())}
        {__DEV__ || global.isDEV
          ? renderItem('Shard', parseShard(account?.PublicKeyBytes))
          : null}
      </ScrollViewBorder>
    </>
  );
};

ExportAccount.defaultProps = {
  token: '',
};

ExportAccount.propTypes = {
  account: PropTypes.object.isRequired,
  token: PropTypes.string,
  title: PropTypes.string.isRequired,
};

ExportItem.propTypes = {
  label: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  onPressQRCode: PropTypes.func.isRequired,
};

export default withExportAccount(ExportAccount);
