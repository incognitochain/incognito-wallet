import React from 'react';
import { useNavigationParam } from 'react-navigation-hooks';
import { COINS } from '@src/constants';

const withCoinData = WrappedComp => (props) => {
  const coin = useNavigationParam('coin');

  return (
    <WrappedComp
      {...{
        ...props,
        coin,
        fee: 0,
        feeToken: COINS.PRV,
        inputToken: coin,
        inputBalance: coin.balance,
      }}
    />
  );
};

export default withCoinData;
