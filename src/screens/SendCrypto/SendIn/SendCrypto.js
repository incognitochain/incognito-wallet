import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import {
  Field,
  formValueSelector,
  isValid,
  change,
  focus,
  reset,
} from 'redux-form';
import { connect } from 'react-redux';
import { Toast } from '@components/core';
import LoadingTx from '@components/LoadingTx';
import {
  createForm,
  InputQRField,
  InputField,
  InputMaxValueField,
  validator,
} from '@components/core/reduxForm';
import { ExHandler } from '@services/exception';
import { MESSAGES } from '@screens/Dex/constants';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import { generateTestId } from '@utils/misc';
import { SEND } from '@src/constants/elements';
import { ButtonBasic } from '@src/components/Button';
import EstimateFee, {
  formName as formEstimateFee,
} from '@components/EstimateFee/EstimateFee.input';
import {
  estimateFeeSelector,
  feeDataSelector,
} from '@src/components/EstimateFee/EstimateFee.selector';
import convert from '@src/utils/convert';
import debounce from 'lodash/debounce';
import floor from 'lodash/floor';
import { actionToggleModal } from '@src/components/Modal';
import Receipt from '@src/components/Receipt';
import { CONSTANT_KEYS } from '@src/constants';
import { actionFetchFeeByMax } from '@src/components/EstimateFee/EstimateFee.actions';
import format from '@src/utils/format';
import ROUTES_NAME from '@routers/routeNames';
import { homeStyle } from './style';

export const formName = 'sendCrypto';

const selector = formValueSelector(formName);

const initialFormValues = {
  amount: '',
  toAddress: '',
  message: '',
};

const Form = createForm(formName, {
  initialValues: initialFormValues,
  destroyOnUnmount: true,
  enableReinitialize: true,
});

const descriptionMaxBytes = validator.maxBytes(500, {
  message: 'The description is too long',
});

class SendCrypto extends React.Component {
  constructor() {
    super();
    this.state = {
      maxAmountValidator: undefined,
      minAmountValidator: undefined,
    };
  }

  componentDidMount() {
    this.setFormValidation();
  }

  componentDidUpdate(prevProps) {
    const {
      selectedPrivacy,
      feeData: { fee, feeUnitByTokenId, minAmount, maxAmount },
    } = this.props;
    const {
      selectedPrivacy: oldSelectedPrivacy,
      feeData: {
        fee: oldFee,
        feeUnitByTokenId: oldFeeUnitByTokenId,
        minAmount: oldMinAmount,
        maxAmount: oldMaxAmount,
      },
    } = prevProps;
    if (
      selectedPrivacy?.tokenId !== oldSelectedPrivacy?.tokenId ||
      fee !== oldFee ||
      feeUnitByTokenId !== oldFeeUnitByTokenId ||
      maxAmount !== oldMaxAmount ||
      minAmount !== oldMinAmount
    ) {
      // need to re-calc min amount if token decimals was changed
      this.setFormValidation();
    }
  }

  setFormValidation = debounce(() => {
    const { selectedPrivacy, feeData } = this.props;
    const { maxAmountText, minAmountText } = feeData;
    const _maxAmount = convert.toNumber(maxAmountText, true);
    const _minAmount = convert.toNumber(minAmountText, true);
    if (Number.isFinite(_maxAmount)) {
      this.setState({
        maxAmountValidator: validator.maxValue(_maxAmount, {
          message:
            _maxAmount > 0
              ? `Max amount you can send is ${maxAmountText} ${selectedPrivacy?.externalSymbol ||
                  selectedPrivacy?.symbol}`
              : 'Your balance is insufficient.',
        }),
      });
    }
    if (Number.isFinite(_minAmount)) {
      this.setState({
        minAmountValidator: validator.minValue(_minAmount, {
          message: `Amount must be larger than ${minAmountText} ${selectedPrivacy?.externalSymbol ||
            selectedPrivacy?.symbol}`,
        }),
      });
    }
  }, 200);

