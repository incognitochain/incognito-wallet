import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { ActivityIndicator, Toast } from '@components/core';
import LocalDatabase from '@utils/LocalDatabase';
import _ from 'lodash';
import Device from '@models/device';
import { MAX_FEE_PER_TX } from '@src/components/EstimateFee/EstimateFee.utils';
import Unstake from './Unstake';

export const TAG = 'Unstake';

class UnstakeVNode extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isUnstaking: false,
      fee: MAX_FEE_PER_TX,
    };
  }

  async componentDidMount() {
    this.getBalance().catch(error => new ExHandler(error).showErrorToast(true));
  }

  async getBalance() {
    const { device } = this.props;
    const account = device.Account;
    const balance = await accountService.getBalance(account, account.Wallet);
    this.setState({ balance });
  }

  handleUnstake = async () => {
    const { isUnstaking, fee } = this.state;

    if (isUnstaking) {
      return;
    }

    try {
      this.setState({ isUnstaking: true });
      const { onFinish, device } = this.props;
      const account = device.Account;
      const validatorKey = account.ValidatorKey;
      const name = device.AccountName;
      const rs = await accountService.createAndSendStopAutoStakingTx(
        account.Wallet,
        account,
        fee,
        account.PaymentAddress,
        validatorKey,
      );
      const listDevice = (await LocalDatabase.getListDevices()) || [];
      await LocalDatabase.saveListDevices(listDevice);
      const deviceIndex = listDevice.findIndex(item =>
        _.isEqual(Device.getInstance(item).AccountName, name),
      );
      listDevice[deviceIndex].minerInfo.unstakeTx = rs.txId;
      await LocalDatabase.saveListDevices(listDevice);
      Toast.showInfo('Unstaking complete.');
      onFinish();
    } catch (e) {
      new ExHandler(e).showErrorToast(true);
    } finally {
      this.setState({ isUnstaking: false });
    }
  };

  render() {
    const { device } = this.props;
    const { fee, isUnstaking, balance } = this.state;

    if (fee === undefined) {
      return <ActivityIndicator size="small" />;
    }

    return (
      <Unstake
        device={device}
        balance={balance}
        fee={fee}
        isUnstaking={isUnstaking}
        onUnstake={this.handleUnstake}
      />
    );
  }
}

UnstakeVNode.propTypes = {
  device: PropTypes.object.isRequired,
  onFinish: PropTypes.func.isRequired,
};

UnstakeVNode.defaultProps = {};

export default UnstakeVNode;
