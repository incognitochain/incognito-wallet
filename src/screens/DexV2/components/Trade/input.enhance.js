import React from 'react';
import { isNaN } from 'lodash';
import convertUtil from '@utils/convert';
import formatUtil from '@utils/format';
import { useNavigationParam } from 'react-navigation-hooks';

const withChangeInput = WrappedComp => (props) => {
  const fromTrade = useNavigationParam('fromTrade');

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
    if (feeToken && inputText) {
      const number = convertUtil.toNumber(inputText);
      if (!isNaN(number) && number > 0) {
        const originalAmount = convertUtil.toOriginalAmount(number, inputToken.pDecimals, inputToken.pDecimals !== 0);
        if (fromTrade) {
          const value = feeToken.id === inputToken.id ? originalAmount - fee : originalAmount;
          setInputValue(value);
          return;
        }
        setInputValue(originalAmount);
      }
    }
  }, [fee, feeToken, inputText, inputToken, fromTrade]);

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
