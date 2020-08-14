import { CONSTANT_COMMONS, CONSTANT_KEYS } from '@src/constants';
import { getBalance as getTokenBalance } from '@src/redux/actions/token';
import {
  genCentralizedWithdrawAddress,
  updatePTokenFee,
  withdraw,
} from '@services/api/withdraw';
import { ExHandler } from '@services/exception';
import tokenService from '@services/wallet/tokenService';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect, useDispatch } from 'react-redux';
import LoadingContainer from '@components/LoadingContainer';
import { change as rfOnChangeValue, focus } from 'redux-form';
import routeNames from '@src/router/routeNames';
import { withdrawReceiversSelector } from '@src/redux/selectors/receivers';
import { HEADER_TITLE_RECEIVERS } from '@src/redux/types/receivers';
import { KEY_SAVE } from '@utils/LocalDatabase';
import {
  selectedPrivacySeleclor,
  sharedSeleclor,
  accountSeleclor,
} from '@src/redux/selectors';
import { estimateFeeSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import {
  actionInitEstimateFee,
  actionFetchedMaxFeePrv,
  actionFetchedMaxFeePToken,
  actionInit,
} from '@src/components/EstimateFee/EstimateFee.actions';
import convert from '@src/utils/convert';
import accountService from '@services/wallet/accountService';
import { MESSAGES } from '@screens/Dex/constants';
import Toast from '@components/core/Toast/Toast';
import {
  actionAddStorageData,
  actionRemoveStorageData,
} from '@screens/UnShield';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import Withdraw, { formName } from './Withdraw';

class WithdrawContainer extends Component {
  constructor(props) {
    super(props);
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
    await actionInitEstimateFee({ screen: 'UnShield' });
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
      actionInitEstimateFee({ screen: 'UnShield' });
    }
    if (accountBalance !== oldAccountBalance) {
      actionFetchedMaxFeePrv(accountBalance);
    }
    if (selectedPrivacy?.amount !== oldSelectedPrivacy?.amount) {
      actionFetchedMaxFeePToken(selectedPrivacy);
    }
  }

  handleSendToken = async (payload = {}) => {
    try {
      const {
        tempAddress,
        originalAmount,
        originalFee,
        isUsedPRVFee,
        feeForBurn,
        memo,
      } = payload;
      const { account, wallet, selectedPrivacy } = this.props;
      const type = CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND;
      const tokenObject = {
        Privacy: true,
        TokenID: selectedPrivacy?.tokenId,
        TokenName: selectedPrivacy?.name,
        TokenSymbol: selectedPrivacy?.symbol,
        TokenTxType: type,
        TokenAmount: originalAmount + (isUsedPRVFee ? 0 : feeForBurn),
        TokenReceivers: [
          {
            PaymentAddress: tempAddress,
            Amount: originalAmount + (isUsedPRVFee ? 0 : feeForBurn),
          },
        ],
      };
      const paymentInfo = {
        paymentAddressStr: tempAddress,
        amount: feeForBurn,
      };
      const res = await tokenService.createSendPToken(
        tokenObject,
        isUsedPRVFee ? originalFee : 0,
        account,
        wallet,
        isUsedPRVFee ? paymentInfo : null,
        isUsedPRVFee ? 0 : originalFee,
        memo,
      );
      if (res.txId) {
        return res;
      } else {
        throw new Error('Sent tx, but doesn\'t have txID, please check it');
      }
    } catch (error) {
      throw error;
    }
  };

  handleBurningToken = async (payload = {}) => {
    const { account, wallet, selectedPrivacy } = this.props;
    const type = CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND;
    const {
      originalAmount,
      originalFee,
      isUsedPRVFee,
      remoteAddress,
      feeForBurn,
    } = payload;
    const tokenObject = {
      Privacy: true,
      TokenID: selectedPrivacy?.tokenId,
      TokenName: selectedPrivacy?.name,
      TokenSymbol: selectedPrivacy?.symbol,
      TokenTxType: type,
      TokenAmount: originalAmount + (isUsedPRVFee ? 0 : feeForBurn),
      TokenReceivers: [],
    };
    try {
      const res = await tokenService.createBurningRequest(
        tokenObject,
        isUsedPRVFee ? originalFee : 0,
        isUsedPRVFee ? 0 : originalFee,
        remoteAddress,
        account,
        wallet,
      );
      //TODO: should we save tx to local in order to retry?
      if (res.txId) {
        return res;
      } else {
        throw new Error('Burned token, but doesnt have txID, please check it');
      }
    } catch (e) {
      throw e;
    }
  };

  getWithdrawAddress = async ({ amount, paymentAddress, memo }) => {
    let address;
    const { selectedPrivacy } = this.props;
    const walletAddress = selectedPrivacy?.paymentAddress;
    // centralized floW: BTC, BNB,...
    address = await genCentralizedWithdrawAddress({
      amount,
      paymentAddress,
      walletAddress,
      tokenId: selectedPrivacy?.tokenId,
      currencyType: selectedPrivacy?.currencyType,
      memo,
    });
    return address;
  };

  handleCentralizedWithdraw = async (payload = {}) => {
    try {
      const {
        amount,
        isUsedPRVFee,
        remoteAddress,
        memo,
        originalAmount,
        originalFee,
      } = payload;
      const { account, wallet, selectedPrivacy } = this.props;

      const prvFee = isUsedPRVFee ? originalFee : 0;
      const tokenFee = isUsedPRVFee ? 0 : originalFee;

      let spendingPRV;
      let spendingCoin;

      if (prvFee) {
        spendingPRV = await accountService.hasSpendingCoins(
          account,
          wallet,
          prvFee,
        );
      }

      spendingCoin = await accountService.hasSpendingCoins(
        account,
        wallet,
        originalAmount + tokenFee,
        selectedPrivacy.tokenId,
      );

      if (spendingCoin || spendingPRV) {
        return Toast.showError(MESSAGES.PENDING_TRANSACTIONS);
      }

      const tempAddress = await this.getWithdrawAddress({
        amount,
        paymentAddress: remoteAddress,
        memo,
      });
      if (!tempAddress) {
        throw Error('Can not create a temp address');
      }
      const tx = await this.handleSendToken({ ...payload, tempAddress });
      if (tx && !isUsedPRVFee) {
        await updatePTokenFee({
          fee: originalFee,
          paymentAddress: tempAddress,
        });
      }
      return tx;
    } catch (e) {
      throw e;
    }
  };

  handleDecentralizedWithdraw = async (payload = {}) => {
    try {
      const { selectedPrivacy, addStorageData, removeStorageData } = this.props;
      const { amount, originalAmount, remoteAddress } = payload;
      const tx = await this.handleBurningToken(payload);
      const data = {
        amount: convert.toNumber(amount, true),
        originalAmount,
        paymentAddress: remoteAddress,
        walletAddress: selectedPrivacy?.paymentAddress,
        tokenContractID: selectedPrivacy?.contractId,
        tokenId: selectedPrivacy?.tokenId,
        burningTxId: tx?.txId,
        currencyType: selectedPrivacy?.currencyType,
        isErc20Token: selectedPrivacy?.isErc20Token,
        externalSymbol: selectedPrivacy?.externalSymbol,
      };
      await addStorageData({
        keySave: KEY_SAVE.WITHDRAWAL_DATA_DECENTRALIZED,
        tx: data,
      });
      await withdraw(data);
      await removeStorageData({
        keySave: KEY_SAVE.WITHDRAWAL_DATA_DECENTRALIZED,
        burningTxId: data?.burningTxId,
      });
      return tx;
    } catch (e) {
      throw e;
    }
  };

  onShowFrequentReceivers = async () => {
    const { navigation } = this.props;
    try {
      navigation.navigate(routeNames.FrequentReceivers, {
        keySave: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_OUT_NETWORK,
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
    if (!estimateFee.init || !selectedPrivacy) {
      return <LoadingContainer />;
    }
    return (
      <Withdraw
        {...{
          ...this.props,
          onShowFrequentReceivers: this.onShowFrequentReceivers,
          handleCentralizedWithdraw: this.handleCentralizedWithdraw,
          handleDecentralizedWithdraw: this.handleDecentralizedWithdraw,
        }}
      />
    );
  }
}

const mapState = (state) => ({
  tokens: state.token?.followed,
  receivers: withdrawReceiversSelector(state).receivers,
  estimateFee: estimateFeeSelector(state),
  selectedPrivacy: selectedPrivacySeleclor.selectedPrivacy(state),
  getPrivacyDataByTokenID: selectedPrivacySeleclor.getPrivacyDataByTokenID(
    state,
  ),
  isGettingTotalBalance: sharedSeleclor.isGettingBalance(state),
  accountBalance: accountSeleclor.defaultAccountBalanceSelector(state),
});

const mapDispatch = {
  getTokenBalanceBound: getTokenBalance,
  rfOnChangeValue,
  actionInitEstimateFee,
  actionFetchedMaxFeePrv,
  actionFetchedMaxFeePToken,
  actionInit,
  focus,
  actionAddStorageData,
  actionRemoveStorageData,
};

WithdrawContainer.defaultProps = {
  selectedPrivacy: null,
  tokens: null,
};

WithdrawContainer.propTypes = {
  selectedPrivacy: PropTypes.object,
  getTokenBalanceBound: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  tokens: PropTypes.arrayOf(PropTypes.object),
  rfOnChangeValue: PropTypes.func.isRequired,
  receivers: PropTypes.any.isRequired,
  estimateFee: PropTypes.object.isRequired,
  getPrivacyDataByTokenID: PropTypes.func.isRequired,
  isGettingTotalBalance: PropTypes.array.isRequired,
  accountBalance: PropTypes.number.isRequired,
  actionInitEstimateFee: PropTypes.func.isRequired,
  actionFetchedMaxFeePrv: PropTypes.func.isRequired,
  actionFetchedMaxFeePToken: PropTypes.func.isRequired,
  actionInit: PropTypes.func.isRequired,
  focus: PropTypes.func.isRequired,
  actionAddStorageData: PropTypes.func.isRequired,
  actionRemoveStorageData: PropTypes.func.isRequired,
  addStorageData: PropTypes.func.isRequired,
  removeStorageData: PropTypes.func.isRequired,
};

const enhance = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const addStorageData = async (payload) =>
    await dispatch(actionAddStorageData(payload));
  const removeStorageData = async (payload) =>
    await dispatch(actionRemoveStorageData(payload));
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, addStorageData, removeStorageData }} />
    </ErrorBoundary>
  );
};

export default compose(
  enhance,
  connect(
    mapState,
    mapDispatch,
  ),
)(WithdrawContainer);
