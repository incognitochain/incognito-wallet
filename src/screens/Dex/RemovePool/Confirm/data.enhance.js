import React from 'react';
import { useNavigationParam } from 'react-navigation-hooks';
import { MAX_FEE_PER_TX } from '@components/EstimateFee/EstimateFee.utils';
import { COINS } from '@src/constants';

const withData = WrappedComp => (props) => {
  const pair = useNavigationParam('pair');
  const topText = useNavigationParam('topText');
  const bottomText = useNavigationParam('bottomText');
  const value = useNavigationParam('value');

  return (
    <WrappedComp
      {...{
        ...props,
        pair,
        topText,
        bottomText,
        value,
        fee: MAX_FEE_PER_TX,
        feeToken: COINS.PRV,
      }}
    />
  );
};

export default withData;