  handleSend = async (values) => {
    const {
      handleSend,
      feeData,
      selectedPrivacy,
      actionToggleModal,
      rfReset,
      navigation,
    } = this.props;
    const disabledForm = this.shouldDisabledSubmit();
    const { fee, feeUnit } = feeData;
    const { toAddress, amount } = values;
    if (disabledForm) {
      return;
    }
    try {
      const amountToNumber = convert.toNumber(amount, true);
      const originalAmount = convert.toOriginalAmount(
        amountToNumber,
        selectedPrivacy?.pDecimals,
        false,
      );
      const _originalAmount = floor(originalAmount);
      const originalFee = floor(fee);
      const _fee = format.amountFull(originalFee, feeData.feePDecimals);
      const res = await handleSend({
        ...feeData,
        ...values,
        originalFee,
        originalAmount: _originalAmount,
      });
      if (res) {
        await actionToggleModal({
          visible: true,
          data: (
            <Receipt
              {...{
                ...res,
                originalAmount,
                fee: _fee,
                feeUnit,
                title: 'Sent.',
                toAddress,
                pDecimals: selectedPrivacy?.pDecimals,
                tokenSymbol:
                  selectedPrivacy?.externalSymbol ||
                  selectedPrivacy?.symbol ||
                  res?.tokenSymbol,
                keySaveAddressBook:
                  CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK,
              }}
            />
          ),
          onBack: () => navigation.navigate(ROUTES_NAME.WalletDetail)
        });
        await rfReset(formName);
      }
    } catch (e) {
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

  shouldDisabledSubmit = () => {
    const { isFormValid, feeData, isFormEstimateFeeValid } = this.props;
    const { fee } = feeData;
    if (!isFormValid || !fee || !isFormEstimateFeeValid) {
      return true;
    }
    return false;
  };

  getAmountValidator = () => {
    const { selectedPrivacy } = this.props;
    const { maxAmountValidator, minAmountValidator } = this.state;
    const val = [];
    if (minAmountValidator) val.push(minAmountValidator);
    if (maxAmountValidator) val.push(maxAmountValidator);
    if (selectedPrivacy.isIncognitoToken) {
      val.push(...validator.combinedNanoAmount);
    }
    if (selectedPrivacy.isMainCrypto || selectedPrivacy.isPToken) {
      val.push(...validator.combinedAmount);
    }
    const values = Array.isArray(val) ? [...val] : [val];
    return values;
  };

  handleSelectToken = (tokenId) => {
    const { setSelectedPrivacy } = this.props;
    setSelectedPrivacy(tokenId);
  };
  // When click into Max button, auto set to max value with substract fee
  // It should be refactored into a utils, not prefer this here.
  reReduceMaxAmount = (amount) => {
    // Holding on next stage
    const { rfChange } = this.props;
    rfChange(formName, 'amount', `${amount}`);
  };

  onPressMax = async () => {
    const { actionFetchFeeByMax, rfChange, rfFocus } = this.props;
    const maxAmountText = await actionFetchFeeByMax();
    rfChange(formName, 'amount', maxAmountText);
    rfFocus(formName, 'amount');
  };

  render() {
    const {
      isSending,
      amount,
      toAddress,
      isFormValid,
      onShowFrequentReceivers,
      rfFocus,
      rfChange,
    } = this.props;
    return (
      <View style={homeStyle.container}>
        <Form>
          {({ handleSubmit }) => (
            <View>
              <Field
                onChange={(text) => {
                  rfChange(formName, 'amount', text);
                  rfFocus(formName, 'amount');
                }}
                component={InputMaxValueField}
                name="amount"
                placeholder="0.0"
                label="Amount"
                componentProps={{
                  keyboardType: 'decimal-pad',
                  onPressMax: this.onPressMax,
                }}
                validate={this.getAmountValidator()}
                {...generateTestId(SEND.AMtOUNT_INPUT)}
              />
              <Field
                onChange={(text) => {
                  rfChange(formName, 'toAddress', text);
                  rfFocus(formName, 'toAddress');
                }}
                component={InputQRField}
                name="toAddress"
                label="To"
                placeholder="Enter an Incognito address"
                validate={validator.combinedIncognitoAddress}
                showNavAddrBook
                onOpenAddressBook={onShowFrequentReceivers}
                {...generateTestId(SEND.ADDRESS_INPUT)}
              />
              <EstimateFee
                amount={isFormValid ? amount : null}
                address={isFormValid ? toAddress : null}
                isFormValid={isFormValid}
              />
              <Field
                component={InputField}
                name="message"
                placeholder="Add a note (optional)"
                label="Memo"
                maxLength={500}
                validate={descriptionMaxBytes}
                {...generateTestId(SEND.MEMO_INPUT)}
              />
              <ButtonBasic
                title="Send"
                btnStyle={homeStyle.submitBtn}
                disabled={this.shouldDisabledSubmit()}
                onPress={handleSubmit(this.handleSend)}
                {...generateTestId(SEND.SUBMIT_BUTTON)}
              />
            </View>
          )}
        </Form>
        {isSending && <LoadingTx />}
      </View>
    );
  }
}

SendCrypto.defaultProps = {
  isSending: false,
  isFormValid: false,
  amount: null,
  toAddress: null,
  selectable: true,
  reloading: false,
};

SendCrypto.propTypes = {
  selectedPrivacy: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  handleSend: PropTypes.func.isRequired,
  setSelectedPrivacy: PropTypes.func.isRequired,
  isSending: PropTypes.bool,
  isFormValid: PropTypes.bool,
  amount: PropTypes.string,
  toAddress: PropTypes.string,
  selectable: PropTypes.bool,
  onShowFrequentReceivers: PropTypes.func.isRequired,
  reloading: PropTypes.bool,
  Balance: PropTypes.func.isRequired,
  estimateFee: PropTypes.any.isRequired,
  feeData: PropTypes.any.isRequired,
  isFormEstimateFeeValid: PropTypes.bool.isRequired,
  rfChange: PropTypes.func.isRequired,
  rfFocus: PropTypes.func.isRequired,
  rfReset: PropTypes.func.isRequired,
  actionToggleModal: PropTypes.func.isRequired,
  actionFetchFeeByMax: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

const mapState = (state) => ({
  amount: selector(state, 'amount'),
  toAddress: selector(state, 'toAddress'),
  isFormValid: isValid(formName)(state),
  estimateFee: estimateFeeSelector(state),
  feeData: feeDataSelector(state),
  isFormEstimateFeeValid: isValid(formEstimateFee)(state),
});

const mapDispatch = {
  setSelectedPrivacy,
  rfChange: change,
  rfFocus: focus,
  rfReset: reset,
  actionToggleModal,
  actionFetchFeeByMax,
};

export default connect(
  mapState,
  mapDispatch,
)(SendCrypto);
