import CopiableText from '@src/components/CopiableText';
import { ScrollView } from '@src/components/core';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Modal, TouchableWithoutFeedback, Text, View } from 'react-native';
import clipboard from '@src/services/clipboard';
import QrCodeGenerate from '@src/components/QrCodeGenerate';
import { BtnQRCode, BtnCopy } from '@src/components/Button';
import Header from '@src/components/Header';
import styleSheet from './ExportAccount.styled';
import withExportAccount from './ExportAccount.enhance';

const ExportItem = ({ label, data, onPress, onPressQRCode }) => (
  <View onPress={onPress} style={styleSheet.itemContainer}>
    <View style={styleSheet.extra}>
      <Text style={styleSheet.label}>{label}</Text>
      <View style={styleSheet.hook}>
        <BtnQRCode style={styleSheet.qrCode} onPress={onPressQRCode} />
        <BtnCopy onPress={onPress} />
      </View>
    </View>
    <Text numberOfLines={1} ellipsizeMode="middle" style={styleSheet.itemData}>
      {data}
    </Text>
  </View>
);

const ExportAccount = ({ account, token, title }) => {
  const [isShowQRCodeKey, setShowQRCodeKey] = useState(false);
  const [itemQRCode, setItemQRCode] = useState('');
  const [lableQRCode, setLableQRCode] = useState('');

  const parseShard = (bytes) => {
    const arr = bytes.split(',');
    const lastByte = arr[arr.length - 1];
    return (lastByte % 8).toString();
  };
  const renderQRCode = () => {
    let data =
      (itemQRCode && typeof itemQRCode === 'string' && itemQRCode) || '';
    let title = (lableQRCode && lableQRCode) || '';
    return (
      <Modal
        transparent
        animated
        animationType="bounceIn"
        visible={isShowQRCodeKey}
        onRequestClose={() => {
          console.log('close modal');
          setShowQRCodeKey(false);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setShowQRCodeKey(false);
          }}
          style={styleSheet.modalContainer}
        >
          <View style={styleSheet.modalBackground}>
            <View style={styleSheet.modalContent}>
              <Text style={[styleSheet.itemLabel, styleSheet.title]}>
                {title}
              </Text>
              <QrCodeGenerate value={data} size={100} />
              <CopiableText
                oneLine
                showCopyIcon
                containerProps={{
                  style: [styleSheet.textBox],
                }}
                textProps={{
                  numberOfLines: 1,
                  ellipsizeMode: 'middle',
                }}
                text={data}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const renderItem = (label, value) =>
    value ? (
      <ExportItem
        label={label}
        data={value}
        onPressQRCode={() => {
          setItemQRCode(value);
          setLableQRCode(label);
          setShowQRCodeKey(true);
        }}
        onPress={() => {
          clipboard.set(value, { copiedMessage: `${label} was copied.` });
        }}
      />
    ) : null;

  return (
    <View style={styleSheet.container}>
      <Header title={title} />
      <View style={styleSheet.wrapper}>
        <ScrollView>
          {renderItem('Your incognito address', account?.PaymentAddress)}
          {renderItem('Private key', account?.PrivateKey)}
          {renderItem('Public key', account?.PublicKeyCheckEncode)}
          {renderItem('Readonly key', account?.ReadonlyKey)}
          {renderItem('Validator key', account?.ValidatorKey)}
          {__DEV__ || global.isDEV
            ? renderItem('Bls key', account?.ValidatorKey)
            : null}
          {__DEV__ || global.isDEV ? renderItem('Device token', token) : null}
          {__DEV__ || global.isDEV
            ? renderItem('Shard', parseShard(account?.PublicKeyBytes))
            : null}
          {renderQRCode()}
        </ScrollView>
      </View>
    </View>
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
