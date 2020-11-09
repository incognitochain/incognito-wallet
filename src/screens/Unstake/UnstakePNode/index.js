import React from 'react';
import PropTypes from 'prop-types';
import { ExHandler } from '@services/exception';
import { Toast } from '@components/core';
import { unstakePNode } from '@services/api/node';
import Unstake from './Unstake';

const UnstakePNode = ({ device, onFinish }) => {
  const [isUnstaking, setUnstaking] = React.useState(false);
  const handleUnstake = async () => {
    if (isUnstaking) {
      return;
    }

    try {
      setUnstaking(true);
      await unstakePNode({
        qrCode: device.qrCodeDeviceId,
        productId: device.ProductId,
        paymentAddress: device.PaymentAddress,
      });
      Toast.showInfo('Unstaking complete.');
      onFinish();
    } catch (e) {
      new ExHandler(e).showErrorToast(true);
    } finally {
      setUnstaking(false);
    }
  };

  return (
    <Unstake
      device={device}
      isUnstaking={isUnstaking}
      onUnstake={handleUnstake}
    />
  );
};

UnstakePNode.propTypes = {
  device: PropTypes.object.isRequired,
  onFinish: PropTypes.object.isRequired,
};

export default UnstakePNode;
