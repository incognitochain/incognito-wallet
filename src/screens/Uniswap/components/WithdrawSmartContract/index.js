import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  Button,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity
} from '@src/components/core';
import {TextInput as ReactInput, Keyboard, TouchableWithoutFeedback} from 'react-native';
import accountService from '@services/wallet/accountService';
import convertUtil from '@utils/convert';
import formatUtil from '@utils/format';
import {Icon, Overlay} from 'react-native-elements';
import {COLORS} from '@src/styles';
import {withdrawSmartContract} from '@services/trading';
import {WithdrawSCHistory} from '@models/uniswapHistory';
import {ExHandler} from '@services/exception';
import TransferSuccessPopUp from '../TransferSuccessPopUp';
import {MESSAGES, MIN_INPUT} from '../../constants';
import { mainStyle, tokenStyle } from '../../style';

class WithdrawSmartContract extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sending: false,
      success: false,
    };
  }

  callWithdrawAPI = async () => {
    const {dexMainAccount, wallet, token, onAddHistory} = this.props;
    const {amount, sending} = this.state;

    if (sending) {
      return;
    }

    try {
      this.setState({ sending: true });
      const res = await accountService.withdrawSmartContract(wallet, dexMainAccount, token.address);
      const {signBytes, timestamp} = res;

      const id = await withdrawSmartContract({
        timestamp,
        icAddress: dexMainAccount.PaymentAddress,
        signBytes,
        sourceTokenAmount: convertUtil.toDecimals(amount, token),
        sourceTokenAddress: token.address,
        tokenId: token.id,
      });

      const history = new WithdrawSCHistory({
        id,
        token,
        value: amount,
      });

      history.status = 'pending';
      onAddHistory(history);

      this.setState({ success: true });
    } catch (error) {
      this.setState({ error: new ExHandler(error).getMessage() });
    } finally {
      this.setState({ sending: false });
    }
  };

  closePopUp = () => {
    const { onClosePopUp } = this.props;
    this.setState({
      amount: 0,
      sending: false,
      success: false,
    });

    onClosePopUp();
  };

  changeAmount = (text) => {
    let {amount} = this.state;
    const number = convertUtil.toNumber(text);
    let error;

    if (!_.isNaN(number)) {
      const {balance, token} = this.props;
      const originalAmount = convertUtil.toOriginalAmount(number, token.pDecimals, token.pDecimals !== 0);

      if (!Number.isInteger(originalAmount)) {
        amount = 0;
        error = MESSAGES.MUST_BE_INTEGER;
      } else if (originalAmount > balance) {
        amount = originalAmount;
        error = MESSAGES.BALANCE_INSUFFICIENT;
      } else if (originalAmount < MIN_INPUT) {
        error = `Please enter a number greater than or equal to ${formatUtil.amountFull(MIN_INPUT, token.pDecimals)}.`;
      } else {
        amount = originalAmount;
        error = null;
      }
    } else {
      error = 'Must be a number.';
    }

    this.setState({
      error,
      amount,
      chainError: null,
    });
  };

  renderAmountPopup() {
    const { sending } = this.state;
    const { token, balance, visible } = this.props;
    const {
      amount,
      success,
      chainError,
    } = this.state;
    let { error } = this.state;

    if (!error && amount > balance) {
      error = MESSAGES.BALANCE_INSUFFICIENT;
    }

    const isVisible = visible && !success;

    return (
      <Overlay
        isVisible={isVisible}
        overlayStyle={[mainStyle.modal]}
        onBackdropPress={Keyboard.dismiss}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <View>
              <View style={mainStyle.modalHeader}>
                <Text style={[mainStyle.modalHeaderText]}>
                  Withdraw to pDEX
                </Text>
                <TouchableOpacity onPress={this.closePopUp}>
                  <Icon name="close" color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <View style={[mainStyle.paddingTop, mainStyle.longContent]}>
                <View style={[mainStyle.twoColumns, mainStyle.center, tokenStyle.wrapper, mainStyle.padding]}>
                  <Text style={tokenStyle.name}>Balance:</Text>
                  <View style={[mainStyle.textRight, mainStyle.twoColumns]}>
                    { _.isNumber(balance) ?
                      (
                        <Text
                          style={[tokenStyle.symbol, mainStyle.longAccountName]}
                          numberOfLines={1}
                        >
                          {formatUtil.amountFull(balance, token?.pDecimals)}
                        </Text>
                      ) : <ActivityIndicator size="small" style={mainStyle.textRight} />
                    }
                    <Text>&nbsp;{token?.symbol}</Text>
                  </View>
                </View>
                <ReactInput
                  style={tokenStyle.input}
                  placeholder="0.0"
                  placeholderColor={COLORS.lightGrey1}
                  keyboardType="decimal-pad"
                  onChangeText={this.changeAmount}
                  editable={_.isNumber(balance)}
                />
                {!!error && <Text style={[mainStyle.fee, mainStyle.error, mainStyle.center, tokenStyle.error]}>{error}</Text>}
                {!!chainError && <Text style={[mainStyle.fee, mainStyle.error, mainStyle.center, tokenStyle.error]}>{chainError}</Text>}
                <Button
                  title="Withdraw"
                  disabled={
                    sending ||
                    error ||
                    !_.isNumber(amount) ||
                    !_.isNumber(balance)
                  }
                  style={tokenStyle.button}
                  onPress={this.callWithdrawAPI}
                  isAsync={sending}
                  isLoading={sending}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Overlay>
    );
  }

  render() {
    const {success, amount} = this.state;
    const {dexMainAccount, token} = this.props;
    return (
      <View>
        {this.renderAmountPopup()}
        <TransferSuccessPopUp
          account={dexMainAccount}
          action="Withdraw"
          token={token}
          amount={amount}
          success={success}
          closePopUp={this.closePopUp}
        />
      </View>
    );
  }
}

WithdrawSmartContract.defaultProps = {
  token: {},
  dexMainAccount: {},
};

WithdrawSmartContract.propTypes = {
  dexMainAccount: PropTypes.object,
  onAddHistory: PropTypes.func.isRequired,
  onClosePopUp: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  wallet: PropTypes.object.isRequired,
  token: PropTypes.object,
  balance: PropTypes.number.isRequired,
};

export default WithdrawSmartContract;
