import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from '@src/components/core';
import OptionMenu from '@components/OptionMenu/OptionMenu';
import withdrawBlack from '@assets/images/icons/withdraw-node.png';
import Transfer from '@screens/Dex/components/Transfer';
import RecentHistory from '@screens/Dex/components/RecentHistory';
import depositIcon from '@src/assets/images/icons/deposit_icon.png';
import addLiquidityIcon from '@src/assets/images/icons/add_liquidity_icon.png';
import removeLiquidityIcon from '@src/assets/images/icons/remove_liquidity_icon.png';
import dexUtils from '@utils/dex';
import COLORS from '@src/styles/colors';
import BackButton from '@components/BackButton/index';
import { MESSAGES } from '@screens/Dex/constants';
import AddPool from './components/AddPool';
import RemovePool from './components/RemovePool';
import { dexStyle, mainStyle } from './style';

const MODES = {
  ADD: 'add',
  REMOVE: 'remove',
};

class Dex extends React.Component {
  state = {
    mode: MODES.ADD,
    addLiquidityParams: {
      adding: false,
      inputToken: undefined,
      inputValue: undefined,
      inputFee: 0,
      pTokens: [],
      inputList: [],
      outputList: [],
      outputToken: undefined,
      outputValue: undefined,
      outputFee: 0,
      shareBalance: undefined,
      prvBalance: 0,
      inputError: undefined,
      showSuccess: false,
    },
    removeLiquidityParams: {
      pair: null,
      userPairs: [],
      topText: 0,
      bottomText: 0,
      prvBalance: 0,
      fee: undefined,
      showSuccess: false,
    }
  };

  menu = [
    {
      id: 'remove',
      icon: <Image source={removeLiquidityIcon} style={{ width: 25, height: 25, resizeMode: 'contain' }} />,
      label: 'Remove liquidity',
      desc: 'Remove your liquidity from the pool',
      handlePress: () => this.changeMode(MODES.REMOVE),
    },
  ];

  changeMode(mode) {
    this.setState({ mode });
  }

  showPopUp = (name) => {
    this.setState({ transferAction: name });
  };

  closePopUp = () => {
    const { mode } = this.state;

    if (mode === MODES.GET_STARTED_INVEST) {
      this.setState({ mode: MODES.ADD });
    }

    this.setState({ transferAction: null });
  };

  updateAddLiquidityParams = (params, cb) => {
    const { addLiquidityParams } = this.state;
    this.setState({ addLiquidityParams : { ...addLiquidityParams, ...params }}, cb);
  };

  updateRemoveLiquidityParams = (params, cb) => {
    const { removeLiquidityParams } = this.state;
    this.setState({ removeLiquidityParams : { ...removeLiquidityParams, ...params }}, cb);
  };

