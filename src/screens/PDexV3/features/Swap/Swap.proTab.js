import React from 'react';
import { Text } from '@src/components/core';
import isEmpty from 'lodash/isEmpty';
import { View, StyleSheet } from 'react-native';
import Extra, {
  Hook,
  styled as extraStyled,
} from '@screens/PDexV3/features/Extra';
import { useDispatch, useSelector } from 'react-redux';
import { change, Field } from 'redux-form';
import {
  RFBaseInput,
  RFSelectFeeInput,
  validator,
} from '@src/components/core/reduxForm';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { getPrivacyDataByTokenID } from '@src/redux/selectors/selectedPrivacy';
import { PRV } from '@src/constants/common';
import format from '@src/utils/format';
import convert from '@src/utils/convert';
import {
  feetokenDataSelector,
  feeTypesSelector,
  inputAmountSelector,
  slippagetoleranceSelector,
  swapInfoSelector,
} from './Swap.selector';
import { actionEstimateTrade, actionSetFeeToken } from './Swap.actions';
import { formConfigs } from './Swap.constant';
import {
  minFeeValidator,
  availablePayFeeByPRVValidator,
  maxAmountValidatorForSlippageTolerance,
  calMintAmountExpected,
} from './Swap.utils';
import { useTabFactories } from './Swap.simpleTab';

const styled = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
});

const TabPro = React.memo(() => {
  const swapInfo = useSelector(swapInfoSelector);
  const { maxGet } = swapInfo;
  const feeTypes = useSelector(feeTypesSelector);
  const slippagetolerance = useSelector(slippagetoleranceSelector);
  const feetokenData = useSelector(feetokenDataSelector);
  const inputAmount = useSelector(inputAmountSelector);
  const sellinputAmount = inputAmount(formConfigs.selltoken);
  const buyInputAmount = inputAmount(formConfigs.buytoken);
  const prv: SelectedPrivacy = useSelector(getPrivacyDataByTokenID)(PRV.id);
  const dispatch = useDispatch();
  const onChangeTypeFee = async (type) => {
    const { tokenId } = type;
    await dispatch(actionSetFeeToken(tokenId));
    dispatch(actionEstimateTrade());
  };
  const onEndEditing = () => {
    if (Number(slippagetolerance) > 100 || slippagetolerance < 0) {
      return;
    }
    const minAmount = calMintAmountExpected({ maxGet, slippagetolerance });
    const amount = format.toFixed(
      convert.toHumanAmount(minAmount, buyInputAmount.pDecimals),
      buyInputAmount.pDecimals,
    );
    dispatch(change(formConfigs.formName, formConfigs.buytoken, amount));
  };
  let _minFeeValidator = React.useCallback(
    () => minFeeValidator(feetokenData),
    [
      feetokenData?.origininalFeeAmount,
      feetokenData?.minFeeOriginal,
      feetokenData?.symbol,
      feetokenData?.minFeeAmountText,
    ],
  );
  let _availablePayFeeByPRVValidator = React.useCallback(
    () =>
      availablePayFeeByPRVValidator({
        prvBalance: prv?.amount || 0,
        usingFeeBySellToken: sellinputAmount?.usingFee,
        origininalFeeAmount: feetokenData?.origininalFeeAmount,
        networkfee: swapInfo?.networkfee,
      }),
    [
      sellinputAmount?.usingFee,
      prv?.amount,
      feetokenData?.origininalFeeAmount,
      swapInfo?.networkfee,
    ],
  );
  let _maxAmountValidatorForSlippageTolerance = React.useCallback(
    () => maxAmountValidatorForSlippageTolerance(slippagetolerance),
    [slippagetolerance],
  );
  let extraFactories = [
    {
      title: 'Slippage tolerance',
      hasQuestionIcon: true,
      onPressQuestionIcon: () => null,
      hooks: (
        <Field
          component={RFBaseInput}
          name={formConfigs.slippagetolerance}
          rightCustom={<Text style={extraStyled.value}>%</Text>}
          keyboardType="decimal-pad"
          placeholder="0"
          ellipsizeMode="tail"
          numberOfLines={1}
          onEndEditing={onEndEditing}
          validate={[
            ...validator.combinedNumber,
            _maxAmountValidatorForSlippageTolerance,
          ]}
          inputStyle={{
            flex: 1,
          }}
          editableInput={!!swapInfo?.editableInput}
        />
      ),
    },
    {
      title: 'Trading fee',
      hasQuestionIcon: true,
      onPressQuestionIcon: () => null,
      hooks: (
        <Field
          component={RFSelectFeeInput}
          types={feeTypes}
          onChangeTypeFee={onChangeTypeFee}
          name={formConfigs.feetoken}
          placeholder="0"
          validate={[
            ...(feetokenData.isIncognitoToken
              ? validator.combinedNanoAmount
              : validator.combinedAmount),
            _minFeeValidator,
            _availablePayFeeByPRVValidator,
          ]}
          editableInput={!!swapInfo?.editableInput}
        />
      ),
      containerStyle: { marginBottom: 0 },
    },
  ];
  return (
    <View style={styled.container}>
      {extraFactories.map((extra) => (
        <Extra {...extra} key={extra.label} />
      ))}
    </View>
  );
});

export default React.memo(TabPro);
