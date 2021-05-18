import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ACCOUNT_CONSTANT } from 'incognito-chain-web-js/build/wallet';
import { compose } from 'recompose';
import BaseScreen from '@screens/BaseScreen';
import { CONSTANT_COMMONS } from '@src/constants';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { FlexView, Toast } from '@components/core';
import LocalDatabase from '@utils/LocalDatabase';
import _ from 'lodash';
import Device from '@models/device';
import routeNames from '@routers/routeNames';
import config from '@src/constants/config';
import { MAX_FEE_PER_TX } from '@src/components/EstimateFee/EstimateFee.utils';
import Header from '@src/components/Header';
import { withLayout_2 } from '@components/Layout';
import { actionSwitchAccount } from '@src/redux/actions/account';
import { switchMasterKey } from '@src/redux/actions/masterKey';
import { accountSelector } from '@src/redux/selectors';
import { walletSelector } from '@src/redux/selectors/wallet';
import { accountServices } from '@src/services/wallet';
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
      amount: ACCOUNT_CONSTANT.StakingAmount,
    };
  }

  async getBalance() {
    const { device } = this.state;
    const account = device.Account;
    const balance = await accountService.getBalance(account, account.Wallet);
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
    const deviceIndex = listDevice.findIndex((item) =>
      _.isEqual(Device.getInstance(item).AccountName, name),
    );
    listDevice[deviceIndex].minerInfo.stakeTx = rs.txId;
    await LocalDatabase.saveListDevices(listDevice);
    Toast.showInfo('You staked successfully.');
    navigation.navigate(routeNames.Node, {
      refresh: new Date().getTime(),
    });
  }

  handleStake = async () => {
    try {
      const { device } = this.state;
      const account = device.Account;
      this.setState({ isStaking: true });
      const rs = await accountService.createAndSendStakingTx({
        defaultAccount: account,
        wallet: account.Wallet,
        fee: MAX_FEE_PER_TX,
      });
      console.log('result', rs);
      this.handleStakeSuccess(rs);
    } catch (e) {
      new ExHandler(e).showErrorToast(true);
    } finally {
      this.setState({ isStaking: false });
    }
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.listener = navigation.addListener('didFocus', () => {
      this.getBalance().catch((error) =>
        new ExHandler(error).showErrorToast(true),
      );
    });
  }

  componentWillUnmount() {
    this.listener.remove();
  }

  render() {
    const { navigation, actionSwitchAccount, switchMasterKey } = this.props;
    const { device, amount, fee, isStaking, balance } = this.state;
    const account = device.Account;
    return (
      <FlexView>
        <Header title="Stake" />
        <AddStake
          account={account}
          navigation={navigation}
          type={stakeType}
          amount={amount}
          fee={fee}
          onStake={this.handleStake}
          onBuy={this.handleBuy}
          isStaking={isStaking}
          balance={balance}
          isVNode={device.IsVNode}
          onSwitchAccount={actionSwitchAccount}
          onSwitchMasterKey={switchMasterKey}
        />
      </FlexView>
    );
  }
}

const mapState = (state) => ({
  defaultAccount: accountSelector.defaultAccountSelector(state),
  wallet: walletSelector(state),
});

const mapDispatch = {
  actionSwitchAccount,
  switchMasterKey,
};

AddStakeContainer.propTypes = {
  defaultAccount: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
};

export default compose(
  connect(
    mapState,
    mapDispatch,
  ),
  withLayout_2,
)(AddStakeContainer);
