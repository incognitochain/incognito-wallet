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
        fee: MAX_FEE_PER_TX * 2,
        feeToken: COINS.PRV,
        inputFee: coin.id === COINS.PRV_ID ? MAX_FEE_PER_TX : 0,
        prvBalance,
      }}
    />
  );
};

export default withCoinData;
