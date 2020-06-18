import React from 'react';
import _ from 'lodash';
import convertUtil from '@utils/convert';
import formatUtil from '@utils/format';

const withChangeInput = WrappedComp => (props) => {
  const [inputValue, setInputValue] = React.useState(null);
  const [inputText, setInputText] = React.useState('');

  const { inputToken, fee, feeToken } = props;

  const changeInputText = (newText) => {
    if (newText.includes('e-')) {
      newText = formatUtil.toFixed(convertUtil.toNumber(newText, true), inputToken.pDecimals);
    }

    setInputText(newText);
    if (!newText) {
      setInputValue(0);
    }

    if (newText.toString() === 'NaN') {
      setInputText('');
    }
  };

  React.useEffect(() => {
    if (fee && feeToken && inputText) {
      const number = convertUtil.toNumber(inputText);
      if (!_.isNaN(number) && number > 0) {
        const originalAmount = convertUtil.toOriginalAmount(number, inputToken.pDecimals, inputToken.pDecimals !== 0);
        const value = feeToken.id === inputToken.id ? originalAmount - fee : originalAmount;
        setInputValue(value);
      }
    }
  }, [fee, feeToken, inputText, inputToken]);

  return (
    <WrappedComp
      {...{
        ...props,
        inputValue,
        inputToken,
        inputText,

        onChangeInputValue: setInputValue,
        onChangeInputText: changeInputText,
      }}
    />
  );
};

export default withChangeInput;
