import React from 'react';
import PropTypes from 'prop-types';
import {Field, formValueSelector, isValid} from 'redux-form';
import {connect} from 'react-redux';
import convertUtil from '@utils/convert';
import formatUtil from '@utils/format';
import {Container, ScrollView, View, Button, Toast} from '@components/core';
import ReceiptModal, {openReceipt} from '@components/Receipt';
import LoadingTx from '@components/LoadingTx';
import EstimateFee from '@components/EstimateFee';
import {isExchangeRatePToken} from '@services/wallet/RpcClientService';
import {
  createForm,
  InputQRField,
  InputField,
  InputMaxValueField,
  validator,
} from '@components/core/reduxForm';
import {ExHandler} from '@services/exception';
import {CONSTANT_COMMONS, CONSTANT_EVENTS} from '@src/constants';
import {logEvent} from '@services/firebase';
import {MESSAGES} from '@screens/Dex/constants';
import TokenSelect from '@components/TokenSelect';
import CurrentBalance from '@components/CurrentBalance';
import {setSelectedPrivacy} from '@src/redux/actions/selectedPrivacy';
import {homeStyle} from './style';

export const formName = 'sendCrypto';
const selector = formValueSelector(formName);
const initialFormValues = {
  amount: '',
  toAddress: '',
};
const Form = createForm(formName, {
  initialValues: initialFormValues,
});

const descriptionMaxBytes = validator.maxBytes(500, {
  message: 'The description is too long',
});

class SendCrypto extends React.Component {
  constructor() {
    super();
    this.state = {
      supportedFeeTypes: [],
      maxAmountValidator: undefined,
      minAmountValidator: undefined,
      estimateFeeData: {},
    };
  }

  componentDidMount() {
    this.setFormValidation({
      maxAmount: this.getMaxAmount(),
      minAmount: this.getMinAmount(),
    });
    this.getSupportedFeeTypes();
  }

  componentDidUpdate(prevProps, prevState) {
    const {selectedPrivacy} = this.props;
    const {selectedPrivacy: oldSelectedPrivacy} = prevProps;
    const {
      estimateFeeData: {fee, feeUnitByTokenId},
    } = this.state;
    const {
      estimateFeeData: {fee: oldFee, feeUnitByTokenId: oldFeeUnitByTokenId},
    } = prevState;
    const {receiptData} = this.props;

    if (selectedPrivacy?.pDecimals !== oldSelectedPrivacy?.pDecimals) {
      // need to re-calc min amount if token decimals was changed
      this.setFormValidation({minAmount: this.getMinAmount()});
    }

    if (fee !== oldFee || feeUnitByTokenId !== oldFeeUnitByTokenId) {
      // need to re-calc max amount can be send if fee was changed
      this.setFormValidation({maxAmount: this.getMaxAmount()});
    }

    if (receiptData?.txId !== prevProps.receiptData?.txId) {
      openReceipt(receiptData);
    }

    if (oldSelectedPrivacy !== selectedPrivacy && selectedPrivacy) {
      this.setFormValidation({
        maxAmount: this.getMaxAmount(),
        minAmount: this.getMinAmount(),
      });
      this.getSupportedFeeTypes();
    }
  }

  getMinAmount = () => {
    // MIN = 1 nano
    const {selectedPrivacy} = this.props;
    if (selectedPrivacy?.pDecimals) {
      return 1 / 10 ** selectedPrivacy.pDecimals;
    }

    return 0;
  };

  getMaxAmount = () => {
    const {selectedPrivacy} = this.props;
    const {
      estimateFeeData: {fee = 0, feeUnitByTokenId},
    } = this.state;
    let amount = selectedPrivacy?.amount;

    if (feeUnitByTokenId === selectedPrivacy?.tokenId) {
      const newAmount = (Number(amount) || 0) - (Number(fee) || 0);
      amount = newAmount > 0 ? newAmount : 0;
    }

    const maxAmount = convertUtil.toHumanAmount(
      amount,
      selectedPrivacy?.pDecimals,
    );

    return Math.max(maxAmount, 0);
  };

  setFormValidation = ({maxAmount, minAmount}) => {
    const {selectedPrivacy} = this.props;

    if (Number.isFinite(maxAmount)) {
      this.setState({
        maxAmountValidator: validator.maxValue(maxAmount, {
          message:
            maxAmount > 0
              ? `Max amount you can send is ${formatUtil.number(maxAmount)} ${
                  selectedPrivacy?.symbol
              }`
              : 'Your balance is not enough to send',
        }),
      });
    }

    if (Number.isFinite(minAmount)) {
      this.setState({
        minAmountValidator: validator.minValue(minAmount, {
          message: `Amount must be larger than ${formatUtil.number(
            minAmount,
          )} ${selectedPrivacy?.symbol}`,
        }),
      });
    }
  };

  handleSend = async values => {
    const {selectedPrivacy} = this.props;
    try {
      const {handleSend} = this.props;
      const {
        estimateFeeData: {fee, feeUnit, isUseTokenFee},
      } = this.state;

      if (typeof handleSend === 'function') {
        await logEvent(CONSTANT_EVENTS.SEND, {
          tokenId: selectedPrivacy.tokenId,
          tokenSymbol: selectedPrivacy.symbol,
        });
        await handleSend({...values, fee, feeUnit, isUseTokenFee});
        await logEvent(CONSTANT_EVENTS.SEND_SUCCESS, {
          tokenId: selectedPrivacy.tokenId,
          tokenSymbol: selectedPrivacy.symbol,
        });
      }
    } catch (e) {
      await logEvent(CONSTANT_EVENTS.SEND_FAILED, {
        tokenId: selectedPrivacy.tokenId,
        tokenSymbol: selectedPrivacy.symbol,
      });

      if (e.message === MESSAGES.NOT_ENOUGH_NETWORK_FEE) {
        Toast.showError(e.message);
      } else {
        new ExHandler(
          e,
          'Something went wrong. Just tap the Send button again.',
        ).showErrorToast(true);
      }
    }
  };

