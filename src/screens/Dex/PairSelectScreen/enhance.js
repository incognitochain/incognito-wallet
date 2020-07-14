import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useNavigationParam } from 'react-navigation-hooks';

const enhance = WrappedComp => (props) => {
  const pairs = useNavigationParam('pairs') || [];
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          pairs,
        }}
      />
    </ErrorBoundary>
  );
};

export default enhance;
