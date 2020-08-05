import React from 'react';
import { useNavigationParam } from 'react-navigation-hooks';
import convertUtil from '@utils/convert';
import formatUtil from '@utils/format';

const withData = WrappedComp => (props) => {
  const coin = useNavigationParam('coin');
  const value = useNavigationParam('value');
  const rawText = useNavigationParam('text');
  const fee = useNavigationParam('fee');
  const feeToken = useNavigationParam('feeToken');
  const prvBalance = useNavigationParam('prvBalance');

  const deposit = formatUtil.toFixed(convertUtil.toNumber(rawText), coin.pDecimals);
  const provide = formatUtil.amountFull(value, coin.pDecimals);

  return (
    <WrappedComp
      {...{
        ...props,
        coin,
        value,
        deposit,
        provide,
        fee,
        feeToken,
        prvBalance,
      }}
    />
  );
};

export default withData;
