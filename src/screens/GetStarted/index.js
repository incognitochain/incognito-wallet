import { login } from '@src/services/auth';
import { CONSTANT_CONFIGS } from '@src/constants';
import { reloadWallet, reloadAccountList } from '@src/redux/actions/wallet';
import { followDefaultTokens } from '@src/redux/actions/account';
import { getPTokenList, getInternalTokenList } from '@src/redux/actions/token';
import { loadPin } from '@src/redux/actions/pin';
import { accountSeleclor } from '@src/redux/selectors';
import routeNames from '@src/router/routeNames';
import { CustomError, ErrorCode, ExHandler } from '@src/services/exception';
import { savePassword } from '@src/services/wallet/passwordService';
import serverService from '@src/services/wallet/Server';
import { initWallet } from '@src/services/wallet/WalletService';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DEX } from '@src/utils/dex';
import accountService from '@src/services/wallet/accountService';
import { actionInit } from '@src/screens/Notification';
import { actionLogEvent } from '@screens/Performance';
import { actionFetch as actionFetchHomeConfigs } from '@screens/Home/Home.actions';
import GetStarted from './GetStarted';

class GetStartedContainer extends Component {
  constructor() {
    super();

    this.state = {
      isInitialing: true,
      isCreating: false,
      errorMsg: null,
    };
  }

  componentDidMount() {
    this.initApp();
  }

  onError = (msg) => this.setState({ errorMsg: msg });

  goHome = async () => {
    try {
      const { navigation, pin, initNotification } = this.props;

      const wallet = await this.getExistedWallet();

      let accounts = await wallet.listAccount();

      if (!accounts.find((item) => item.AccountName === DEX.MAIN_ACCOUNT)) {
        const firstAccount = accounts[0];
        await accountService.createAccount(
          DEX.MAIN_ACCOUNT,
          wallet,
          accountService.parseShard(firstAccount),
        );
      }

      if (!accounts.find((item) => item.AccountName === DEX.WITHDRAW_ACCOUNT)) {
        accounts = await wallet.listAccount();
        const dexMainAccount = accounts.find(
          (item) => item.AccountName === DEX.MAIN_ACCOUNT,
        );
        await accountService.createAccount(
          DEX.WITHDRAW_ACCOUNT,
          wallet,
          accountService.parseShard(dexMainAccount),
        );
      }
      const { reloadAccountList } = this.props;
      await reloadAccountList();
      await initNotification();
      if (pin) {
        navigation.navigate(routeNames.AddPin, {
          action: 'login',
          redirectRoute: routeNames.Home,
        });
      } else {
        navigation.navigate(routeNames.Home);
      }
    } catch (error) {
      console.log(error);
      new ExHandler(error).showErrorToast();
    }
  };

  getExistedWallet = async () => {
    try {
      const { reloadWallet } = this.props;
      const wallet = await reloadWallet(
        CONSTANT_CONFIGS.PASSPHRASE_WALLET_DEFAULT,
      );
      if (wallet) {
        return wallet;
      }
      return null;
    } catch (e) {
      throw new CustomError(ErrorCode.wallet_can_not_load_existed_wallet, {
        rawError: e,
      });
    }
  };