  renderModes() {
    const { mode } = this.state;
    return (
      <View style={dexStyle.header}>
        <BackButton size={20} width={20} />
        <TouchableOpacity style={dexStyle.mode} onPress={() => this.showPopUp('deposit')}>
          <Image source={depositIcon} />
          <Text style={dexStyle.modeText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={dexStyle.mode} onPress={() => this.showPopUp('withdraw')}>
          <Image source={withdrawBlack} style={{ width: 30, height: 27, resizeMode: 'contain' }} />
          <Text style={[dexStyle.modeText]}>Withdraw</Text>
        </TouchableOpacity>
        <TouchableOpacity style={dexStyle.mode} onPress={() => this.changeMode(MODES.ADD)}>
          <Image source={addLiquidityIcon} />
          <Text style={[
            dexStyle.modeText,
            (mode === MODES.ADD) && dexStyle.active
          ]}
          >
            Invest
          </Text>
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

  renderPool() {
    const {
      wallet,
      histories,
      onAddHistory,
      onUpdateHistory,
      onGetHistoryStatus,
      tokens,
      pairs,
      dexMainAccount,
      pairTokens,
      shares,
      isLoading,
      masterKeyAccounts,
    } = this.props;
    const { addLiquidityParams, mode, removeLiquidityParams } = this.state;

    if (mode === MODES.ADD) {
      return (
        <AddPool
          account={dexMainAccount}
          wallet={wallet}
          histories={histories}
          onAddHistory={onAddHistory}
          onUpdateHistory={onUpdateHistory}
          onGetHistoryStatus={onGetHistoryStatus}
          onUpdateParams={this.updateAddLiquidityParams}
          params={addLiquidityParams}
          tokens={tokens}
          pairTokens={pairTokens}
          pairs={pairs}
          isLoading={isLoading}
        />
      );
    }

    return (
      <RemovePool
        accounts={masterKeyAccounts}
        wallet={wallet}
        histories={histories}
        onAddHistory={onAddHistory}
        onUpdateHistory={onUpdateHistory}
        onGetHistoryStatus={onGetHistoryStatus}
        onUpdateParams={this.updateRemoveLiquidityParams}
        params={removeLiquidityParams}
        tokens={tokens}
        pairTokens={pairTokens}
        pairs={pairs}
        shares={shares}
        isLoading={isLoading}
      />
    );
  }

  renderMode() {
    return this.renderPool();
  }

  renderTransfer() {
    const {
      dexMainAccount,
      dexWithdrawAccount,
      wallet,
      accounts,
      tokens,
      onAddHistory,
      onUpdateHistory,
      onLoadData,
      onSelectPrivacyByTokenID,
      navigation,
    } = this.props;
    const {
      mode,
      addLiquidityParams,
      transferAction,
    } = this.state;

    let inputToken;
    let transferTokens = tokens;

    if (mode === MODES.ADD) {
      inputToken = addLiquidityParams.inputToken;
    }

    return (
      <Transfer
        dexMainAccount={dexMainAccount}
        dexWithdrawAccount={dexWithdrawAccount}
        wallet={wallet}
        accounts={(accounts || []).filter(item => !dexUtils.isDEXAccount(item.AccountName))}
        tokens={transferTokens}
        action={transferAction}
        onClosePopUp={this.closePopUp}
        inputToken={mode === MODES.ADD ? undefined : inputToken}
        onLoadData={onLoadData}
        onAddHistory={onAddHistory}
        onUpdateHistory={onUpdateHistory}
        onSelectPrivacyByTokenID={onSelectPrivacyByTokenID}
        navigation={navigation}
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
    const { histories, onGetHistoryStatus, navigation } = this.props;
    return (
      <View style={mainStyle.wrapper}>
        {this.renderHeader()}
        <View style={dexStyle.scrollViewContainer}>
          <ScrollView refreshControl={this.renderRefreshControl()}>
            {this.renderMode()}
            <RecentHistory
              histories={(histories || []).filter(item => item.type !== MESSAGES.TRADE)}
              onGetHistoryStatus={onGetHistoryStatus}
              navigation={navigation}
            />
          </ScrollView>
        </View>
        {this.renderTransfer()}
      </View>
    );
  }
}

Dex.propTypes = {
  accounts: PropTypes.array.isRequired,
  tokens: PropTypes.array.isRequired,
  wallet: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  histories: PropTypes.array.isRequired,
  onAddHistory: PropTypes.func.isRequired,
  onUpdateHistory: PropTypes.func.isRequired,
  onGetHistoryStatus: PropTypes.func.isRequired,
  onSelectPrivacyByTokenID: PropTypes.func.isRequired,
  onLoadData: PropTypes.func.isRequired,
  dexMainAccount: PropTypes.object.isRequired,
  dexWithdrawAccount: PropTypes.object.isRequired,
  pairs: PropTypes.array.isRequired,
  pairTokens: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  shares: PropTypes.object.isRequired,
  masterKeyAccounts: PropTypes.array.isRequired,
};

export default Dex;
