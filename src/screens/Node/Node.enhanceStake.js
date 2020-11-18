import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { onClickView } from '@utils/ViewUtil';
import routeNames from '@routers/routeNames';
import { useNavigation } from 'react-navigation-hooks';

const enhanceStake = WrappedComp => props => {
  const navigation = useNavigation();

  const handlePressStake = onClickView(async (device) => {
    navigation.navigate(routeNames.AddStake, { device });
  });

  const handlePressUnstake = onClickView(async (device) => {
    navigation.navigate(routeNames.Unstake, { device });
  });
  
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,

          handlePressStake,
          handlePressUnstake
        }}
      />
    </ErrorBoundary>
  );
};

export default enhanceStake;