import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LoadingContainer from '@components/LoadingContainer';
import { connect } from 'react-redux';
import accountService from '@services/wallet/accountService';
import tokenService from '@services/wallet/tokenService';
import { getBalance } from '@src/redux/actions/account';
import { getBalance as getTokenBalance } from '@src/redux/actions/token';
import { CONSTANT_COMMONS, CONSTANT_KEYS } from '@src/constants';
import { MESSAGES } from '@screens/Dex/constants';
import { actionToggleModal as toggleModal } from '@src/components/Modal';
import routeNames from '@src/router/routeNames';
import { ExHandler } from '@src/services/exception';
import { change as rfOnChangeValue, focus } from 'redux-form';
import { sendInReceiversSelector } from '@src/redux/selectors/receivers';
import { HEADER_TITLE_RECEIVERS } from '@src/redux/types/receivers';
import { estimateFeeSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { withNavigation } from 'react-navigation';
import {
  selectedPrivacySeleclor,
  sharedSeleclor,
  accountSeleclor,
} from '@src/redux/selectors';
import {
  actionInitEstimateFee,
  actionFetchedMaxFeePrv,
  actionFetchedMaxFeePToken,
  actionInit,
} from '@src/components/EstimateFee/EstimateFee.actions';
import SendCrypto, { formName } from './SendCrypto';

class SendCryptoContainer extends Component {
  constructor() {
    super();
    this.state = {
      isSending: false,
    };
  }

  async componentDidMount() {
    const {
      selectedPrivacy,
      accountBalance,
      actionInitEstimateFee,
      actionFetchedMaxFeePrv,
      actionFetchedMaxFeePToken,
      actionInit,
    } = this.props;
    await actionInit();
    await actionInitEstimateFee();
    await actionFetchedMaxFeePrv(accountBalance);
    await actionFetchedMaxFeePToken(selectedPrivacy);
  }

  componentDidUpdate(prevProps) {
    const {
      selectedPrivacy,
      actionInitEstimateFee,
      accountBalance,
      actionFetchedMaxFeePrv,
      actionFetchedMaxFeePToken,
    } = this.props;
    const {
      selectedPrivacy: oldSelectedPrivacy,
      accountBalance: oldAccountBalance,
    } = prevProps;
    if (oldSelectedPrivacy?.tokenId !== selectedPrivacy?.tokenId) {
      actionInitEstimateFee();
    }
    if (accountBalance !== oldAccountBalance) {
      actionFetchedMaxFeePrv(accountBalance);
    }
    if (selectedPrivacy?.amount !== oldSelectedPrivacy?.amount) {
      actionFetchedMaxFeePToken(selectedPrivacy);
    }
  }

  getTxInfo = ({ message } = {}) => message;

  _handleSendMainCrypto = async (values) => {
    const { account, wallet } = this.props;
    const { toAddress, message, originalFee, originalAmount } = values;
    const paymentInfos = [
      {
        paymentAddressStr: toAddress,
        amount: originalAmount,
      },
    ];
    const info = this.getTxInfo({ message });
    try {
      this.setState({
        isSending: true,
      });

      const res = await accountService.createAndSendNativeToken(
        paymentInfos,
        originalFee,
        true,
        account,
        wallet,
        info,
      );
      if (res.txId) {
        return res;
      } else {
        throw new Error('Sent tx, but doesnt have txID, please check it');
      }
    } catch (e) {
      throw e;
    } finally {
      this.setState({ isSending: false });
    }
  };

  _handleSendToken = async (values) => {
    const { account, wallet, selectedPrivacy } = this.props;
    const {
      toAddress,
      message,
      isUseTokenFee,
      originalFee,
      originalAmount,
    } = values;
    const type = CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND;
    const tokenObject = {
      Privacy: true,
      TokenID: selectedPrivacy?.tokenId,
      TokenName: selectedPrivacy?.name,
      TokenSymbol: selectedPrivacy?.symbol,
      TokenTxType: type,
      TokenAmount: originalAmount,
      TokenReceivers: [
        {
          PaymentAddress: toAddress,
          Amount: originalAmount,
        },
      ],
    };
    const info = this.getTxInfo({ message });
    try {
      this.setState({ isSending: true });
      if (!isUseTokenFee) {
        const prvBalance = await accountService.getBalance(account, wallet);

        if (prvBalance < originalFee) {
          throw new Error(MESSAGES.NOT_ENOUGH_NETWORK_FEE);
        }
      }

      const res = await tokenService.createSendPToken(
        tokenObject,
        isUseTokenFee ? 0 : originalFee,
        account,
        wallet,
        null,
        isUseTokenFee ? originalFee : 0,
        info,
      );

      if (res.txId) {
        return res;
      } else {
        throw new Error('Sent tx, but doesnt have txID, please check it');
      }
    } catch (e) {
      throw e;
    } finally {
      this.setState({ isSending: false });
    }
  };

  handleSend = () => {
    const { selectedPrivacy } = this.props;

    if (selectedPrivacy?.isToken) return this._handleSendToken;
    if (selectedPrivacy?.isMainCrypto) return this._handleSendMainCrypto;
  };

  onShowFrequentReceivers = async () => {
    const { navigation } = this.props;
    try {
      navigation.navigate(routeNames.FrequentReceivers, {
        keySave: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK,
        onSelectedItem: this.onSelectedItem,
        headerTitle: HEADER_TITLE_RECEIVERS.ADDRESS_BOOK,
      });
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

  onSelectedItem = (info) => {
    const { rfOnChangeValue, navigation, focus } = this.props;
    rfOnChangeValue(formName, 'toAddress', info.address);
    focus(formName, 'toAddress');
    navigation.pop();
  };

  render() {
    const { selectedPrivacy, estimateFee } = this.props;
    const { isSending } = this.state;
    const componentProps = {
      handleSend: this.handleSend(),
      isSending,
    };
    if (!selectedPrivacy || !estimateFee.init) {
      return <LoadingContainer />;
    }
    return (
      <SendCrypto
        {...{
          ...this.props,
          onShowFrequentReceivers: this.onShowFrequentReceivers,
        }}
        {...componentProps}
      />
    );
  }
}

const mapState = (state) => ({
  tokens: state.token.followed,
  receivers: sendInReceiversSelector(state).receivers,
  estimateFee: estimateFeeSelector(state),
  selectedPrivacy: selectedPrivacySeleclor.selectedPrivacy(state),
  getPrivacyDataByTokenID: selectedPrivacySeleclor.getPrivacyDataByTokenID(
    state,
  ),
  isGettingTotalBalance: sharedSeleclor.isGettingBalance(state),
  accountBalance: accountSeleclor.defaultAccountBalanceSelector(state),
});

const mapDispatch = {
  getAccountBalanceBound: getBalance,
  getTokenBalanceBound: getTokenBalance,
  toggleModal,
  rfOnChangeValue,
  actionInitEstimateFee,
  actionFetchedMaxFeePrv,
  actionFetchedMaxFeePToken,
  actionInit,
  focus,
};

SendCryptoContainer.defaultProps = {
  selectedPrivacy: null,
  tokens: null,
};

SendCryptoContainer.propTypes = {
  navigation: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
  selectedPrivacy: PropTypes.object,
  getAccountBalanceBound: PropTypes.func.isRequired,
  getTokenBalanceBound: PropTypes.func.isRequired,
  tokens: PropTypes.arrayOf(PropTypes.object),
  rfOnChangeValue: PropTypes.func.isRequired,
  estimateFee: PropTypes.object.isRequired,
  getPrivacyDataByTokenID: PropTypes.func.isRequired,
  isGettingTotalBalance: PropTypes.array.isRequired,
  accountBalance: PropTypes.number.isRequired,
  actionInitEstimateFee: PropTypes.func.isRequired,
  actionFetchedMaxFeePrv: PropTypes.func.isRequired,
  actionFetchedMaxFeePToken: PropTypes.func.isRequired,
  actionInit: PropTypes.func.isRequired,
  focus: PropTypes.func.isRequired,
};

export default connect(
  mapState,
  mapDispatch,
)(withNavigation(SendCryptoContainer));
