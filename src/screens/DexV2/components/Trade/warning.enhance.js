import React from 'react';
import _ from 'lodash';
import convert from '@utils/convert';
import { calculateOutputValueCrossPool } from './utils';

const withWarning = (WrappedComp) => (props) => {
  const [warning, setWarning] = React.useState('');

  const {
    inputToken,
    inputValue,
    outputToken,
    outputValue,
    pair,
    gettingQuote,
    isErc20,
  } = props;

  const calculateHalfValue = () => {
    if (isErc20 && gettingQuote) {
      return setWarning('');
    }
    if (
      inputToken &&
      outputToken &&
      inputValue &&
      outputValue &&
      inputValue > convert.toOriginalAmount(1, inputToken.pDecimals)
    ) {
      const halfInput = inputValue / 2;
      const halfOutput = calculateOutputValueCrossPool(
        pair,
        inputToken,
        halfInput,
        outputToken,
      );
      const exchangeRate1 = inputValue / outputValue;
      const exchangeRate2 = halfInput / halfOutput;
      const lostPercent = 1 - _.floor(exchangeRate2 / exchangeRate1, 2);
      if (lostPercent > 0.1) {
        return setWarning('This pool has low liquidity. Please note prices.');
      }
    }
    setWarning('');
  };

  React.useEffect(() => {
    calculateHalfValue();
  }, [isErc20, gettingQuote, pair, inputValue, outputValue]);

  return (
    <WrappedComp
      {...{
        ...props,
        warning,
      }}
    />
  );
};

export default withWarning;
