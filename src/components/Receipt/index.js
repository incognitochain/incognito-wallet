import React, { Component } from 'react';
import { withNavigation, NavigationActions } from 'react-navigation';
import { Modal } from '@src/components/core';
import routeNames from '@src/router/routeNames';
import { ExHandler } from '@src/services/exception';
import { CONSTANT_KEYS } from '@src/constants';
import { compose } from 'recompose';
import Receipt from './Receipt';
import styleSheet from './style';

let ExportCom = null;

const openReceipt = ({
  txId,
  toAddress,
  fromAddress,
  amount,
  amountUnit,
  time,
  fee,
  feeUnit,
  decimals,
  pDecimals,
  title,
} = {}) => {
  if (typeof ExportCom?.openReceipt === 'function') {
    ExportCom.openReceipt({
      txId,
      toAddress,
      fromAddress,
      amount,
      amountUnit,
      time,
      fee,
      feeUnit,
      decimals,
      pDecimals,
      title,
    });
  }
};

const closeReceipt = () => {
  if (typeof ExportCom?.closeReceipt === 'function') {
    ExportCom.closeReceipt();
  }
};

class ReceiptModal extends Component {
  constructor() {
    super();
    this.state = {
      open: false,
      info: {},
    };
  }

  componentDidMount() {
    ExportCom = this;
  }

  openReceipt = info => {
    this.setState({ open: true, info });
  };

  closeReceipt = () => {
    this.setState({ open: false, info: {} });
  };

  goBackToWallet = () => {
    const { navigation } = this.props;
    this.closeReceipt();
    navigation.reset(
      [NavigationActions.navigate({ routeName: routeNames.Wallet })],
      0,
    );
  };

  onSaveReceivers = () => {
    try {
      const { navigation } = this.props;
      const { info } = this.state;
      navigation?.navigate(routeNames.FrequentReceiversForm, {
        info,
        keySave: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK,
        headerTitle: 'Save address',
      });
      this.closeReceipt();
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

  render() {
    const { open, info } = this.state;
    return (
      <Modal
        visible={open}
        presentationStyle="fullScreen"
        containerStyle={styleSheet.modalContainer}
        isShowHeader={false}
      >
        <Receipt
          info={info}
          onBack={this.goBackToWallet}
          onSaveReceivers={this.onSaveReceivers}
        />
      </Modal>
    );
  }
}

export default compose(withNavigation)(ReceiptModal);
export { closeReceipt, openReceipt };
