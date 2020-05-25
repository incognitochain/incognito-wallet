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
import { connect } from 'react-redux';
import LoadingContainer from '@components/LoadingContainer';
import SimpleInfo from '@components/SimpleInfo';
import { change as rfOnChangeValue } from 'redux-form';
import routeNames from '@src/router/routeNames';
import { withdrawReceiversSelector } from '@src/redux/selectors/receivers';
import { HEADER_TITLE_RECEIVERS } from '@src/redux/types/receivers';
import LocalDatabase from '@utils/LocalDatabase';
import {
  selectedPrivacySeleclor,
  sharedSeleclor,
  accountSeleclor,
} from '@src/redux/selectors';
import { estimateFeeSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { actionInitEstimateFee } from '@src/components/EstimateFee/EstimateFee.actions';
import Withdraw, { formName } from './Withdraw';

class WithdrawContainer extends Component {
  constructor() {
    super();
  }

  async componentDidMount() {
    this.initEstimateFee();
  }

  componentDidUpdate(prevProps) {
    const { selectedPrivacy } = this.props;
    const { selectedPrivacy: oldSelectedPrivacy } = prevProps;
    const { tokenId } = selectedPrivacy;
    if (
      oldSelectedPrivacy !== selectedPrivacy ||
      prevProps?.isGettingTotalBalance !== this.props?.isGettingTotalBalance ||
      prevProps?.accountBalance !== this.props?.accountBalance ||
      prevProps?.isGettingTotalBalance.includes(tokenId) !==
        this.props?.isGettingTotalBalance.includes(tokenId)
    ) {
      this.initEstimateFee();
    }
  }

  initEstimateFee = async () =>
    await this.props?.actionInitEstimateFee({ screen: 'UnShield' });

  handleSendToken = async (payload = {}) => {
    try {
      const {
        tempAddress,
        originalAmount,
        originalFee,
        isUsedPRVFee,
        feeForBurn,
        feeForBurnText,
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
        amount: feeForBurnText,
      };
      const res = await tokenService.createSendPToken(
        tokenObject,
        isUsedPRVFee ? originalFee : 0,
        account,
        wallet,
        isUsedPRVFee ? paymentInfo : null,
        isUsedPRVFee ? 0 : originalFee,
      );
      console.log('res handleSendToken', res);
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
      TokenReceivers: {
        PaymentAddress: '',
        Amount: originalAmount + (isUsedPRVFee ? 0 : feeForBurn),
      },
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
      const { amount, isUsedPRVFee, remoteAddress, memo, fee } = payload;
      const tempAddress = await this.getWithdrawAddress({
        amount,
        paymentAddress: remoteAddress,
        memo,
      });
      const tx = await this.handleSendToken(payload);
      console.log('tx handleCentralizedWithdraw', tx);
      if (tx && !isUsedPRVFee) {
        await updatePTokenFee({ fee, paymentAddress: tempAddress });
      }
      return tx;
    } catch (e) {
      throw e;
    }
  };

  handleDecentralizedWithdraw = async (payload = {}) => {
    try {
      const { selectedPrivacy } = this.props;
      const { amount, originalAmount, remoteAddress } = payload;
      const tx = await this.handleBurningToken(payload);
      const data = {
        amount,
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
      await LocalDatabase.addWithdrawalData(data);
      await withdraw(data);
      await LocalDatabase.removeWithdrawalData(data.burningTxId);
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

  onSelectedItem = info => {
    const { rfOnChangeValue, navigation } = this.props;
    rfOnChangeValue(formName, 'toAddress', info.address);
    navigation.pop();
  };

  render() {
    const { selectedPrivacy, estimateFee, isGettingTotalBalance } = this.props;

    if (!estimateFee.init || isGettingTotalBalance.length > 0) {
      return <LoadingContainer />;
    }
    if (!selectedPrivacy) {
      return (
        <SimpleInfo
          type="warning"
          text="Hmm. We hit a snag. Please re-open the app and try again."
          subText="If second time didnt work: We'll need to take a closer look at this. Please send a message to go@incognito.org or t.me/@incognitonode for assistance."
        />
      );
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

const mapState = state => ({
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
};

export default connect(
  mapState,
  mapDispatch,
)(WithdrawContainer);
