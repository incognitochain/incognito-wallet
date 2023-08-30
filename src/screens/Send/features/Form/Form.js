import {
  createForm,
  InputField,
  InputMaxValueField,
  InputQRField,
  SelectNetworkField,
} from '@components/core/reduxForm';
// eslint-disable-next-line import/no-cycle
import EstimateFee from '@components/EstimateFee/EstimateFee.input';
import {
  Button,
  KeyboardAwareScrollView,
  Text,
  View,
} from '@src/components/core';
// eslint-disable-next-line import/no-cycle
import {
  actionFetchVaultNetworks,
  actionResetFormSupportSendInChain
} from '@src/components/EstimateFee/EstimateFee.actions';
import {
  feeDataSelector,
  networksSelector,
  validateTotalPRVBurningSelector,
  vaultNetworksSelector,
} from '@src/components/EstimateFee/EstimateFee.selector';
import LoadingTx from '@src/components/LoadingTx';
import { CONSTANT_COMMONS } from '@src/constants';
import appConstant from '@src/constants/app';
import { SEND } from '@src/constants/elements';
import {
  clearChildSelectedPrivacy,
  setChildSelectedPrivacy,
} from '@src/redux/actions/childSelectedPrivacy';
import {
  childSelectedPrivacySelector,
  selectedPrivacySelector,
} from '@src/redux/selectors';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import { colorsSelector } from '@src/theme/theme.selector';
import format from '@src/utils/format';
import { generateTestId } from '@src/utils/misc';
import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, formValueSelector } from 'redux-form';
import { actionRefillPRVModalVisible } from '@src/screens/RefillPRV/RefillPRV.actions';
import debounce from 'lodash/debounce';
// eslint-disable-next-line import/no-cycle
import withSendForm, { formName } from './Form.enhance';
import { styledForm as styled } from './Form.styled';
import NetworkFeeView from './Form.networkFeeView';
import ErrorMessageView from './Form.errorMessageView';

const initialFormValues = {
  amount: '',
  toAddress: '',
  message: '',
};

