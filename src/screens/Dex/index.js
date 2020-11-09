import LoadingContainer from '@src/components/LoadingContainer';
import { getBalance, getInternalTokenList, getPTokenList, setListToken } from '@src/redux/actions/token';
import { setDefaultAccount } from '@src/redux/actions/account';
import { addHistory, getHistories, updateHistory, getHistoryStatus, updatePairs } from '@src/redux/actions/dex';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DEX } from '@utils/dex';
import { getTokenList } from '@services/api/token';
import { getPDEPairs } from '@services/wallet/RpcClientService';
import tokenService from '@services/wallet/tokenService';
import _ from 'lodash';
import { MESSAGES, PRIORITY_LIST } from '@screens/Dex/constants';
import { CustomError, ErrorCode, ExHandler } from '@services/exception';
import { accountSeleclor, selectedPrivacySeleclor } from '@src/redux/selectors';
import convertUtil from '@utils/convert';
import { listAllMasterKeyAccounts } from '@src/redux/selectors/masterKey';
import { reloadAccountList } from '@src/redux/actions/wallet';
import { createDefaultAccounts, saveWallet } from '@services/wallet/WalletService';
import Dex from './Dex';

class DexContainer extends Component {
  state = {
    dexMainAccount: {},
    dexWithdrawAccount: {},
    tokens: [],
    pairTokens: [],
    pairs: [],
    loading: false,
  };

  async componentDidMount() {
    const { wallet, reloadAccountList } = this.props;
    const accounts = (await wallet.listAccount())
      .map(item => ({
        ...item,
        Wallet: wallet,
      }));

    const dexMainAccount = accounts.find(item => item.AccountName.toLowerCase() === DEX.MAIN_ACCOUNT.toLowerCase());
    const dexWithdrawAccount = accounts.find(item => item.AccountName.toLowerCase() === DEX.WITHDRAW_ACCOUNT.toLowerCase());

    if (!dexMainAccount || !dexWithdrawAccount) {
      await createDefaultAccounts(wallet);
      await saveWallet(wallet);
      await reloadAccountList();
    }

    this.loadData();
  }

  componentWillUnmount() {
    clearInterval(this.interval);

    if (this.listener) {
      this.listener.remove();
      this.listener = null;
    }
  }

  async updateAccount() {
    const { wallet } = this.props;
    const accounts = (await wallet.listAccount())
      .map(item => ({
        ...item,
        Wallet: wallet,
      }));

    const dexMainAccount = accounts.find(item => item.AccountName.toLowerCase() === DEX.MAIN_ACCOUNT.toLowerCase());
    const dexWithdrawAccount = accounts.find(item => item.AccountName.toLowerCase() === DEX.WITHDRAW_ACCOUNT.toLowerCase());

    this.setState({ dexMainAccount, dexWithdrawAccount, masterKeyAccounts: accounts });
  }

  loadData = async () => {
    const { getHistories, navigation, updatePairs } = this.props;
    const { loading } = this.state;

    if (!this.listener) {
      this.listener = navigation.addListener('didFocus', this.loadData);
    }

    if (loading) {
      return;
    }

    try {
      await this.updateAccount();
      getHistories();
      this.setState({ loading: true });
      const pTokens = await getTokenList();
      const chainTokens = await tokenService.getPrivacyTokens();
      const chainPairs = await getPDEPairs();
      const tokens = tokenService.mergeTokens(chainTokens, pTokens);

      if (!_.has(chainPairs, 'state.PDEPoolPairs')) {
        throw new CustomError(ErrorCode.FULLNODE_DOWN);
      }

      const pairs = _(chainPairs.state.PDEPoolPairs)
        .map(pair => ({
          [pair.Token1IDStr]: pair.Token1PoolValue,
          [pair.Token2IDStr]: pair.Token2PoolValue,
          total: convertUtil.toRealTokenValue(tokens, pair.Token1IDStr, pair.Token1PoolValue) + convertUtil.toRealTokenValue(tokens, pair.Token2IDStr, pair.Token2PoolValue),
          keys: [pair.Token1IDStr, pair.Token2IDStr],
        }))
        .filter(pair => pair.total)
        .orderBy('total', 'desc')
        .value();
      const shares = chainPairs.state.PDEShares;

      Object.keys(shares).forEach(key => {
        if (shares[key] === 0){
          delete shares[key];
        }
      });

      const pairTokens = _(tokens)
        .filter(token => pairs.find(pair => pair.keys.includes(token.id)))
        .orderBy([
          item => PRIORITY_LIST.indexOf(item?.id) > -1 ? PRIORITY_LIST.indexOf(item?.id) : 100,
          'hasIcon',
          token => _.maxBy(pairs, pair => pair.keys.includes(token.id) ? pair.total : 0).total],
        ['asc', 'desc', 'desc']
        )
        .value();
      this.setState({ pairs, pairTokens, tokens, shares });
      updatePairs(pairs);
    } catch(error) {
      new ExHandler(error).showErrorToast();
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      wallet,
      navigation,
      histories,
      addHistory,
      updateHistory,
      getHistoryStatus,
      getHistories,
      account,
      selectPrivacyByTokenID,
      accounts,
    } = this.props;
    const {
      dexMainAccount,
      dexWithdrawAccount,
      tokens,
      pairTokens,
      pairs,
      loading,
      shares,
      masterKeyAccounts,
    } = this.state;

    if (!wallet || !dexMainAccount?.AccountName || !dexWithdrawAccount?.AccountName) {
      return (
        <LoadingContainer />
      );
    }

    return (
      <Dex
        wallet={wallet}
        navigation={navigation}
        histories={histories}
        onAddHistory={addHistory}
        onUpdateHistory={updateHistory}
        onGetHistoryStatus={getHistoryStatus}
        onGetHistories={getHistories}
        onSelectPrivacyByTokenID={selectPrivacyByTokenID}
        dexMainAccount={dexMainAccount}
        dexWithdrawAccount={dexWithdrawAccount}
        accounts={accounts}
        tokens={tokens}
        pairTokens={pairTokens}
        pairs={pairs}
        onLoadData={this.loadData}
        isLoading={loading}
        account={account}
        shares={shares}
        masterKeyAccounts={masterKeyAccounts}
      />
    );
  }
}

const mapState = state => ({
  account: accountSeleclor.defaultAccount(state),
  wallet: state.wallet,
  histories: state.dex.histories.filter(item => item.type !== MESSAGES.TRADE),
  selectPrivacyByTokenID: selectedPrivacySeleclor.getPrivacyDataByTokenID(state),
  accounts: listAllMasterKeyAccounts(state),
});

const mapDispatch = {
  setListToken,
  getBalance,
  getPTokenList,
  getInternalTokenList,
  setSelectedPrivacy,
  setDefaultAccount,
  getHistories,
  addHistory,
  updateHistory,
  getHistoryStatus,
  updatePairs,
  reloadAccountList,
};

DexContainer.propTypes = {
  account: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
  histories: PropTypes.array.isRequired,
  getHistories: PropTypes.func.isRequired,
  addHistory: PropTypes.func.isRequired,
  updateHistory: PropTypes.func.isRequired,
  getHistoryStatus: PropTypes.func.isRequired,
  selectPrivacyByTokenID: PropTypes.func.isRequired,
  updatePairs: PropTypes.func.isRequired,
  accounts: PropTypes.array.isRequired,
  reloadAccountList: PropTypes.func.isRequired,
};

export default connect(
  mapState,
  mapDispatch
)(DexContainer);
