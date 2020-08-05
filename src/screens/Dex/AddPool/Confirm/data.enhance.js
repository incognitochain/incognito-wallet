import React from 'react';
import { useNavigationParam } from 'react-navigation-hooks';
import { MAX_FEE_PER_TX } from '@components/EstimateFee/EstimateFee.utils';
import { COINS } from '@src/constants';

const withData = WrappedComp => (props) => {
  const firstCoin = useNavigationParam('firstCoin');
  const secondCoin = useNavigationParam('secondCoin');
  const prvBalance = useNavigationParam('prvBalance');
  const share = useNavigationParam('share');
  const pair = useNavigationParam('pair');

  return (
    <WrappedComp
      {...{
        ...props,
        firstCoin,
        secondCoin,
        prvBalance,
        share,
        fee: MAX_FEE_PER_TX,
        feeToken: COINS.PRV,
        pair,
      }}
    />
  );
};

export default withData;