const AMOUNT_KEY_BOARD_TYPE = 'decimal-pad';

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
    errorMessage
  } = props;
  const dispatch = useDispatch();

  const { titleBtnSubmit, isUnShield, editableInput } =
    useSelector(feeDataSelector);

  const { isFetchingVaultNetworks, vaultNetworks } = useSelector(vaultNetworksSelector);

  // const networkFeeValid = useSelector(validatePRVNetworkFee);
  const { isEnoughtPRVNeededAfterBurn } = useSelector(validateTotalPRVBurningSelector);
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const childSelectedPrivacy = useSelector(
    childSelectedPrivacySelector.childSelectedPrivacy,
  );
  const [onCentralizedPress, isCentralizedDisabled] = useFeatureConfig(
    appConstant.DISABLED.UNSHIELD_CENTRALIZED,
    handleSend,
  );
  const [onDecentralizedPress, isDecentralizedDisabled] = useFeatureConfig(
    appConstant.DISABLED.UNSHIELD_DECENTRALIZED,
    handleSend,
  );
  let placeholderAddress = 'Recipient address';

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

  const showRefillPRVAlert = () =>{
    dispatch(actionRefillPRVModalVisible(true));
  };

  const submitHandler = handlePressSend;

  const sendOnPress = (data) => {
    if (!isEnoughtPRVNeededAfterBurn && !selectedPrivacy.isMainCrypto)
    {
      showRefillPRVAlert();
      return;
    }
    if (
      disabledForm ||
      isDisabled ||
      !childSelectedPrivacy
    ) {
      return;
    }
    submitHandler(data);
};

  const getNetworks = () => {
    let networks = useSelector(networksSelector);
    let incognitoNetwork = [
      {
        network: 'Incognito',
        networkId: 'INCOGNITO',
        currencyType: CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.INCOGNITO,
      },
    ];

    if (selectedPrivacy.isPUnifiedToken) {
      if (isFetchingVaultNetworks || !vaultNetworks.length) {
        return [];
      } else {
        networks = networks.filter(
          (item) => vaultNetworks.some((tokenID) => tokenID === item.tokenId),
        );
      }
    }

    return [...incognitoNetwork, ...networks];
  };

  const networks = getNetworks();

  const selector = formValueSelector(formName);
  const currencyTypeName = useSelector((state) =>
    selector(state, 'currencyType'),
  );
  const amountValue = useSelector((state) =>
    selector(state, 'amount'),
  );

  React.useEffect(() => {
    dispatch(clearChildSelectedPrivacy());
  }, []);

  React.useEffect(() => {
    if (isIncognitoAddress && !currencyTypeName) {
      onChangeField(
        CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.INCOGNITO,
        'currencyType',
      );
      let childSelectedPrivacy = networks.find(
        (item) =>
          item.currencyType ===
          CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.INCOGNITO,
      );
      childSelectedPrivacy.amount = selectedPrivacy?.amount || 0;
      dispatch(setChildSelectedPrivacy(childSelectedPrivacy));
    }
  }, [isIncognitoAddress]);

  const colors = useSelector(colorsSelector);

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
                inputStyle: {
                  color: colors.text1,
                },
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
    if (childSelectedPrivacy?.networkId === 'INCOGNITO') {
      return (
        <Field
          component={InputField}
          name="message"
          placeholder="Add a note (optional)"
          label="Memo"
          maxLength={500}
          componentProps={{
            editable: editableInput,
            inputStyle: {
              color: colors.text1,
            },
          }}
          {...generateTestId(SEND.MEMO_INPUT)}
        />
      );
    }
    return null;
  };

  const renderNetworkType = () => {
    if (!networks || !networks.length) {
      return null;
    }
    return (
      <Field
        onChange={(value) => {
          onChangeField(value, 'currencyType');
          let childSelectedPrivacy = networks.find(
            (item) => item.currencyType === value,
          );
          childSelectedPrivacy.amount = selectedPrivacy?.amount || 0;
          if (childSelectedPrivacy?.networkId === 'INCOGNITO') {
            dispatch(actionResetFormSupportSendInChain());
          }
          dispatch(setChildSelectedPrivacy(childSelectedPrivacy));
        }}
        component={SelectNetworkField}
        networks={networks}
        selectedNetwork={childSelectedPrivacy}
        name="currencyType"
        style={styled.selectNetwork}
      />
    );
  };

  const fetchVaultNetworks = async (amount) => {
    try {
      await dispatch(actionFetchVaultNetworks(amount));
    } catch (error) {
      // new ExHandler(error).showErrorToast();
    }
  };

  const debounceFetchVaultNetworks = React.useCallback(debounce(fetchVaultNetworks, 300), []);

  React.useEffect(() => {
    const { toAddress, amount } = navigation.state?.params || {};
    if (toAddress) {
      onChangeField(toAddress, 'toAddress');
    }
    if (amount) {
      onChangeField(amount, 'amount');
    }
    // dispatch(change(formName, 'toAddress', 'zil142ynwum8egkt8snjhgjgmmf96l530vzam8r8a7'));
    // dispatch(change(formName, 'amount', '0.01'));
  }, [navigation.state?.params]);

  React.useEffect(() => {
    if (!selectedPrivacy.isPUnifiedToken) return;
    debounceFetchVaultNetworks(amount);
  }, [amount, selectedPrivacy.isPUnifiedToken]);

  return (
    <View style={styled.container} borderTop>
      <KeyboardAwareScrollView>
        <Form>
          {({ handleSubmit }) => (
            <>
              <Field
                onChange={(value) => {
                  onChangeField(value, 'amount');
                }}
                component={InputMaxValueField}
                name="amount"
                placeholder="0.0"
                label="Amount"
                rightLabel={<RightLabel />}
                componentProps={{
                  keyboardType: AMOUNT_KEY_BOARD_TYPE,
                  onPressMax,
                  style: {
                    marginTop: 22,
                  },
                  editable: editableInput,
                  inputStyle: {
                    color: colors.text1,
                  },
                }}
                validate={amountValidator}
                warning={
                  amountValidator &&
                  isUnShield &&
                  selectedPrivacy?.isPUnifiedToken &&
                  `The receiving amount will be at least ${amountValue} ${selectedPrivacy?.symbol}`
                }
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
                  inputStyle: {
                    color: colors.text1,
                  },
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
                  selectedPrivacy,
                  childSelectedPrivacy,
                }}
              />
              {renderMemo()}
              <NetworkFeeView onChangeField={onChangeField} />
              <ErrorMessageView errorMessage={errorMessage} />
              <Button
                title={titleBtnSubmit}
                btnStyle={[
                  styled.submitBtn,
                  isUnShield ? styled.submitBtnUnShield : null,
                ]}
                style={[{ marginTop: 24 }, styled.faucetStyle]}
                onPress={() => {
                  // if (isNeedFaucet) {
                  //   // showPopupFaucetPRV();
                  //   navigateToFaucetWeb();
                  //   return;
                  // }
                  handleSubmit(sendOnPress)();
                }}
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
  isUnshieldPUnifiedToken: PropTypes.bool.isRequired,
};

export default withSendForm(SendForm);
