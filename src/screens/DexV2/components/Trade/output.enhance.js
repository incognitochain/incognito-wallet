import React from 'react';
import _ from 'lodash';
import formatUtils from '@utils/format';
import { MIN_PERCENT } from '@screens/DexV2/constants';
import { getQuote as getQuoteAPI } from '@services/trading';
import { calculateOutputValue as calculateOutput } from './utils';

const withCalculateOutput = WrappedComp => (props) => {
  const [outputValue, setOutputValue] = React.useState(0);
  const [outputText, setOutputText] = React.useState('0');
  const [minimumAmount, setMinimumAmount] = React.useState(0);
  const [gettingQuote, setGettingQuote] = React.useState(false);
  const [quote, setQuote] = React.useState(null);

  const { inputToken, inputValue, outputToken, pair } = props;

  const calculateOutputValue = () => {
    let outputValue = calculateOutput(pair, inputToken, inputValue, outputToken);

    if (outputValue < 0) {
      outputValue = 0;
    }

    setOutputValue(outputValue);

    const minimumAmount = _.floor(outputValue * MIN_PERCENT);
    setMinimumAmount(minimumAmount);

    let outputText = formatUtils.amountFull(minimumAmount, outputToken.pDecimals);

    if (outputValue === 0 || minimumAmount === 0 || _.isNaN(minimumAmount)) {
      outputText = 0;
    }

    setOutputText(outputText.toString());

    // console.debug('TOKEN', inputToken.symbol, outputToken.symbol, outputToken.pDecimals, inputValue);
    // console.debug('PAIR', pair, pair[inputToken.id], pair[outputToken.id]);
    // console.debug('RESULT', outputValue, minimumAmount, outputText, outputValue === 0 || minimumAmount === 0 || isNaN(outputText));
  };

  const getQuote = async (inputToken, outputToken, value) => {
    if (gettingQuote) {
      return;
    }

    try {
      setGettingQuote(true);

      const quote = await getQuoteAPI({
        sellToken: inputToken,
        sellAmount: value,
        buyToken: outputToken,
        protocol: 'Kyber',
      });

      const { amount } = quote;
      const minimumAmount = _.floor(amount * MIN_PERCENT);

      setOutputValue(amount);
      setMinimumAmount(minimumAmount);


      if (minimumAmount === 0 || isNaN(minimumAmount)) {
        setOutputText(0);
      } else {
        const outputText = formatUtils.amountFull(minimumAmount, outputToken.pDecimals);
        setOutputText(outputText);
      }
      setQuote(quote);
    } catch (error) {
      setMinimumAmount(0);
      setOutputValue(0);
      setOutputText(0);
      setQuote(null);
    } finally {
      setGettingQuote(false);
    }
  };

  const debouncedGetQuote = React.useCallback(_.debounce(getQuote, 1000), []);

  React.useEffect(() => {
    if (inputToken && outputToken && inputValue) {
      if (inputToken.address && outputToken.address) {
        debouncedGetQuote(inputToken, outputToken, inputValue);
      } else {
        calculateOutputValue();
      }
    }

    if (!inputValue) {
      setOutputValue(0);
      setOutputText(0);
      setMinimumAmount(0);
      setQuote(null);
    }
  }, [inputToken, inputValue, outputToken, pair]);

  return (
    <WrappedComp
      {...{
        ...props,
        outputValue,
        outputText,
        minimumAmount,
        quote,
        gettingQuote,
      }}
    />
  );
};

export default withCalculateOutput;
