import PropTypes from 'prop-types';
import { Button, Text, Toast } from '@src/components/core';
import { getAccountByName } from '@src/redux/selectors/account';
import { reloadAccountList } from '@src/redux/actions/wallet';
import _ from 'lodash';
import React, { Component } from 'react';
import { ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import accountService from '@services/wallet/accountService';
import Util from '@utils/Util';
import APIService from '@services/api/miner/APIService';
import AccountModel from '@models/account';
import LogManager from '@src/services/LogManager';
import GetQrcode from './GetQrCode';
import styles from '../../styles';

export const TAG = 'ScanQRCode';

const fetchHotspotInfo = (qrCode) => {
  return Util.excuteWithTimeout(APIService.qrCodeCheckGetWifi({ QRCode: qrCode }), 5)
    .then(response => response)
    .catch(error => { throw new Error('Can not get your hotspot info ' + error?.message); });
};

class ScanQRCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      qrCode: null
    };

    this.changeQrCode = _.debounce(this.changeQrCode, 100);
    this.createAccount = _.debounce(this.createAccount, 200);
  }

  static creatingAccount = false;

  async createAccount() {
    const { getAccountByName, wallet, reloadAccountList } = this.props;
    const { qrCode } = this.state;
    let account = await getAccountByName(qrCode);

    try {
      if (account && account.PaymentAddress && account.ValidatorKey) {
        this.setState({ account });
      } else if (!ScanQRCode.creatingAccount) {
        ScanQRCode.creatingAccount = true;
        account = await accountService.createAccount(qrCode, wallet);

        account = new AccountModel(accountService.toSerializedAccountObj(account));
        this.setState({ account });

        await reloadAccountList();

        Toast.showInfo('Success! Account created.');
      }
    } catch (e) {
      throw e;
    } finally {
      ScanQRCode.creatingAccount = false;
    }
  }

  changeQrCode = async (qrCode) => {
    if (!_.trim(qrCode)) {
      return this.setState({ error: 'QR-Code is empty' });
    }

    this.setState({ qrCode, error: '' }, async () => {
      try {
        this.setState({ loading: true });
        fetchHotspotInfo(qrCode)
          .then(async hotspotSSID => {
            let data = hotspotSSID;
            if (data?.status != 1 || !data?.data?.WifiName) {
              return this.setState({ error: data?.data || 'Can not get your hotspot ssid with qr code ' + qrCode });
            } else {
              this.setState({ hotspotSSID: data?.data?.WifiName });
              await this.createAccount();
            }
          })
          .catch(err => {
            this.setState({ error: err?.message });
          });

      } finally {
        this.setState({ loading: false });
      }
    });
  };

  handleNext = () => {
    const { onNext } = this.props;
    const { qrCode, account, hotspotSSID } = this.state;

    console.debug('ON NEXT', account);

    onNext({ qrCode, account, hotspotSSID });
  };

  renderContent = () => {
    const { qrCode } = this.state;
    return (
      <View style={styles.content}>
        <GetQrcode
          qrCode={qrCode}
          onSuccess={this.changeQrCode}
        />
      </View>
    );
  };

  renderFooter = () => {
    const { loading, qrCode, account } = this.state;

    return (
      <View style={styles.footer}>
        <Button
          disabled={loading || !qrCode || !account}
          loading={loading}
          onPress={this.handleNext}
          title="Next"
        />
      </View>
    );
  };

  render() {
    const { error } = this.state;
    return (
      <ScrollView>
        <Text style={styles.title2}>Scan the code at the base of the device</Text>
        {this.renderContent()}
        <Text style={styles.errorText}>{error}</Text>
        {this.renderFooter()}
      </ScrollView>
    );
  }

}

ScanQRCode.propTypes = {
  getAccountByName: PropTypes.func.isRequired,
  reloadAccountList: PropTypes.func.isRequired,
  wallet: PropTypes.object.isRequired,
  onNext: PropTypes.func.isRequired,
};

ScanQRCode.defaultProps = {};

const mapStateToProps = state => ({
  wallet: state.wallet,
  getAccountByName: getAccountByName(state),
});

const mapDispatchToProps = {
  reloadAccountList
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScanQRCode);
