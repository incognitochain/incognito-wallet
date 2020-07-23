import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingContainer from '@src/components/LoadingContainer';
import { compose } from 'recompose';
import ErrorBoundary from '@src/components/ErrorBoundary/ErrorBoundary';
import { notificationSelector } from './Notification.selector';
import {
  actionFetch,
  actionLoadmore,
  actionRefresh,
} from './Notification.actions';

const enhance = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const { isFetching, isFetched, data, isRefresh } = useSelector(
    notificationSelector,
  );
  const { page, over, list } = data;
  const showActivityIndicator = isFetching && page !== 0;
  const handleLoadmore = async () => {
    try {
      if (!over) {
        await dispatch(actionLoadmore());
        await dispatch(
          actionFetch({
            loadmore: true,
          }),
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  const onRefresh = async () => {
    try {
      if (!isRefresh) {
        await dispatch(actionRefresh());
        await dispatch(actionFetch());
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!isFetched) {
    return <LoadingContainer />;
  }
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          handleLoadmore,
          list,
          showActivityIndicator,
          refreshing: isRefresh,
          onRefresh,
        }}
      />
    </ErrorBoundary>
  );
};

export default compose(enhance);
