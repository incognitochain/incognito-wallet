import React from 'react';
import { View, Text } from 'react-native';
import { KeyboardAwareScrollView } from '@src/components/core';
import { Field } from 'redux-form';
import {
  createForm,
  InputQRField,
  InputField,
  InputMaxValueField,
} from '@components/core/reduxForm';
import { SEND } from '@src/constants/elements';
import { generateTestId } from '@src/utils/misc';
import EstimateFee from '@components/EstimateFee/EstimateFee.input';
import PropTypes from 'prop-types';
import { ButtonBasic } from '@src/components/Button';
import { useSelector } from 'react-redux';
import { feeDataSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { COLORS } from '@src/styles';
import LoadingTx from '@src/components/LoadingTx';
import withSendForm, { formName } from './Form.enhance';
import { styledForm as styled } from './Form.styled';

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

const SendForm = (props) => {
  const {
    onChangeField,
    onPressMax,
    isFormValid,
    amount,
    toAddress,
    onShowFrequentReceivers,
    disabledForm,
    handleSend,
    validateAmount,
    validateAddress,
    isERC20,
    shouldBlockETHWrongAddress,
    isSending,
  } = props;
  const { titleBtnSubmit, screen, isUnShield } = useSelector(feeDataSelector);
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const renderMemo = () => {
    if (isUnShield) {
      if (selectedPrivacy?.isBep2Token || selectedPrivacy?.currencyType === 4) {
        return (
          <>
            <Field
              component={InputQRField}
              name="memo"
              label="Memo"
              placeholder="Add a note (optional)"
              maxLength={125}
            />
            <Text style={styled.warningText}>
              For withdrawals to wallets on exchanges (e.g. Binance, etc.),
              enter your memo to avoid loss of funds.
            </Text>
          </>
        );
      }
      return null;
    }
    return (
      <Field
        component={InputField}
        name="message"
        placeholder="Add a note (optional)"
        label="Memo"
        maxLength={500}
        {...generateTestId(SEND.MEMO_INPUT)}
      />
    );
  };
  return (
    <View style={styled.container}>
      <KeyboardAwareScrollView>
        <Form>
          {({ handleSubmit }) => (
            <>
              <Field
                onChange={(value) => onChangeField(value, 'amount')}
                component={InputMaxValueField}
                name="amount"
                placeholder="0.0"
                label="Amount"
                componentProps={{
                  keyboardType: 'decimal-pad',
                  onPressMax,
                  style: {
                    marginTop: 22,
                  },
                }}
                validate={validateAmount}
                {...generateTestId(SEND.AMOUNT_INPUT)}
              />
              <Field
                onChange={(value) => onChangeField(value, 'toAddress')}
                component={InputQRField}
                name="toAddress"
                label="To"
                placeholder={`Enter ${selectedPrivacy?.externalSymbol ||
                  selectedPrivacy?.symbol} address`}
                validate={validateAddress}
                showNavAddrBook
                onOpenAddressBook={onShowFrequentReceivers}
                {...generateTestId(SEND.ADDRESS_INPUT)}
              />
              {isERC20 && screen === 'UnShield' && (
                <Text
                  style={[
                    styled.warningText,
                    shouldBlockETHWrongAddress ? { color: COLORS.red } : null,
                  ]}
                >
                  Please withdraw to a wallet address, not a smart contract
                  address.
                </Text>
              )}
              <EstimateFee
                amount={amount}
                address={toAddress}
                isFormValid={isFormValid}
              />
              {renderMemo()}

              <ButtonBasic
                title={titleBtnSubmit}
                btnStyle={[
                  styled.submitBtn,
                  isUnShield ? styled.submitBtnUnShield : null,
                ]}
                disabled={disabledForm}
                onPress={handleSubmit(handleSend)}
                {...generateTestId(SEND.SUBMIT_BUTTON)}
              />
            </>
          )}
        </Form>
      </KeyboardAwareScrollView>
      {isSending && <LoadingTx />}
    </View>
  );
};

SendForm.propTypes = {
  onChangeField: PropTypes.func.isRequired,
  onPressMax: PropTypes.func.isRequired,
  isFormValid: PropTypes.bool.isRequired,
  amount: PropTypes.number.isRequired,
  toAddress: PropTypes.string.isRequired,
  onShowFrequentReceivers: PropTypes.func.isRequired,
  disabledForm: PropTypes.bool.isRequired,
  handleSend: PropTypes.func.isRequired,
  validateAmount: PropTypes.any.isRequired,
  validateAddress: PropTypes.any.isRequired,
  getValidateAddress: PropTypes.func.isRequired,
  isERC20: PropTypes.bool.isRequired,
  shouldBlockETHWrongAddress: PropTypes.bool.isRequired,
  isSending: PropTypes.bool.isRequired,
};

export default withSendForm(SendForm);
