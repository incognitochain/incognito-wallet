import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { KeyboardAwareScrollView } from '@src/components/core';
import { Field } from 'redux-form';
import {
  createForm,
  InputQRField,
  InputField,
  InputMaxValueField,
  SelectOptionField,
} from '@components/core/reduxForm';
import { SEND } from '@src/constants/elements';
import { generateTestId } from '@src/utils/misc';
import EstimateFee from '@components/EstimateFee/EstimateFee.input';
import PropTypes from 'prop-types';
import { ButtonBasic } from '@src/components/Button';
import { useSelector } from 'react-redux';
import { feeDataSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { selectedPrivacySelector } from '@src/redux/selectors';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import LoadingTx from '@src/components/LoadingTx';
import format from '@src/utils/format';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import appConstant from '@src/constants/app';
import { CONSTANT_COMMONS } from '@src/constants';
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
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
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
    navigation,
    isPortalToken,
    isUnshieldPegPRV,
  } = props;
  const { titleBtnSubmit, isUnShield, editableInput } = useSelector(
    feeDataSelector,
  );
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const [onCentralizedPress, isCentralizedDisabled] = useFeatureConfig(
    appConstant.DISABLED.UNSHIELD_CENTRALIZED,
    handleSend,
  );
  const [onDecentralizedPress, isDecentralizedDisabled] = useFeatureConfig(
    appConstant.DISABLED.UNSHIELD_DECENTRALIZED,
    handleSend,
  );
  let placeholderAddress = selectedPrivacy?.isMainCrypto 
    ? 'Incognito or ETH/BSC address' 
    : `Incognito${
      selectedPrivacy?.isIncognitoToken
        ? ' '
        : ` or ${selectedPrivacy?.rootNetworkName} `
    }address`;

  const amountValidator = validateAmount;
  const isDisabled =
    isUnShield &&
    ((selectedPrivacy.isCentralized && isCentralizedDisabled) ||
      (selectedPrivacy.isDecentralized && isDecentralizedDisabled));
  const handlePressSend = isUnShield
    ? selectedPrivacy.isCentralized
      ? onCentralizedPress
      : onDecentralizedPress
    : handleSend;
  const submitHandler = handlePressSend;
  const [ childSelectedPrivacy, setChildSelectedPrivacy] = useState(null);
  const account = useSelector(defaultAccountSelector);

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
              componentProps={{
                editable: editableInput,
              }}
              autoFocus
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
        componentProps={{
          editable: editableInput,
        }}
        {...generateTestId(SEND.MEMO_INPUT)}
      />
    );
  };

  const renderNetworkType = () => {
    if (isUnshieldPegPRV) {
      const platforms = [
        {
          label: 'ETH',
          value: CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.ERC20
        },
        {
          label: 'BSC',
          value: CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BEP20
        },
      ];

      return (
        <Field
          onChange={(value) => {
            onChangeField(value, 'currencyType');
            const childToken = selectedPrivacy.listChildToken.find(item => item.currencyType === value);
            const childSelectedPrivacy = new SelectedPrivacy(
              account,
              null,
              childToken,
              selectedPrivacy.tokenId,
            );
            setChildSelectedPrivacy(childSelectedPrivacy);
          }}
          component={SelectOptionField}
          items={platforms}
          name="currencyType"
          label="Network type"
        />
      );
    }
    return null;
  };
  
  React.useEffect(() => {
    const { toAddress, amount } = navigation.state?.params || {};
    if (toAddress) {
      onChangeField(toAddress, 'toAddress');
    }
    if (amount) {
      onChangeField(amount, 'amount');
    }
  }, [navigation.state?.params]);

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
                  editable: editableInput,
                }}
                validate={amountValidator}
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
                componentProps={{
                  editable: editableInput,
                }}
                {...generateTestId(SEND.ADDRESS_INPUT)}
              />
              {renderNetworkType()}
              <EstimateFee
                {...{
                  amount,
                  address: toAddress,
                  isFormValid,
                  memo,
                  isIncognitoAddress,
                  isExternalAddress,
                  isPortalToken,
                  childSelectedPrivacy,
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
                onPress={handleSubmit(
                  submitHandler
                )}
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
  navigation: PropTypes.object.isRequired,
  isUnshieldPegPRV: PropTypes.bool.isRequired,
};

export default withSendForm(SendForm);
