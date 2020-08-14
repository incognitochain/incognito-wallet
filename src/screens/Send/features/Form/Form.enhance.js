/* eslint-disable import/no-cycle */
import React from 'react';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { formName as formEstimateFee } from '@components/EstimateFee/EstimateFee.input';
import { feeDataSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { compose } from 'recompose';
import { useDispatch, useSelector } from 'react-redux';
import { isValid, formValueSelector, change, focus } from 'redux-form';
import { actionFetchFeeByMax } from '@src/components/EstimateFee/EstimateFee.actions';
import { useKeyboard } from '@src/components/UseEffect/useKeyboard';
import { enhanceAddressValidation } from './Form.enhanceAddressValidator';
import { enhanceAmountValidation } from './Form.enhanceAmountValidator';
import { enhanceInit } from './Form.enhanceInit';
import { enhanceSend } from './Form.enhanceSend';
import { enhanceUnshield } from './Form.enhanceUnShield';

export const formName = 'formSend';

export const enhance = (WrappedComp) => (props) => {
  const [state, setState] = React.useState({ isSending: false });
  const { isSending } = state;
  const { handleSendAnonymously, handleUnShieldCrypto } = props;
  const isFormEstimateFeeValid = useSelector((state) =>
    isValid(formEstimateFee)(state),
  );
  const navigation = useNavigation();
  const { fee, isFetching: estimatingFee, isSend, isUnShield } = useSelector(
    feeDataSelector,
  );
  const dispatch = useDispatch();
  const selector = formValueSelector(formName);
  const isFormValid = useSelector((state) => isValid(formName)(state));
  const amount = useSelector((state) => selector(state, 'amount'));
  const toAddress = useSelector((state) => selector(state, 'toAddress'));
  const [isKeyboardVisible] = useKeyboard();
  const { shouldBlockETHWrongAddress } = props;
  const onChangeField = (value, field) => {
    dispatch(change(formName, field, String(value)));
    dispatch(focus(formName, field));
  };

  const onPressMax = async () => {
    try {
      const maxAmountText = await dispatch(actionFetchFeeByMax());
      onChangeField(maxAmountText, 'amount');
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
      !!shouldBlockETHWrongAddress
    ) {
      return true;
    }
    return false;
  };

  const onShowFrequentReceivers = async () => {
    try {
      navigation.navigate(routeNames.FrequentReceiversAll, {
        onSelectedItem,
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
      await setState({ ...state, isSending: true });
      if (isSend) {
        await handleSendAnonymously(payload);
      }
      if (isUnShield) {
        await handleUnShieldCrypto(payload);
      }
    } catch (error) {
      console.debug(error);
    } finally {
      await setState({ ...state, isSending: false });
    }
  };

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
      }}
    />
  );
};

export default compose(
  enhanceInit,
  enhanceAmountValidation,
  enhanceAddressValidation,
  enhanceSend,
  enhanceUnshield,
  enhance,
);
