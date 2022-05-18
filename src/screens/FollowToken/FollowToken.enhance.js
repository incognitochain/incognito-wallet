import withLazy from '@components/LazyHoc/LazyHoc';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { withLayout_2 } from '@src/components/Layout';
import React from 'react';
import { compose } from 'recompose';

export const withFollow = (WrappedComp) => (props) => {
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
        }}
      />
    </ErrorBoundary>
  );
};

export default compose(withLazy, withFollow, withLayout_2);
