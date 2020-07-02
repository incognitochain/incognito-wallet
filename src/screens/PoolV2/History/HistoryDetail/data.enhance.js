import React from 'react';
import { useNavigationParam } from 'react-navigation-hooks';

const withData = WrappedComp => (props) => {
  const history = useNavigationParam('history');

  return (
    <WrappedComp
      {...{
        ...props,
        history,
      }}
    />
  );
};

export default withData;
