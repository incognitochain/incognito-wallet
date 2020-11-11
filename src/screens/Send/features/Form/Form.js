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
import LoadingTx from '@src/components/LoadingTx';
import format from '@src/utils/format';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import { styledForm as styled } from './Form.styled';
import withSendForm, { formName } from './Form.enhance';

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

const RightLabel = React.memo(() => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const amount = format.amount(
    selectedPrivacy?.amount,
    selectedPrivacy?.pDecimals,
    true,
  );
  return (
    <Text style={styled.amount} numberOfLines={1} ellipsizeMode="tail">
      {amount}
    </Text>
  );
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
    isSending,
    memo,
    warningAddress,
    isIncognitoAddress,
    isExternalAddress,
    textLoadingTx,
    validateMemo,
  } = props;
  const { titleBtnSubmit, isUnShield } = useSelector(feeDataSelector);
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const [onCentralizedPress, isCentralizedDisabled] = useFeatureConfig(
    'centralized',
    handleSend,
  );
  const [onDecentralizedPress, isDecentralizedDisabled] = useFeatureConfig(
    'decentralized',
    handleSend,
  );
  const placeholderAddress = `Incognito${
    selectedPrivacy?.isMainCrypto || selectedPrivacy?.isIncognitoToken
      ? ' '
      : ` or ${selectedPrivacy?.rootNetworkName} `
  }address`;

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
              validate={validateMemo}
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

  const isDisabled =
    isUnShield &&
    ((selectedPrivacy.isCentralized && isCentralizedDisabled) ||
      (selectedPrivacy.isDecentralized && isDecentralizedDisabled));
  const handlePressSend = isUnShield
    ? selectedPrivacy.isCentralized
      ? onCentralizedPress
      : onDecentralizedPress
    : handleSend;

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
                rightLabel={<RightLabel />}
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
                placeholder={placeholderAddress}
                validate={validateAddress}
                warning={warningAddress}
                showNavAddrBook
                onOpenAddressBook={onShowFrequentReceivers}
                shouldStandardized
                {...generateTestId(SEND.ADDRESS_INPUT)}
              />
              <EstimateFee
                {...{
                  amount,
                  address: toAddress,
                  isFormValid,
                  memo,
                  isIncognitoAddress,
                  isExternalAddress,
                }}
              />
              {renderMemo()}
              <ButtonBasic
                title={titleBtnSubmit}
                btnStyle={[
                  styled.submitBtn,
                  isUnShield ? styled.submitBtnUnShield : null,
                ]}
                disabled={disabledForm || isDisabled}
                onPress={handleSubmit(handlePressSend)}
                {...generateTestId(SEND.SUBMIT_BUTTON)}
              />
            </>
          )}
        </Form>
      </KeyboardAwareScrollView>
      {isSending && <LoadingTx text={textLoadingTx} />}
    </View>
  );
};

SendForm.defaultProps = {
  memo: '',
};

SendForm.propTypes = {
  onChangeField: PropTypes.func.isRequired,
  onPressMax: PropTypes.func.isRequired,
  isFormValid: PropTypes.bool.isRequired,
  amount: PropTypes.string.isRequired,
  toAddress: PropTypes.string.isRequired,
  onShowFrequentReceivers: PropTypes.func.isRequired,
  disabledForm: PropTypes.bool.isRequired,
  handleSend: PropTypes.func.isRequired,
  validateAmount: PropTypes.any.isRequired,
  validateAddress: PropTypes.any.isRequired,
  isERC20: PropTypes.bool.isRequired,
  isSending: PropTypes.bool.isRequired,
  memo: PropTypes.string,
  warningAddress: PropTypes.string.isRequired,
  isIncognitoAddress: PropTypes.bool.isRequired,
  isExternalAddress: PropTypes.bool.isRequired,
  textLoadingTx: PropTypes.string.isRequired,
  validateMemo: PropTypes.any.isRequired,
};

export default withSendForm(SendForm);
