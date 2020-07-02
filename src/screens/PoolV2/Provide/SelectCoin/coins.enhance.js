import React from 'react';
import { useNavigationParam } from 'react-navigation-hooks';

const withCoinsData = WrappedComp => (props) => {
  const coins = useNavigationParam('coins') || [];

  return (
    <WrappedComp
      {...{
        ...props,
        coins,
      }}
    />
  );
};

export default withCoinsData;
