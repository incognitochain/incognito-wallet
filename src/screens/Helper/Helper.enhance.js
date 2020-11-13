import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { withLayout_2 } from '@components/Layout';
import { useNavigationParam } from 'react-navigation-hooks';

const enhance = WrappedComp => props => {

  const title   = useNavigationParam('title') || '';
  const content = useNavigationParam('content') || '';

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,

          title,
          content
        }}
      />
    </ErrorBoundary>
  );
};

export default compose(
  withLayout_2,
  enhance,
);