  handleSelectFee = estimateFeeData => {
    this.setState({estimateFeeData});
  };

  shouldDisabledSubmit = () => {
    const {
      estimateFeeData: {fee},
    } = this.state;

    return fee !== 0 && !fee;
  };

  getSupportedFeeTypes = async () => {
    const supportedFeeTypes = [
      {
        tokenId: CONSTANT_COMMONS.PRV_TOKEN_ID,
        symbol: CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV,
      },
    ];

    try {
      const {selectedPrivacy} = this.props;
      const isUsed = await isExchangeRatePToken(selectedPrivacy.tokenId);

      if (isUsed) {
        supportedFeeTypes.push({
          tokenId: selectedPrivacy.tokenId,
          symbol: selectedPrivacy.symbol,
        });
      }
    } catch (e) {
      new ExHandler(e);
    } finally {
      this.setState({supportedFeeTypes});
    }
  };

  getAmountValidator = () => {
    const {selectedPrivacy} = this.props;
    const {maxAmountValidator, minAmountValidator} = this.state;

    const val = [];

    if (minAmountValidator) val.push(minAmountValidator);

    if (maxAmountValidator) val.push(maxAmountValidator);

    if (selectedPrivacy.isIncognitoToken) {
      val.push(...validator.combinedNanoAmount);
    }

    if (selectedPrivacy.isMainCrypto || selectedPrivacy.isPToken) {
      val.push(...validator.combinedAmount);
    }

    return val;
  };

  handleSelectToken = tokenId => {
    const {setSelectedPrivacy} = this.props;
    setSelectedPrivacy(tokenId);
  };

  render() {
    const {supportedFeeTypes, estimateFeeData} = this.state;
    const {
      isSending,
      amount,
      toAddress,
      isFormValid,
      account,
      selectable,
      onShowFrequentReceivers,
    } = this.props;
    const maxAmount = this.getMaxAmount();

    return (
      <ScrollView style={homeStyle.container}>
        <Container style={homeStyle.mainContainer}>
          <CurrentBalance
            select={
              selectable ? (
                <TokenSelect onSelect={this.handleSelectToken} />
              ) : null
            }
          />
          <Form>
            {({handleSubmit}) => (
              <View style={homeStyle.form}>
                <Field
                  component={InputQRField}
                  name="toAddress"
                  label="To"
                  placeholder="Enter wallet address"
                  style={homeStyle.input}
                  validate={validator.combinedIncognitoAddress}
                  onFocus={onShowFrequentReceivers}
                />
                <Field
                  component={InputMaxValueField}
                  name="amount"
                  placeholder="0.0"
                  label="Amount"
                  style={homeStyle.input}
                  maxValue={maxAmount}
                  componentProps={{
                    keyboardType: 'decimal-pad',
                  }}
                  validate={this.getAmountValidator()}
                />
                <Field
                  component={InputField}
                  inputStyle={homeStyle.descriptionInput}
                  containerStyle={homeStyle.descriptionInput}
                  componentProps={{multiline: true, numberOfLines: 10}}
                  name="message"
                  placeholder="Message"
                  label="Memo (optional)"
                  style={[
                    homeStyle.input,
                    homeStyle.descriptionInput,
                    {marginBottom: 25},
                  ]}
                  validate={descriptionMaxBytes}
                />
                <EstimateFee
                  accountName={account?.name}
                  estimateFeeData={estimateFeeData}
                  onNewFeeData={this.handleSelectFee}
                  types={supportedFeeTypes}
                  amount={isFormValid ? amount : null}
                  toAddress={isFormValid ? toAddress : null}
                />
                <Button
                  title="Send"
                  style={homeStyle.submitBtn}
                  disabled={this.shouldDisabledSubmit()}
                  onPress={handleSubmit(this.handleSend)}
                />
              </View>
            )}
          </Form>
          <ReceiptModal />
        </Container>
        {isSending && <LoadingTx />}
      </ScrollView>
    );
  }
}

SendCrypto.defaultProps = {
  receiptData: null,
  isSending: false,
  isFormValid: false,
  amount: null,
  toAddress: null,
  selectable: true,
};

SendCrypto.propTypes = {
  selectedPrivacy: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  receiptData: PropTypes.object,
  handleSend: PropTypes.func.isRequired,
  setSelectedPrivacy: PropTypes.func.isRequired,
  isSending: PropTypes.bool,
  isFormValid: PropTypes.bool,
  amount: PropTypes.string,
  toAddress: PropTypes.string,
  selectable: PropTypes.bool,
  onShowFrequentReceivers: PropTypes.func.isRequired,
};

const mapState = state => ({
  amount: selector(state, 'amount'),
  toAddress: selector(state, 'toAddress'),
  isFormValid: isValid(formName)(state),
});

const mapDispatch = {
  setSelectedPrivacy,
};

export default connect(mapState, mapDispatch)(SendCrypto);
