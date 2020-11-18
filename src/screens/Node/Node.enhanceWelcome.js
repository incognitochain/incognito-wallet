import React, { useCallback, useState } from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useFocusEffect } from 'react-navigation-hooks';
import LocalDatabase from '@utils/LocalDatabase';
import Device from '@models/device';

const enhance = WrappedComp => props => {
  const { listDevice } = props;

  const [showWelcome, setShowWelcome] = useState(false);

  const onClearNetworkNextTime = async () => {
    await LocalDatabase.setNodeCleared('1');
    setShowWelcome(false);
  };

  const checkWelcome = async () => {
    const clearedNode = await LocalDatabase.getNodeCleared();
    const list = (await LocalDatabase.getListDevices()) || [];
    if (!clearedNode && listDevice.length === 0 && list.length > 0) {
      const firstDevice = Device.getInstance(list[0]);
      if (firstDevice.IsPNode && !firstDevice.IsLinked) {
        setShowWelcome(true);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkWelcome().then();
    }, [])
  );

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          listDevice,

          showWelcome,
          onClearNetworkNextTime
        }}
      />
    </ErrorBoundary>
  );
};

export default enhance;