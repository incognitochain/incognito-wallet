/* eslint-disable import/no-cycle */
import React from 'react';
import { Clipboard } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { formName as formEstimateFee } from '@components/EstimateFee/EstimateFee.input';
import { feeDataSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { compose } from 'recompose';
import { useDispatch, useSelector } from 'react-redux';
import { isValid, formValueSelector, change, focus } from 'redux-form';
import { actionFetchFeeByMax } from '@src/components/EstimateFee/EstimateFee.actions';
import { useKeyboard } from '@src/components/UseEffect/useKeyboard';
import { ANALYTICS } from '@src/constants';
import { requestUpdateMetrics } from '@src/redux/actions/app';
import { enhanceAddressValidation } from './Form.enhanceAddressValidator';
import { enhanceAmountValidation } from './Form.enhanceAmountValidator';
import { enhanceInit } from './Form.enhanceInit';
import { enhanceSend } from './Form.enhanceSend';
import { enhanceUnshield } from './Form.enhanceUnShield';
import { enhanceMemoValidation } from './Form.enhanceMemoValidator';
import { enhanceSwitchPortal } from './Form.enhanceSwitchPortal';
import { removeAllSpace } from './Form.utils';

export const formName = 'formSend';

export const enhance = (WrappedComp) => (props) => {
  const [isSending, setIsSending] = React.useState(false);
  const isFormEstimateFeeValid = useSelector((state) =>
    isValid(formEstimateFee)(state),
  );
  const { handleSendAnonymously, handleUnShieldCrypto } = props;
  const navigation = useNavigation();
  const {
    fee,
    isFetching: estimatingFee,
    isSend,
    isUnShield,
    isAddressValidated,
    isValidETHAddress,
    userFees,
  } = useSelector(feeDataSelector);
  const dispatch = useDispatch();
  const selector = formValueSelector(formName);
  const isFormValid = useSelector((state) => isValid(formName)(state));
  const amount = useSelector((state) => selector(state, 'amount'));
  const toAddress = useSelector((state) => selector(state, 'toAddress'));
  const memo = useSelector((state) => selector(state, 'memo'));
  const currencyType = useSelector((state) => selector(state, 'currencyType'));
  const [isKeyboardVisible] = useKeyboard();
  const handleStandardizedAddress = async (value) => {
    let _value = value;
    try {
      const copiedValue = await Clipboard.getString();
      if (copiedValue !== '') {
        const isPasted = value.includes(copiedValue);
        if (isPasted) {
          _value = standardizedAddress(value);
        }
      }
    } catch (e) {
      console.debug('error', e);
    }
    return removeAllSpace(_value);
  };
  const onChangeField = async (value, field) => {
    let _value = value;
    if (field === 'toAddress') {
      _value = await handleStandardizedAddress(value);
    }

    dispatch(change(formName, field, String(_value)));
    dispatch(focus(formName, field));
  };

  const onPressMax = async () => {
    try {
      const maxAmountText = await dispatch(actionFetchFeeByMax());
      if (maxAmountText) {
        onChangeField(maxAmountText, 'amount');
      }
    } catch (error) {
      console.debug(error);
    }
  };

  const shouldDisabledSubmit = () => {
    if (
      !isFormValid ||
      !fee ||
      !isFormEstimateFeeValid ||
      estimatingFee ||
      !!isKeyboardVisible ||
      !isAddressValidated ||
      !isValidETHAddress
    ) {
      return true;
    }
    if (isUnShield) {
      if (!userFees?.isFetched) {
        return true;
      }
    }
    return false;
  };

  const onShowFrequentReceivers = async () => {
    try {
      navigation.navigate(routeNames.FrequentReceivers, {
        onSelectedItem,
        filterBySelectedPrivacy: true,
      });
    } catch (error) {
      console.debug(error);
    }
  };

  const onSelectedItem = (info) => {
    onChangeField(info?.address, 'toAddress');
    navigation.pop();
  };

  const disabledForm = shouldDisabledSubmit();

  const handleSend = async (payload) => {
    try {
      if (disabledForm) {
        return;
      }
      await setIsSending(true);
      if (isSend) {
        dispatch(requestUpdateMetrics(ANALYTICS.ANALYTIC_DATA_TYPE.SEND));
        await handleSendAnonymously(payload);
      }
      if (isUnShield) {
        dispatch(requestUpdateMetrics(ANALYTICS.ANALYTIC_DATA_TYPE.UNSHIELD));
        await handleUnShieldCrypto(payload);
      }
    } catch (error) {
      console.debug(error);
    }
    await setIsSending(false);
  };

  React.useEffect(() => {
    return () => {
      setIsSending(false);
    };
  }, []);

  return (
    <WrappedComp
      {...{
        ...props,
        onChangeField,
        onPressMax,
        isFormValid,
        amount,
        toAddress,
        onShowFrequentReceivers,
        disabledForm,
        handleSend,
        isSending,
        memo,
        currencyType,
      }}
    />
  );
};

export default compose(
  enhanceInit,
  enhanceAmountValidation,
  enhanceAddressValidation,
  enhanceMemoValidation,
  enhanceSend,
  enhanceUnshield,
  enhance,
  enhanceSwitchPortal,
);
