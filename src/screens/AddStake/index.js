import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import BaseScreen from '@screens/BaseScreen';
import { CONSTANT_COMMONS } from '@src/constants';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { getStakingAmount } from '@services/wallet/RpcClientService';
import { Toast } from '@components/core/index';
import LocalDatabase from '@utils/LocalDatabase';
import _ from 'lodash';
import Device from '@models/device';
import routeNames from '@routers/routeNames';
import config from '@src/constants/config';
import { MAX_FEE_PER_TX } from '@src/components/EstimateFee/EstimateFee.utils';
import style from './styles';
import AddStake from './AddStake';

export const TAG = 'AddStake';

const stakeType = CONSTANT_COMMONS.STAKING_TYPES.SHARD;

class AddStakeContainer extends BaseScreen {
  constructor(props) {
    super(props);
    const { navigation } = props;
    const { params } = navigation.state;
    const { device } = params;

    this.state = {
      device,
      fee: MAX_FEE_PER_TX,
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    this.listener = navigation.addListener('didFocus', () => {
      this.getStakeAmount().catch(error =>
        new ExHandler(error).showErrorToast(true),
      );
      this.getBalance().catch(error =>
        new ExHandler(error).showErrorToast(true),
      );
    });
  }

  componentWillUnmount() {
    this.listener.remove();
  }

  async getStakeAmount() {
    const amount = await getStakingAmount(stakeType);
    this.setState({ amount });
  }

  async getBalance() {
    const { wallet } = this.props;
    const { device } = this.state;
    const account = device.Account;
    const balance = await accountService.getBalance(account, wallet);
    this.setState({ balance });
  }

  handleBuy = async () => {
    const { navigation } = this.props;
    const { balance, amount } = this.state;
    const neededAmount = amount - balance + 1e9;
    navigation.navigate(routeNames.Dex, {
      outputValue: neededAmount,
      inputTokenId: config.USDT_TOKEN_ID,
      outputTokenId: CONSTANT_COMMONS.PRV.id,
      mode: 'trade',
    });
  };

  async handleStakeSuccess(rs) {
    const { navigation } = this.props;
    const { device } = this.state;
    const name = device.AccountName;
    const listDevice = (await LocalDatabase.getListDevices()) || [];
    const deviceIndex = listDevice.findIndex(item =>
      _.isEqual(Device.getInstance(item).AccountName, name),
    );
    listDevice[deviceIndex].minerInfo.stakeTx = rs.txId;
    await LocalDatabase.saveListDevices(listDevice);
    Toast.showInfo('You staked successfully.');

    navigation.goBack();
  }

  handleStake = async () => {
    try {
      const { device, fee } = this.state;
      const { wallet } = this.props;
      const account = device.Account;
      const paymentAddress = account.PaymentAddress;
      this.setState({ isStaking: true });
      const param = { type: stakeType };
      const rs = await accountService.staking(
        param,
        fee,
        paymentAddress,
        account,
        wallet,
        paymentAddress,
        true,
      );
      this.handleStakeSuccess(rs);
    } catch (e) {
      new ExHandler(e).showErrorToast(true);
    } finally {
      this.setState({ isStaking: false });
    }
  };

  render() {
    const { navigation, wallet } = this.props;
    const { device, amount, fee, isStaking, balance } = this.state;
    const account = device.Account;
    return (
      <View style={style.container}>
        <AddStake
          account={account}
          navigation={navigation}
          wallet={wallet}
          type={stakeType}
          amount={amount}
          fee={fee}
          onStake={this.handleStake}
          onBuy={this.handleBuy}
          isStaking={isStaking}
          balance={balance}
        />
      </View>
    );
  }
}

AddStakeContainer.propTypes = {
  wallet: PropTypes.object.isRequired,
};

AddStakeContainer.defaultProps = {};

const mapStateToProps = state => ({
  wallet: state?.wallet,
});

export default compose(connect(mapStateToProps))(AddStakeContainer);
