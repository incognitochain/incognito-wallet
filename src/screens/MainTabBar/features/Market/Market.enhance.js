import withFollowToken from '@screens/FollowToken/FollowToken.enhance';
import withHome from '@screens/MainTabBar/features/Home/Home.enhance';
import ErrorBoundary from '@src/components/ErrorBoundary';
import React from 'react';
import { compose } from 'recompose';

const withMarket = (WrappedComp) => (props) => {
  const [filter, setFilter] = React.useState({
    filterField: 'change',
    orderField: 'desc',
  });
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          ...filter,
          onFilter: setFilter,
        }}
      />
    </ErrorBoundary>
  );
};

export default compose(withHome, withMarket, withFollowToken);
