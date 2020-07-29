import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';

const enhance = WrappedComp => props => {
  return (
    <ErrorBoundary>
      <WrappedComp {...props} />
    </ErrorBoundary>
  );
};

export default enhance;
