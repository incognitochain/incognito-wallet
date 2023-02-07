import React, { useState } from 'react';
import { View } from 'react-native';
import { KeyboardAwareScrollView, Modal, TextInput, Text, Button } from '@src/components/core';
import { Field } from 'redux-form';
import {
  createForm,
  InputQRField,
  InputMaxValueField,
  CheckboxField,
  InputField,
} from '@components/core/reduxForm';
import { SEND } from '@src/constants/elements';
import { generateTestId } from '@src/utils/misc';
import PropTypes from 'prop-types';
import { useSelector , useDispatch } from 'react-redux';
import { selectedPrivacySelector } from '@src/redux/selectors';
import LoadingTx from '@src/components/LoadingTx';
import format from '@src/utils/format';
import { CONSTANT_COMMONS } from '@src/constants';
import { colorsSelector } from '@src/theme/theme.selector';
// import {
//   validateTotalPRVBurningSelector,
// } from '@src/components/EstimateFee/EstimateFee.selector';
import FaucetPRVModal, { useFaucet } from '@src/components/Modal/features/FaucetPRVModal';
import { getPrivacyPRVInfo } from '@src/redux/selectors/selectedPrivacy';
import { actionFaucetPRV } from '@src/redux/actions/token';
import { styledForm as styled } from './Form.styled';
import withSendForm from './Form.enhance';
import { formName } from './Form.enhanceInit';
import { UnshieldPortalCondition } from '../UnshieldPortalCondition';
import ErrorMessageView from './Form.errorMessageView';

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
  const [isShowUnshieldPortalCondition, setShowUnshieldPortalCondition] = useState(false);
  const {
    onChangeField,
    onPressMax,
    onShowFrequentReceivers,
    disabledForm,
    validateAddress,
    isSending,
    warningAddress,
    textLoadingTx,
    handlePressUnshieldPortal,
    validatePortalAmount,
    validateUnshieldPortalCondition,
    portalData,
    validateBalancePRV,
  } = props;
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const dispatch = useDispatch();
  const [navigateFaucet] = useFaucet();
  // const { isEnoughtPRVNeededAfterBurn, isCurrentPRVBalanceExhausted } = useSelector(validateTotalPRVBurningSelector);
  const { isNeedFaucet } = useSelector(getPrivacyPRVInfo);
  
  const { externalSymbol, pDecimals, } = selectedPrivacy;

  const placeholderAddress = `Incognito${
    selectedPrivacy?.isMainCrypto || selectedPrivacy?.isIncognitoToken
      ? ' '
      : ` or ${selectedPrivacy?.rootNetworkName} `
  }address`;
  const btnTitle = isNeedFaucet ? 'Faucet' : 'Unshield my crypto';
  const { avgUnshieldFee, receivedAmount } = portalData;

  const amountValidator = validatePortalAmount;

  const showPopupFaucetPRV = async () => {
    await dispatch(actionFaucetPRV(<FaucetPRVModal />));
    return;
  };

  const navigateToFaucetWeb = async () => {
    navigateFaucet();
  };

  const submitHandler = isNeedFaucet ? navigateToFaucetWeb : handlePressUnshieldPortal;
  const colors = useSelector(colorsSelector);

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
                {...generateTestId(SEND.ADDRESS_INPUT)}
              />
              <Field
                component={InputField}
                name="incognitoNetworkFee"
                label="Incognito network"
                validate={validateBalancePRV}
                canEditable={false}
                prependView={(
                  <View style={[styled.spFeeItem]}>
                    <Text style={[styled.symbol]}>
                      {CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV}
                    </Text>
                  </View>
                )}
              />
              <ErrorMessageView />
              <TextInput
                label="Bitcoin network (est.)"
                canEditable={false}
                defaultValue={format.amountFull(avgUnshieldFee, pDecimals) || '0'}
                prependView={(
                  <View style={[styled.spFeeItem]}>
                    <Text style={[styled.symbol]}>
                      {externalSymbol}
                    </Text>
                  </View>
                )}
              />
              <TextInput
                label="Received (est.)"
                canEditable={false}
                defaultValue={format.amountFull(receivedAmount, pDecimals) || '0'}
                prependView={(
                  <View style={[styled.spFeeItem]}>
                    <Text style={[styled.symbol]}>
                      {externalSymbol}
                    </Text>
                  </View>
                )}
              />  
              <Field
                component={CheckboxField}
                name="unshieldCondition"
                title="I agree to the unshielding conditions."
                componentProps={{
                  containerStyle: {...styled.unshieldPortalCheckbox, color: colors.text1},
                  titleStyle: {...styled.unshieldPortalCheckboxText, color: colors.text4},
                }}
                validate={validateUnshieldPortalCondition}
                onPress={(currentStatus) => {
                  if (currentStatus === false) {
                    setShowUnshieldPortalCondition(true);
                  } else {
                    onChangeField(false, 'unshieldCondition');
                  }
                }}
              />
              <Modal visible={isShowUnshieldPortalCondition}>
                <UnshieldPortalCondition 
                  onConfirm={() => {
                    onChangeField(true, 'unshieldCondition');
                    setShowUnshieldPortalCondition(false);
                  }} 
                  onGoBack={() => {
                    setShowUnshieldPortalCondition(false);
                  }} 
                />
              </Modal>
              <Button
                title={btnTitle}
                buttonStyle={[
                  styled.submitBtn,
                ]}
                disabled={disabledForm}
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


SendForm.propTypes = {
  onChangeField: PropTypes.func.isRequired,
  onPressMax: PropTypes.func.isRequired,
  isFormValid: PropTypes.bool.isRequired,
  amount: PropTypes.string.isRequired,
  toAddress: PropTypes.string.isRequired,
  onShowFrequentReceivers: PropTypes.func.isRequired,
  disabledForm: PropTypes.bool.isRequired,
  validateAmount: PropTypes.any.isRequired,
  validateAddress: PropTypes.any.isRequired,
  isSending: PropTypes.bool.isRequired,
  warningAddress: PropTypes.string.isRequired,
  isIncognitoAddress: PropTypes.bool.isRequired,
  isExternalAddress: PropTypes.bool.isRequired,
  textLoadingTx: PropTypes.string.isRequired,
  validatePortalAmount: PropTypes.any.isRequired,
  validateUnshieldPortalCondition: PropTypes.any.isRequired,
  validateBalancePRV: PropTypes.any.isRequired,
  handlePressUnshieldPortal: PropTypes.func.isRequired,
  portalData: PropTypes.any.isRequired,
  navigation: PropTypes.object.isRequired,
};

export default withSendForm(SendForm);
