import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useDispatch } from 'react-redux';
import { FollowAction } from '@screens/Wallet/features/FollowList/index';
import useDebounceSelector from '@src/shared/hooks/debounceSelector';
import { isFetchingSelector } from '@screens/Wallet/features/FollowList/FollowList.selector';
import { getPTokenList } from '@src/redux/actions/token';
import {useIsFocused } from 'react-navigation-hooks';

const withFollowList = WrappedComp => props => {
  const dispatch = useDispatch();
  const isRefreshing = useDebounceSelector(isFetchingSelector);
  const isFocused = useIsFocused();
  const loadBalance = React.useCallback(() => {
    if (isRefreshing) return;
    dispatch(getPTokenList());
    dispatch(FollowAction.actionLoadFollowBalance());
  }, [isRefreshing]);

   React.useEffect(() => {
     isFocused && loadBalance();
   }, [isFocused]);

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,

          loadBalance,
        }}
      />
    </ErrorBoundary>
  );
};

export default withFollowList;
