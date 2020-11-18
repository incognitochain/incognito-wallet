import React from 'react';
import { useNavigationParam } from 'react-navigation-hooks';
import formatUtil from '@utils/format';

const withData = WrappedComp => (props) => {
  const coin        = useNavigationParam('coin');
  const value       = useNavigationParam('value');
  const fee         = useNavigationParam('fee');
  const feeToken    = useNavigationParam('feeToken');
  const prvBalance  = useNavigationParam('prvBalance');
  const payOnOrigin = useNavigationParam('payOnOrigin');
  const isPrv       = useNavigationParam('isPrv');

  const formatDeposit = (_value, _fee) => {
    return isPrv ? (payOnOrigin ? _value : (_value + _fee)) : _value;
  };

  const originProvide = payOnOrigin ? (value - fee) : value;
  const provide = formatUtil.amountFull(
    originProvide,
    coin.pDecimals
  );

  const originDeposit = formatDeposit(value, fee);
  const deposit       = formatUtil.amountFull(originDeposit, feeToken.pDecimals);

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
        payOnOrigin,
        isPrv,
        originProvide,
      }}
    />
  );
};

export default withData;
