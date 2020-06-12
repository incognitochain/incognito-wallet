import React from 'react';
import { useNavigationParam } from 'react-navigation-hooks';
import convertUtil from '@utils/convert';
import formatUtil from '@utils/format';

const withData = WrappedComp => (props) => {
  const inputToken = useNavigationParam('inputToken');
  const inputValue = useNavigationParam('inputValue');
  const rawText = useNavigationParam('inputText');
  const outputToken = useNavigationParam('outputToken');
  const outputValue = useNavigationParam('outputValue');
  const minimumAmount = useNavigationParam('minimumAmount');
  const inputBalance = useNavigationParam('inputBalance');
  const prvBalance = useNavigationParam('prvBalance');
  const pair = useNavigationParam('pair');
  const fee = useNavigationParam('fee');
  const feeToken = useNavigationParam('feeToken');
  const isErc20 = useNavigationParam('isErc20');
  const quote = useNavigationParam('quote');

  const inputText = formatUtil.toFixed(convertUtil.toNumber(rawText), inputToken.pDecimals);

  return (
    <WrappedComp
      {...{
        ...props,
        inputToken,
        inputValue,
        inputText,
        outputToken,
        outputValue,
        minimumAmount,
        fee,
        feeToken,
        pair,

        inputBalance,
        prvBalance,
        isErc20,
        quote,
      }}
    />
  );
};

export default withData;
