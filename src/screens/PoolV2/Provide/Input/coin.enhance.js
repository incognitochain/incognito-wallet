import React from 'react';
import { useNavigationParam } from 'react-navigation-hooks';
import { MAX_FEE_PER_TX } from '@components/EstimateFee/EstimateFee.utils';
import { COINS } from '@src/constants';

const withCoinData = WrappedComp => (props) => {
  const coin = useNavigationParam('coin');
  const prvBalance = useNavigationParam('prvBalance');

  return (
    <WrappedComp
      {...{
        ...props,
        coin,
        inputToken: coin,
        inputBalance: coin.balance,
        inputMin: (coin.id === COINS.PRV_ID ? coin.min + MAX_FEE_PER_TX : coin.min) || MAX_FEE_PER_TX,
        fee: MAX_FEE_PER_TX,
        feeToken: COINS.PRV,
        prvBalance,
      }}
    />
  );
};

export default withCoinData;