  initApp = async () => {
    const { loadPin, actionFetchHomeConfigs, actionLogEvent } = this.props;
    try {
      await actionLogEvent({ restart: true });
      await loadPin();
      await actionLogEvent({
        desc: 'load pin',
      });
      this.setState({ isInitialing: true });
      const serverLocalList = (await serverService.get()) ?? [];
      await actionLogEvent({
        desc: 'get server service',
      });
      const { getPTokenList, getInternalTokenList } = this.props;
      await login();
      await actionLogEvent({
        desc: 'login',
      });
      await actionFetchHomeConfigs();
      await actionLogEvent({
        desc: 'get home configs',
      });
      try {
        const [pTokens] = await new Promise.all([
          await getPTokenList(),
          await getInternalTokenList(),
        ]);
        await actionLogEvent({
          desc: 'get pToken + internal list',
        });
        await this.setState({ pTokens });
      } catch (e) {
        throw new CustomError(ErrorCode.getStarted_load_token_failed, {
          rawError: e,
        });
      }

      if (!serverLocalList || serverLocalList.length === 0) {
        await serverService.setDefaultList();
        await actionLogEvent({
          desc: 'server services set default lisi',
        });
      }

      const wallet = await this.getExistedWallet();
      await actionLogEvent({
        desc: 'get exited wallet',
      });
      // loaded wallet & then continue to Wallet screen
      if (!wallet) {
        this.setState({ isCreating: true });
        // create new Wallet
        await this.handleCreateNew();
        await actionLogEvent({
          desc: 'create new wallet',
        });
      }

      this.setState({ isInitialing: false, isCreating: false });
      await this.goHome();
      await actionLogEvent({
        desc: 'go home',
      });
    } catch (e) {
      this.setState({ isInitialing: false, isCreating: false });
      this.onError(
        new ExHandler(
          e,
          'Sorry, something went wrong while opening the wallet. Please check your connection or re-install the application and try again.',
        ).writeLog().message,
      );
    }
  };

  handleCreateWallet = async () => {
    try {
      await savePassword(CONSTANT_CONFIGS.PASSPHRASE_WALLET_DEFAULT);

      // just make sure there has no existed wallet
      const wallet = await this.getExistedWallet();

      if (wallet) {
        throw new CustomError(
          ErrorCode.getStarted_can_not_create_wallet_on_existed,
        );
      }

      requestAnimationFrame(() => {
        return initWallet();
      });
    } catch (e) {
      throw new CustomError(ErrorCode.wallet_can_not_create_new_wallet, {
        rawError: e,
      });
    }
  };

  setDefaultPToken = async () => {
    try {
      const { account, followDefaultTokens } = this.props;
      const { pTokens } = this.state;

      if (!account) throw new Error('Missing account');

      await followDefaultTokens(account, pTokens);
    } catch {
      // can ignore this err
    }
  };

  handleCreateNew = async () => {
    try {
      const { reloadWallet } = this.props;
      await this.handleCreateWallet();
      const wallet = await reloadWallet();

      if (wallet) {
        await this.setDefaultPToken(wallet);
        this.goHome();
      } else {
        throw new Error('Load new wallet failed');
      }
    } catch (e) {
      throw e;
    }
  };

  handleRytry = () => {
    this.initApp();
    this.setState({ errorMsg: null, isInitialing: true });
  };

  render() {
    const { isInitialing, errorMsg, isCreating } = this.state;
    return (
      <GetStarted
        errorMsg={errorMsg}
        isInitialing={isInitialing}
        isCreating={isCreating}
        onRetry={this.handleRytry}
      />
    );
  }
}

const mapDispatch = {
  reloadWallet,
  getPTokenList,
  getInternalTokenList,
  followDefaultTokens,
  reloadAccountList,
  loadPin,
  initNotification: actionInit,
  actionFetchHomeConfigs,
  actionLogEvent,
};

const mapState = (state) => ({
  account: accountSeleclor.defaultAccount(state),
  pin: state.pin.pin,
});

GetStartedContainer.propTypes = {
  reloadWallet: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  getPTokenList: PropTypes.func.isRequired,
  getInternalTokenList: PropTypes.func.isRequired,
  account: PropTypes.object,
  reloadAccountList: PropTypes.func.isRequired,
  followDefaultTokens: PropTypes.func.isRequired,
  initNotification: PropTypes.func.isRequired,
  actionFetchHomeConfigs: PropTypes.func.isRequired,
  loadPin: PropTypes.func.isRequired,
};

GetStartedContainer.defaultProps = {
  account: null,
};

export default connect(
  mapState,
  mapDispatch,
)(GetStartedContainer);
