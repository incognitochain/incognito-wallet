import { Button, RefreshControl, ScrollView, Toast } from '@src/components/core';
import HistoryList from '@src/components/HistoryList';
import LoadingContainer from '@src/components/LoadingContainer';
import { CONSTANT_COMMONS } from '@src/constants';
import { accountSeleclor, selectedPrivacySeleclor } from '@src/redux/selectors';
import ROUTE_NAMES from '@src/router/routeNames';
import { getpTokenHistory, removeHistory } from '@src/services/api/history';
import { ExHandler } from '@src/services/exception';
import tokenService from '@src/services/wallet/tokenService';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { compose } from 'redux';

const combineHistory = (histories, historiesFromApi, symbol, externalSymbol, decimals, pDecimals) => {
  const data = [];

  historiesFromApi && historiesFromApi.forEach((h) => {
    data.push({
      id: h?.id,
      inchainTx: h?.inchainTx,
      outchainTx: h?.outchainTx,
      time: h?.updatedAt,
      type: h?.addressType,
      toAddress: h?.userPaymentAddress,
      fromAddress: h?.userPaymentAddress,
      amount: h?.incognitoAmount,
      requestedAmount: h?.requestedAmount,
      symbol: externalSymbol,
      decimals,
      pDecimals,
      status: h?.statusText,
      statusCode: h?.status,
      cancelable: h?.cancelable,
      currencyType: h?.currencyType,
      decentralized: h?.decentralized,
      walletAddress: h?.walletAddress,
      privacyTokenAddress: h?.privacyTokenAddress,
      erc20TokenAddress: h?.erc20TokenAddress,
      userPaymentAddress: h?.userPaymentAddress,
      canRetryExpiredDeposit: h?.canRetryExpiredDeposit,
      expiredAt: h?.expiredAt,
      depositAddress: h?.depositTmpAddress
    });
  });

  histories && histories.forEach(h => {
    data.push({
      id: h?.txID,
      incognitoTxID: h?.txID,
      time: h?.time,
      type: h?.isIn ?  CONSTANT_COMMONS.HISTORY.TYPE.RECEIVE : CONSTANT_COMMONS.HISTORY.TYPE.SEND,
      toAddress: h?.receivers,
      amount: h?.amountPToken,
      symbol: h?.tokenSymbol,
      decimals,
      pDecimals,
      status: h?.status,
      fee: h?.amountNativeToken,
      feePToken: h?.feePToken,
    });
  });

  return data.sort((a, b) => new Date(a.time).getTime() < new Date(b.time).getTime() ? 1 : -1);
};


class HistoryTokenContainer extends Component {
  constructor() {
    super();

    this.state = {
      isLoading: true,
      histories: [],
      historiesFromApi: [],
    };
  }

  componentWillMount() {
    const { navigation } = this.props;
    navigation.addListener(
      'didFocus',
      () => {
        this.handleLoadHistory();
      }
    );
  }

  componentDidUpdate(prevProps) {
    const token = this.getToken(this.props);
    const prevToken = this.getToken(prevProps);

    if (token && (token?.id !== prevToken?.id)) {
      this.handleLoadHistory();
    }
  }

  handleCancelEtaHistory = async history => {
    try {
      const data = await removeHistory({ historyId: history?.id, currencyType: history?.currencyType, isDecentralized: history?.decentralized });
      if (data) {
        Toast.showSuccess('Canceled');
        this.handleLoadHistory();
      }
    } catch (e) {
      new ExHandler(e, 'Cancel this transaction failed, please try again.').showErrorToast();
    }
  }

  handleLoadHistory = async () => {
    try {
      this.setState({ isLoading: true });
      const { wallet, defaultAccount } = this.props;
      const token = this.getToken(this.props);
  
      const [histories, historiesFromApi] = await Promise.all([
        this.loadTokentHistory(wallet, defaultAccount, token),
        this.getHistoryFromApi()
      ]);

      this.setState({
        historiesFromApi,
        histories
      });
    } catch (e) {
      new ExHandler(e).showErrorToast();
    } finally {
      this.setState({ isLoading: false });
    }
  }

  getToken = (props) => {
    const { selectedPrivacy, tokens } = props;
    return tokens?.find(t => t?.id === selectedPrivacy?.tokenId);
  }

  getHistoryFromApi = async () => {
    try {
      const { selectedPrivacy } = this.props;
      const { isDeposable, isWithdrawable, paymentAddress } = selectedPrivacy;

      if (!isWithdrawable || !isDeposable) {
        return;
      }

      const histories = await getpTokenHistory({ paymentAddress, tokenId: selectedPrivacy?.tokenId });

      return histories;
    } catch (e) {
      throw e;
    }
  }

  loadTokentHistory = async (wallet, account, token) => {
    try {
      if (!wallet) {
        throw new Error('Wallet is not exist to load history');
      }

      if (!account) {
        throw new Error('Account is not exist to load history');
      }

      const histories = await tokenService.getTokenHistory({
        wallet,
        account,
        token
      });

      return histories;
    } catch (e) {
      throw e;
    }
  };

  handleScrollReload = () => {
    const { onLoad } = this.props;
    if (typeof onLoad === 'function') {
      onLoad();
    }

    this.handleLoadHistory();
  }

  renderActionButton = () => {
    const { selectedPrivacy, navigation } = this.props;
    if (selectedPrivacy?.isDeposable) {
      return (
        <Button
          title='Make a deposit'
          onPress={() => {
            navigation.navigate(ROUTE_NAMES.Deposit);
          }}
        />
      );
    }

    return null;
  }

  render() {
    const { isLoading, histories, historiesFromApi } = this.state;
    const { selectedPrivacy } = this.props;

    if (!selectedPrivacy) {
      return <LoadingContainer />;
    }

    return (
      <ScrollView
        contentContainerStyle={{
          minHeight: '100%'
        }}
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            onRefresh={this.handleScrollReload}
          />
        )}
      >
        <HistoryList
          histories={combineHistory(histories, historiesFromApi, selectedPrivacy?.symbol, selectedPrivacy?.externalSymbol, selectedPrivacy?.decimals, selectedPrivacy?.pDecimals)}
          actionButton={this.renderActionButton()}
          onCancelEtaHistory={this.handleCancelEtaHistory}
        />
      </ScrollView>
    );
  }
}

const mapState = state => ({
  selectedPrivacy: selectedPrivacySeleclor.selectedPrivacy(state),
  wallet: state.wallet,
  defaultAccount: accountSeleclor.defaultAccount(state),
  tokens: state.token.followed,
});

HistoryTokenContainer.defaultProps = {
  selectedPrivacy: null,
  onLoad: null
};

HistoryTokenContainer.propTypes = {
  selectedPrivacy: PropTypes.object,
  wallet: PropTypes.object.isRequired,
  defaultAccount: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  onLoad: PropTypes.func,
};

export default compose(
  connect(mapState),
  withNavigation
)(HistoryTokenContainer);
