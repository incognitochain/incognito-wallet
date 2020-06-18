import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useDispatch } from 'react-redux';
import { actionFetchDevices } from '@screens/Setting/Setting.actions';

const enhance = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(actionFetchDevices());
  }, []);
  return (
    <ErrorBoundary>
      <WrappedComp {...props} />
    </ErrorBoundary>
  );
};

export default enhance;
