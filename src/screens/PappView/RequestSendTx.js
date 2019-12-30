import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, Button, Container } from '@src/components/core';
import { accountSeleclor, tokenSeleclor, selectedPrivacySeleclor } from '@src/redux/selectors';
import formatUtil from '@src/utils/format';
import accountService from '@src/services/wallet/accountService';
import tokenService from '@src/services/wallet/tokenService';
import LoadingTx from '@src/components/LoadingTx';
import { CONSTANT_COMMONS } from '@src/constants';
import { ExHandler } from '@src/services/exception';
import { requestSendTxStyle } from './style';

const DEFAULT_FEE = 30; // in nano

class RequestSendTx extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSending: false
    };
  }

  _handleSendNativeToken = async ({ fee, info, receivers }) => {
    try {
      const { account, wallet } = this.props;
      fee = fee || DEFAULT_FEE;
      const originalFee = Number(fee);

      // payment info for PRV
      const paymentInfos = receivers.map(([paymentAddressStr, amount]) => ({ paymentAddressStr, amount }));

      
      this.setState({
        isSending: true
      });

      const res = await accountService.createAndSendNativeToken(paymentInfos, originalFee, true, account, wallet, info);
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
  }

  _handleSendToken = async ({ receivers, fee, info }) => {
    try {
      const { selectedPrivacy, account, wallet } = this.props;
      fee = fee || DEFAULT_FEE;

      const type = CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND;
      const originalFee = Number(fee);
      const isUseTokenFee = false; //feeUnit !== CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV;
      const tokenObject = {
        Privacy : true,
        TokenID: selectedPrivacy?.tokenId,
        TokenName: selectedPrivacy?.name,
        TokenSymbol: selectedPrivacy?.symbol,
        TokenTxType: type,
        TokenAmount: 0,
        TokenReceivers: receivers.map(([PaymentAddress, Amount]) => ({ PaymentAddress, Amount }))
      };
      
      this.setState({ isSending: true });
      const res = await tokenService.createSendPToken(
        tokenObject,
        isUseTokenFee ? 0 : originalFee,
        account,
        wallet,
        null,
        isUseTokenFee ? originalFee : 0,
        info
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
  }

  handleSendTx = async () => {
    try {
      const { selectedPrivacy, receivers, info, onSendSuccess } = this.props;
      let sendFn;
      if (selectedPrivacy?.isToken) sendFn = this._handleSendToken;
      if (selectedPrivacy?.isMainCrypto) sendFn = this._handleSendNativeToken;

      const res = await sendFn({ info, receivers });
      onSendSuccess(res);
    } catch (e) {
      const { onSendFailed } = this.props;
      onSendFailed(e);
      new ExHandler(e).showErrorToast(true);
    }
  }

  renderData = (label, value) => {
    return (
      <View style={requestSendTxStyle.infoContainer}>
        <Text style={requestSendTxStyle.infoLabel}>{label}</Text>
        {
          React.isValidElement(value)
            ? value
            : <Text style={requestSendTxStyle.infoValue}>{value}</Text>
        }
      </View>
    );
  }

  render() {
    const { isSending } = this.state;
    const { onCancel, selectedPrivacy, receivers, url } = this.props;
    const fee = DEFAULT_FEE; // default in PRV

    return (
      <Container style={requestSendTxStyle.container}>
        <Text style={requestSendTxStyle.title}> REQUEST SEND TX </Text>
        {this.renderData('PAPP URL', url)}
        {this.renderData('To address', (
          <View>
            { receivers?.map(([address, nanoAmount]) => (
              <View style={requestSendTxStyle.receiverContainer}>
                <Text numberOfLines={1} ellipsizeMode='middle' style={requestSendTxStyle.receiverAddress}>{address}</Text>
                <Text numberOfLines={1} ellipsizeMode='middle' style={requestSendTxStyle.receiverAmount}>{formatUtil.amount(nanoAmount, selectedPrivacy?.pDecimals)} {selectedPrivacy?.symbol}</Text>
              </View>
            ))}
          </View>
        ))}
        {this.renderData('Fee', `${formatUtil.amount(fee, CONSTANT_COMMONS.DECIMALS.MAIN_CRYPTO_CURRENCY)} ${CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV}`)}

        <View style={requestSendTxStyle.groupBtn}>
          <Button style={requestSendTxStyle.cancelBtn} title='Cancel' onPress={onCancel} />
          <Button style={requestSendTxStyle.submitBtn} title='Confirm Send' onPress={this.handleSendTx} />
        </View>
        { isSending && <LoadingTx /> }
      </Container>
    );
  }
}

const mapState = state => ({
  account: accountSeleclor.defaultAccount(state),
  wallet: state.wallet,
  tokens: tokenSeleclor.followed(state),
  selectPrivacyByTokenID: selectedPrivacySeleclor.getPrivacyDataByTokenID(state),
});

const mapDispatch = {
};

RequestSendTx.defaultProps = {
  info: null,
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
  receivers: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default connect(mapState, mapDispatch)(RequestSendTx);
