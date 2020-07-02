import React from 'react';
import { useNavigationParam } from 'react-navigation-hooks';

const withCoinsData = WrappedComp => (props) => {
  const coins = useNavigationParam('data') || [];
  const totalRewards = useNavigationParam('totalRewards');
  const displayFullTotalRewards = useNavigationParam('displayFullTotalRewards');

  return (
    <WrappedComp
      {...{
        ...props,
        coins,
        totalRewards,
        displayFullTotalRewards,
      }}
    />
  );
};

export default withCoinsData;
