import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { withLayout_2 } from '@components/Layout';
import useShare from '@screens/LiquidityVer1/Liquidity.useShare';
import { LoadingContainer } from '@src/components';

const withShareVer1 = (WrappedComp) => (props) => {
  const { share, loading } = useShare();

  if (loading) return <LoadingContainer />;

  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, share }} />
    </ErrorBoundary>
  );
};

export default compose(
  withShareVer1,
  withLayout_2
);
