import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useSelector } from 'react-redux';
import { accountSelector } from '@src/redux/selectors';
import { pTokensSelector } from '@src/redux/selectors/token';

const enhance = WrappedComp => props => {
  const account = useSelector(accountSelector.defaultAccountSelector);
  const wallet = useSelector((state) => state?.wallet);
  const pTokens = useSelector(pTokensSelector);

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          account,
          wallet,
          pTokens
        }}
      />
    </ErrorBoundary>
  );
};

export default enhance;
