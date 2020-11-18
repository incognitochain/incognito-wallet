import React, { useState } from 'react';
import { isNumber, isNaN } from 'lodash';
import convertUtil from '@utils/convert';
import { MESSAGES, MIN_INPUT } from '@screens/Dex/constants';

const withValidate = WrappedComp => (props) => {
  const [error, setError] = React.useState('');
  const {
    inputToken,
    inputBalance,
    inputText,
    inputFee,
    feeToken,
    inputMin,
    prvBalance,
    fee,
    isPrv
  } = props;

  /**case provide All PRV
   **fee be subtract from the PRV Balance*/
  const [payOnOrigin, setPayOnOrigin] = useState(false);

  const validate = () => {
    try {
      const newValue = inputText;
      const min = isNumber(inputMin) ? inputMin : MIN_INPUT;
      let number = convertUtil.toNumber(inputText);

      if (!newValue || newValue.length === 0) {
        setError('');
      } else if (isNaN(number)) {
        if (inputFee) {
          setError(MESSAGES.GREATER(inputFee, inputToken.pDecimals));
        } else {
          setError(MESSAGES.GREATER_OR_EQUAL(min, inputToken.pDecimals));
        }
      } else {
        number = convertUtil.toOriginalAmount(number, inputToken.pDecimals, inputToken.pDecimals !== 0);
        setPayOnOrigin(false);
        if ((
          !isPrv &&
          inputBalance !== null &&
          inputFee !== null &&
          number > inputBalance
        ) || (
          isPrv && (prvBalance < number)
        )) {
          setError(MESSAGES.BALANCE_INSUFFICIENT);
        } else if (inputFee && number <= inputFee) {
          setError(MESSAGES.GREATER(inputFee, inputToken.pDecimals));
        } else if (number < min) {
          setError(MESSAGES.GREATER_OR_EQUAL(min, inputToken.pDecimals));
        } else if (
          prvBalance < fee ||
          (isPrv && (
            (prvBalance < min + fee)
            ||
            (
              prvBalance === fee + min &&
              number !== min &&
              number !== prvBalance
            )
          ))
        ) {
          setError(MESSAGES.NOT_ENOUGH_PRV_NETWORK_FEE);
        } else if (!Number.isInteger(number)) {
          setError(MESSAGES.MUST_BE_INTEGER);
        } else {
          setError('');
          /** user provide all PRV
           *** fee will be subtract from the PRV Balance **/
          setPayOnOrigin(isPrv && prvBalance === number);
        }
      }
    } catch (error) {
      console.debug('FILTER OUTPUT LIST', error);
    }
  };

  React.useEffect(() => {
    if (inputToken && feeToken) {
      validate();
    }
  }, [inputText, inputBalance, inputToken, feeToken]);

  return (
    <WrappedComp
      {...{
        ...props,
        error,
        payOnOrigin
      }}
    />
  );
};

export default withValidate;
