import { ActivityIndicator, Toast } from '@src/components/core';
import Header from '@src/components/Header';
import { withLayout_2 } from '@src/components/Layout';
import Device from '@src/models/device';
import { listAllMasterKeyAccounts } from '@src/redux/selectors/masterKey';
import routeNames from '@src/router/routeNames';
import LocalDatabase from '@src/utils/LocalDatabase';
import { isEmpty } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useNavigation } from 'react-navigation-hooks';
import { useSelector } from 'react-redux';
import { compose } from 'redux';

const ScanQrCode2: React.FC = (props) => {
  const navigation = useNavigation();

  const listAccount = useSelector(listAllMasterKeyAccounts);

  const [device, setDevice] = useState({});

  const scanner = useRef<any>(null);

  // get route params
  useEffect(() => {
    setTimeout(() => {
      const BLSPublicKey =
        '1LxLAEioA4Jzq9bkYaj37A6k2kCUbEu4DT6stoyWFZ65Jf5QGMWCoXNj7dj4EEawhEWcCBHJ8VmgbJR3ZD5zuotZozBHVsLPteqQ4phw6Mhovo987LXQKH6DrKJqqYaYqjWkGCshCnXbTK5CqsH6SYcLzo8pktvBHJtuStZzxM2w88GQRnG6a';
      handleOnRead({
        data: {
          type: 'stake_shard',
          data: {
            validatorPublicKey: BLSPublicKey,
          },
        },
      });
    }, 3000);
  }, []);

  const handleOnRead = async (result) => {
    const qrCode = result?.data;
    if (!isEmpty(qrCode)) {
      const { data, type }: any = qrCode;
      // Find account in list account with validator public key from qrCode
      const account = listAccount?.find(
        (item, i) => item?.BLSPublicKey === data?.validatorPublicKey,
      );

      // const name = device.AccountName;
      // const listDevice: any = (
      //   (await LocalDatabase.getListDevices()) || []
      // ).map((device) => Device.getInstance(device));

      // console.log(listDevice);
      if(account) {
        navigation.navigate(routeNames.StakeConfirm, {
          type: type,
          account,
        });
      }
    }
  };

  const renderLoading = () => {
    return (
      <View
        style={{
          width: 80,
          height: 80,
          backgroundColor: 'white',
          borderRadius: 8,

          position: 'absolute',
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header title="Scan QR Code" />
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <QRCodeScanner
          showMarker
          onRead={handleOnRead}
          cameraStyle={{
            width: '100%',
            height: '100%',
          }}
          ref={scanner}
          style={{ flex: 1 }}
        />
        {renderLoading()}
      </View>
    </View>
  );
};

export default compose(withLayout_2)(React.memo(ScanQrCode2));
