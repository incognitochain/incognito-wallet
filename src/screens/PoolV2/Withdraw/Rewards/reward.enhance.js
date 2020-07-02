import React from 'react';
import { useNavigationParam } from 'react-navigation-hooks';

const withRewards = WrappedComp => (props) => {
  const totalRewards = useNavigationParam('totalRewards');
  const displayFullTotalRewards = useNavigationParam('displayFullTotalRewards');

  return (
    <WrappedComp
      {...{
        ...props,
        totalRewards,
        displayFullTotalRewards,
      }}
    />
  );
};

export default withRewards;
