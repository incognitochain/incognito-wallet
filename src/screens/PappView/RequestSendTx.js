import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Button,
  ScrollView,
  Container,
} from '@src/components/core';
import {
  accountSelector,
  tokenSelector,
  selectedPrivacySelector,
} from '@src/redux/selectors';
import formatUtil from '@src/utils/format';
import accountService from '@src/services/wallet/accountService';
import tokenService from '@src/services/wallet/tokenService';
import LoadingTx from '@src/components/LoadingTx';
import { CONSTANT_COMMONS } from '@src/constants';
import { ExHandler } from '@src/services/exception';
import { MAX_FEE_PER_TX } from '@src/components/EstimateFee/EstimateFee.utils';
import { MESSAGES } from '@screens/Dex/constants';
import { actionLogEvent } from '@src/screens/Performance';
import convert from '@src/utils/convert';
import { compose } from 'recompose';
import { requestSendTxStyle } from './style';

const DEFAULT_FEE = 30; // in nano

class RequestSendTx extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSending: false,
    };
  }

  _handleSendNativeToken = async ({ toAddress, nanoAmount, fee, info }) => {
    const { account, wallet } = this.props;
    fee = fee || DEFAULT_FEE;
    const originalAmount = nanoAmount;
    const originalFee = Number(fee);

    const paymentInfos = [
      {
        paymentAddressStr: toAddress,
        amount: originalAmount,
      },
    ];

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

  _handleSendToken = async ({
    toAddress,
    nanoAmount,
    totalFee,
    info,
    paymentInfos,
  }) => {
    const { selectedPrivacy, account, wallet, actionLogEvent } = this.props;
    const type = CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND;
    const originalAmount = nanoAmount;
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
    try {
      this.setState({ isSending: true });
      const balanceToken = await accountService.getBalance(
        account,
        wallet,
        selectedPrivacy?.tokenId,
      );
      const balancePRV = await accountService.getBalance(account, wallet);
      if (balanceToken < originalAmount) {
        throw new Error(MESSAGES.BALANCE_INSUFFICIENT);
      }
      if (balancePRV < totalFee) {
        throw new Error(MESSAGES.BALANCE_INSUFFICIENT);
      }
      const res = await tokenService.createSendPToken(
        tokenObject,
        MAX_FEE_PER_TX,
        account,
        wallet,
        paymentInfos,
        0,
        info,
        actionLogEvent,
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

  handleSendTx = async () => {
    const { actionLogEvent } = this.props;
    try {
      const {
        selectedPrivacy,
        toAddress,
        amount,
        info,
        pendingTxId,
        onSendSuccess,
        paymentInfos,
      } = this.props;
      let sendFn;
      if (selectedPrivacy?.isToken) sendFn = this._handleSendToken;
      if (selectedPrivacy?.isMainCrypto) sendFn = this._handleSendNativeToken;

      const res = await sendFn({
        toAddress,
        nanoAmount: amount,
        pendingTxId,
        info,
        paymentInfos,
      });
      onSendSuccess(res);
    } catch (e) {
      actionLogEvent({ desc: `get spending PRV ${JSON.stringify(e)}` });
      const { onSendFailed } = this.props;
      onSendFailed(e);
      new ExHandler(e, '').showErrorToast(true);
    }
  };

  renderData = (label, value) => {
    return (
      <View style={requestSendTxStyle.infoContainer}>
        <Text style={requestSendTxStyle.infoLabel}>{label}</Text>
        <Text style={requestSendTxStyle.infoValue}>{value}</Text>
      </View>
    );
  };

  render() {
    const { isSending } = this.state;
    const {
      onCancel,
      selectedPrivacy,
      toAddress,
      amount,
      url,
      info,
      paymentInfos,
      totalFee,
    } = this.props;
    return (
      <ScrollView>
        <Container style={requestSendTxStyle.container}>
          <Text style={requestSendTxStyle.title}> REQUEST SEND TX </Text>
          {this.renderData('PAPP URL', url)}
          {this.renderData('To address', toAddress)}
          {this.renderData(
            'Amount',
            `${formatUtil.amount(amount, selectedPrivacy?.pDecimals)} ${
              selectedPrivacy?.symbol
            }`,
          )}
          {this.renderData(
            'Fee',
            `${formatUtil.amount(
              totalFee,
              CONSTANT_COMMONS.DECIMALS.MAIN_CRYPTO_CURRENCY,
            )} ${CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV}`,
          )}
          {this.renderData('Info', info)}
          <View style={requestSendTxStyle.groupBtn}>
            <Button
              style={requestSendTxStyle.cancelBtn}
              title="Cancel"
              onPress={onCancel}
            />
            <Button
              style={requestSendTxStyle.submitBtn}
              title={isSending ? 'Sending...' : 'Confirm Send'}
              onPress={this.handleSendTx}
            />
          </View>
          {isSending && <LoadingTx />}
        </Container>
      </ScrollView>
    );
  }
}

const mapState = (state) => ({
  account: accountSelector.defaultAccount(state),
  wallet: state.wallet,
  tokens: tokenSelector.followed(state),
  selectPrivacyByTokenID: selectedPrivacySelector.getPrivacyDataByTokenID(
    state,
  ),
});

const mapDispatch = {
  actionLogEvent,
};

RequestSendTx.defaultProps = {
  info: null,
  paymentInfos: [],
  totalFee: 0,
};

RequestSendTx.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSendSuccess: PropTypes.func.isRequired,
  onSendFailed: PropTypes.func.isRequired,
  selectedPrivacy: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
  toAddress: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  info: PropTypes.string,
  url: PropTypes.string.isRequired,
  pendingTxId: PropTypes.number.isRequired,
  actionLogEvent: PropTypes.func.isRequired,
  paymentInfos: PropTypes.array,
  totalFee: PropTypes.number,
};

const enhance = (WrapComponent) => (props) => {
  const { paymentInfos } = props;
  const totalFee =
    MAX_FEE_PER_TX +
      paymentInfos?.reduce(
        (prev, current) => (prev += convert.toNumber(current?.amount)),
        0,
      ) || 0;
  return <WrapComponent {...{ ...props, totalFee }} />;
};

export default compose(
  connect(
    mapState,
    mapDispatch,
  ),
  enhance,
)(RequestSendTx);
