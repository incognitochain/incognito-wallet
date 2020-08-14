/* eslint-disable import/no-cycle */
import React from 'react';
import { View, TouchableWithoutFeedback, Text } from 'react-native';
import { Field, change, focus } from 'redux-form';
import { InputField, createForm, validator } from '@components/core/reduxForm';
import { GENERAL } from '@src/constants/elements';
import { generateTestId } from '@src/utils/misc';
import { useSelector, useDispatch } from 'react-redux';
import convert from '@src/utils/convert';
import { styled } from './EstimateFee.styled';
import withEstimateFee from './EstimateFee.enhance';
import { estimateFeeSelector, feeDataSelector } from './EstimateFee.selector';
import { actionChangeFeeType, actionChangeFee } from './EstimateFee.actions';

const feeValidator = [
  validator.required(),
  validator.number(),
  validator.largerThan(0),
];

export const formName = 'formEstimateFee';

const Form = createForm(formName, {
  destroyOnUnmount: true,
  enableReinitialize: true,
  initialValues: {
    fee: '',
  },
});

const EstimateFeeInput = (props) => {
  const { types, isFetching, isFetched } = useSelector(estimateFeeSelector);
  const {
    fee,
    feeUnit,
    minFee,
    maxFee,
    isUseTokenFee,
    feePrvText,
    feePTokenText,
    feePDecimals,
  } = useSelector(feeDataSelector);
  const [state, setState] = React.useState({
    minFeeValidator: null,
    maxFeeValidator: null,
  });
  const dispatch = useDispatch();
  const { minFeeValidator, maxFeeValidator } = state;
  const onChangeFee = async (value) => {
    try {
      dispatch(change(formName, 'fee', value));
      dispatch(
        actionChangeFee({
          value,
          isUseTokenFee,
          feePDecimals,
        }),
      );
    } catch (error) {
      throw error;
    }
  };
  React.useEffect(() => {
    if (fee && isFetched) {
      let maxFeeValidator;
      let minFeeValidator;
      const _maxFee = convert.toNumber(maxFee, true);
      const _fee = convert.toNumber(fee, true);
      const _minFee = convert.toNumber(minFee, true);
      try {
        maxFeeValidator = validator.maxValue(_maxFee, {
          message:
            _maxFee > _fee
              ? `Must be less than ${maxFee} ${feeUnit}`
              : 'Your balance is insufficient.',
        });
        minFeeValidator = validator.minValue(_minFee, {
          message: `Must be at least ${minFee} ${feeUnit}`,
        });
      } catch (error) {
        console.log(error);
      } finally {
        setState({ ...state, minFeeValidator, maxFeeValidator });
      }
    }
  }, [fee, feePTokenText, feePrvText]);
  return (
    <Form>
      {({ handleSubmit }) => (
        <Field
          onChange={onChangeFee}
          component={InputField}
          prependView={<SupportFees types={types} />}
          placeholder="0"
          name="fee"
          validate={[
            ...feeValidator,
            ...(minFeeValidator ? [minFeeValidator] : []),
            ...(maxFeeValidator ? [maxFeeValidator] : []),
          ]}
          componentProps={{
            keyboardType: 'decimal-pad',
            editable: isFetched,
          }}
          label="Fee"
          {...props}
        />
      )}
    </Form>
  );
};

EstimateFeeInput.propTypes = {};

const SupportFeeItem = (props) => {
  const {
    tokenId = null,
    symbol = null,
    isActived = false,
    types = false,
    tail = false,
    ...rest
  } = props;
  if (!tokenId) {
    return;
  }
  return (
    <TouchableWithoutFeedback
      {...generateTestId(GENERAL.SELECTED_NETWORK_FEE_UNIT)}
      {...rest}
    >
      <View style={[styled.spFeeItem, tail ? styled.tail : null]}>
        <Text style={[styled.symbol, isActived ? styled.isActived : null]}>
          {symbol}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const SupportFees = () => {
  const { types, actived, isFetched, feePrvText, feePTokenText } = useSelector(
    estimateFeeSelector,
  );
  const { isUseTokenFee } = useSelector(feeDataSelector);
  const dispatch = useDispatch();
  if (types.length === 0) {
    return;
  }
  const onChangeTypeFee = async (type) => {
    await dispatch(actionChangeFeeType(type?.tokenId));
    if (typeof type?.onChangeFee === 'function') {
      type?.onChangeFee(type);
    }
  };
  React.useEffect(() => {
    if (isFetched) {
      const fee = isUseTokenFee ? feePTokenText : feePrvText;
      dispatch(change(formName, 'fee', fee));
      dispatch(focus(formName, 'fee'));
    }
  }, [isUseTokenFee]);
  return (
    <View style={styled.spFeeContainer}>
      {types.map((type, index) => (
        <SupportFeeItem
          key={type?.tokenId}
          {...{
            ...type,
            isActived: actived === type?.tokenId,
            tail: index === types.length - 1,
            onPress: () => onChangeTypeFee({ ...type }),
          }}
        />
      ))}
    </View>
  );
};

export default withEstimateFee(EstimateFeeInput);
