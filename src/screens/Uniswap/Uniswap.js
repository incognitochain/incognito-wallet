import React from 'react';
import PropTypes from 'prop-types';
import {Image, RefreshControl, ScrollView, Text, TouchableOpacity, View} from '@src/components/core';
import Transfer from '@screens/Uniswap/components/Transfer';
import depositIcon from '@src/assets/images/icons/deposit_icon.png';
import addLiquidityIcon from '@src/assets/images/icons/add_liquidity_icon.png';
import COLORS from '@src/styles/colors';
import BackButton from '@components/BackButton/index';
import WithdrawSmartContract from '@screens/Uniswap/components/WithdrawSmartContract';
import {getUniswapBalance} from '@services/trading';
import withdrawBlack from '@assets/images/icons/withdraw_black.png';
import OptionMenu from '@components/OptionMenu/OptionMenu';
import dexUtil from '@utils/dex';
import RecentHistory from './components/RecentHistory';
import Swap from './components/Swap';
import {dexStyle, mainStyle} from './style';

class Uniswap extends React.Component {
  state = {
    showWithdraw: false,
    tradeParams: {
      inputToken: undefined,
      inputValue: undefined,
      outputToken: undefined,
      outputValue: undefined,
      outputList: [],
      balance: 'Loading',
      prvBalance: 0,
      inputError: undefined,
      showSwapSuccess: false,
      showTradeConfirm: false,
      sending: false,
    },
  };

  menu = [
    {
      id: 'withdraw',
      icon: <Image source={withdrawBlack} style={{ width: 25, height: 25, resizeMode: 'contain' }} />,
      label: 'Withdraw',
      desc: 'Withdraw funds from your pDEX account to \nanother account',
      handlePress: () => this.showPopUp('withdraw'),
    }
  ];

  showPopUp = (name) => {
    this.setState({ transferAction: name });
  };

  closePopUp = () => {
    this.setState({ transferAction: null });
  };

  showWithdrawPopUp = () => {
    this.setState({ showWithdraw: true });
  };

  closeWithdrawPopUp = () => {
    this.setState({ showWithdraw: false });
  };

  updateTradeParams = (params, cb) => {
    const { tradeParams } = this.state;
    this.setState({ tradeParams : { ...tradeParams, ...params }}, cb);
  };

  getBalance = async (token) => {
    const {scAddress} = this.props;

    const balance = await getUniswapBalance(scAddress, token);
    this.setState({ balance });

    return balance;
  };

  renderModes() {
    return (
      <View style={dexStyle.header}>
        <BackButton size={20} width={20} />
        <TouchableOpacity style={dexStyle.mode} onPress={() => this.showPopUp('deposit')}>
          <Image source={depositIcon} />
          <Text style={dexStyle.modeText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={dexStyle.mode} onPress={this.showWithdrawPopUp}>
          <Image source={addLiquidityIcon} />
          <Text style={dexStyle.modeText}>Withdraw to pDEX</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderHeader() {
    return (
      <View style={mainStyle.header}>
        <View style={mainStyle.twoColumns}>
          {this.renderModes()}
          <View style={dexStyle.options}>
            <OptionMenu data={this.menu} style={mainStyle.textRight} />
          </View>
        </View>
      </View>
    );
  }

  renderTrade() {
    const {
      wallet,
      navigation,
      onAddHistory,
      dexMainAccount,
      tokens,
      isLoading,
      scAddress,
    } = this.props;
    const { tradeParams } = this.state;

    return (
      <Swap
        wallet={wallet}
        navigation={navigation}
        onClosePopUp={this.closePopUp}
        onAddHistory={onAddHistory}
        onUpdateTradeParams={this.updateTradeParams}
        tradeParams={tradeParams}
        dexMainAccount={dexMainAccount}
        tokens={tokens}
        isLoading={isLoading}
        scAddress={scAddress}
        onGetBalance={this.getBalance}
      />
    );
  }

  renderTransfer() {
    const {
      dexMainAccount,
      dexWithdrawAccount,
      wallet,
      accounts,
      tokens,
      onLoadData,
      onSelectPrivacyByTokenID,
      onAddHistory,
      onUpdateHistory,
      onGetHistoryStatus,
      navigation,
      scAddress,
    } = this.props;
    const { tradeParams, transferAction } = this.state;

    const inputToken = tradeParams.inputToken;

    return (
      <Transfer
        dexMainAccount={dexMainAccount}
        dexWithdrawAccount={dexWithdrawAccount}
        wallet={wallet}
        accounts={
          transferAction === 'deposit' ?
            accounts.filter(account => !dexUtil.isDEXWithdrawAccount(account.AccountName)) :
            accounts.filter(account => !dexUtil.isDEXAccount(account.AccountName))
        }
        tokens={tokens}
        action={transferAction}
        onClosePopUp={this.closePopUp}
        inputToken={inputToken}
        onLoadData={onLoadData}
        onSelectPrivacyByTokenID={onSelectPrivacyByTokenID}
        onAddHistory={onAddHistory}
        onUpdateHistory={onUpdateHistory}
        onGetHistoryStatus={onGetHistoryStatus}
        navigation={navigation}
        scAddress={scAddress}
      />
    );
  }

  renderRefreshControl() {
    const { isLoading, onLoadData } = this.props;
    return (
      <RefreshControl
        refreshing={isLoading}
        onRefresh={onLoadData}
        tintColor={COLORS.primary}
        colors={[COLORS.primary]}
      />
    );
  }

  render() {
    const {histories, onGetHistoryStatus, navigation, onAddHistory, wallet, dexMainAccount} = this.props;
    const {showWithdraw, balance, tradeParams} = this.state;
    return (
      <View style={mainStyle.wrapper}>
        {this.renderHeader()}
        <View style={[dexStyle.scrollViewContainer]}>
          <ScrollView refreshControl={this.renderRefreshControl()}>
            {this.renderTrade()}
            <RecentHistory
              histories={histories}
              onGetHistoryStatus={onGetHistoryStatus}
              navigation={navigation}
            />
          </ScrollView>
        </View>
        {this.renderTransfer()}
        <WithdrawSmartContract
          visible={showWithdraw}
          wallet={wallet}
          balance={balance}
          onAddHistory={onAddHistory}
          onClosePopUp={this.closeWithdrawPopUp}
          token={tradeParams?.inputToken}
          dexMainAccount={dexMainAccount}
        />
      </View>
    );
  }
}

Uniswap.propTypes = {
  accounts: PropTypes.array.isRequired,
  tokens: PropTypes.array.isRequired,
  wallet: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  onSelectPrivacyByTokenID: PropTypes.func.isRequired,
  onLoadData: PropTypes.func.isRequired,
  dexMainAccount: PropTypes.object.isRequired,
  dexWithdrawAccount: PropTypes.object.isRequired,
  onAddHistory: PropTypes.func.isRequired,
  onGetHistoryStatus: PropTypes.func.isRequired,
  onUpdateHistory: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  scAddress: PropTypes.string.isRequired,
  histories: PropTypes.array.isRequired,
};

export default Uniswap;
