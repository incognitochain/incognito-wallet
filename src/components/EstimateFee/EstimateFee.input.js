/* eslint-disable import/no-cycle */
import React from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import { Field, change, focus } from 'redux-form';
import { InputField, createForm, validator } from '@components/core/reduxForm';
import { GENERAL } from '@src/constants/elements';
import { generateTestId } from '@src/utils/misc';
import { useSelector, useDispatch } from 'react-redux';
import convert from '@src/utils/convert';
import { BtnFast } from '@src/components/Button';
import { COLORS } from '@src/styles';
import PropTypes from 'prop-types';
import { CONSTANT_COMMONS , MESSAGES } from '@src/constants';
import {
  selectedPrivacySelector,
  childSelectedPrivacySelector,
} from '@src/redux/selectors';
import { Text } from '@components/core';
import {
  PRVIDSTR as PRV_ID,
} from 'incognito-chain-web-js/build/wallet';
import { styled } from './EstimateFee.styled';
import withEstimateFee from './EstimateFee.enhance';
import { estimateFeeSelector, feeDataSelector } from './EstimateFee.selector';
import {
  actionChangeFeeType,
  actionChangeFee,
  actionToggleFastFee,
} from './EstimateFee.actions';
import { getTotalFee } from './EstimateFee.utils';

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
  const { types, isFetched, actived } = useSelector(estimateFeeSelector);
  const {
    feeUnit,
    minFee,
    maxFee,
    isUseTokenFee,
    feePDecimals,
    totalFee,
    isUnShield,
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
    if (totalFee && isFetched) {
      let maxFeeValidator;
      let minFeeValidator;
      const _maxFee = convert.toNumber(maxFee, true);
      const _fee = convert.toNumber(totalFee, true);
      const _minFee = convert.toNumber(minFee, true);
      const messageError =  actived === PRV_ID ? MESSAGES.PRV_NOT_ENOUGHT : 'Insufficient balance.';
      try {
        maxFeeValidator = validator.maxValue(_maxFee, {
          message:
            _maxFee > _fee
              ? `Must be less than ${maxFee} ${feeUnit}`
              : messageError,
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
  }, [maxFee, minFee, totalFee]);

  return (
    <Form>
      {() => (
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
            editable: false,
            inputStyle: {
              // color: COLORS.black,
            },
          }}
          label={isUnShield ? 'Fee (est.)' : 'Fee'}
          {...props}
        />
      )}
    </Form>
  );
};

EstimateFeeInput.propTypes = {};

const SupportFeeItem = (props) => {
  const { tokenId, symbol, isActived, types, tail, ...rest } = props;
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

SupportFeeItem.propTypes = {
  tokenId: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
  isActived: PropTypes.bool.isRequired,
  types: PropTypes.array.isRequired,
  tail: PropTypes.bool.isRequired,
};

const SupportFees = React.memo(() => {
  const {
    isUnShield,
    rate,
    feePDecimals,
    fee,
    userFees,
    isUsedPRVFee,
    fast2x,
    types,
    actived,
    isFetched,
    feePrv,
    feePrvText,
    feePToken,
    feePTokenText,
    hasMultiLevel,
  } = useSelector(feeDataSelector);
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const dispatch = useDispatch();
  if (types.length === 0) {
    return;
  }

  const onChangeFee = (value) => {
    if (isFetched) {
      dispatch(change(formName, 'fee', value));
      dispatch(focus(formName, 'fee'));
    }
  };

  const onChangeTypeFee = async (type) => {
    const _isUsedPRVFee = type?.tokenId === CONSTANT_COMMONS.PRV.id;
    let totalFeeText = _isUsedPRVFee ? feePrvText : feePTokenText;
    try {
      if (isUnShield) {
        const totalFeeData = getTotalFee({
          fast2x,
          rate,
          userFeesData: userFees?.data,
          pDecimals: _isUsedPRVFee
            ? CONSTANT_COMMONS.PRV.pDecimals
            : selectedPrivacy?.pDecimals,
          feeEst: _isUsedPRVFee ? feePrv : feePToken,
          isUsedPRVFee: _isUsedPRVFee,
          hasMultiLevel,
        });
        totalFeeText = totalFeeData?.totalFeeText;
        dispatch(
          actionToggleFastFee({
            fast2x,
            ...totalFeeData,
            isUsedPRVFee: _isUsedPRVFee,
          }),
        );
      }
      dispatch(actionChangeFeeType(type?.tokenId));
      onChangeFee(totalFeeText);
    } catch (error) {
      console.debug(error);
    }
  };

  const handlePressFast = async (fast2x) => {
    try {
      const totalFeeData = getTotalFee({
        fast2x,
        userFeesData: userFees?.data,
        pDecimals: feePDecimals,
        feeEst: fee,
        isUsedPRVFee,
        hasMultiLevel,
      });
      dispatch(
        actionToggleFastFee({
          fast2x,
          ...totalFeeData,
          isUsedPRVFee,
        }),
      );
      onChangeFee(totalFeeData?.totalFeeText);
    } catch (error) {
      console.debug(error);
    }
  };
  return (
    <View style={styled.spFeeContainer}>
      {isUnShield && userFees.hasMultiLevel && (
        <BtnFast style={styled.btnFast} onPress={handlePressFast} />
      )}
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
});

export default withEstimateFee(EstimateFeeInput);
