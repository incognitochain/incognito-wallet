import React from 'react';
import { useNavigationParam } from 'react-navigation-hooks';

const withWithdrawCoins = WrappedComp => (props) => {
  const followingCoins = useNavigationParam('followingCoins');

  return (
    <WrappedComp
      {...{
        ...props,
        followingCoins,
      }}
    />
  );
};

export default withWithdrawCoins;
