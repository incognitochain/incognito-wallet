import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useSelector, useDispatch } from 'react-redux';
import { withLayout_2 } from '@src/components/Layout';
import { compose } from 'recompose';
import { actionFetchServers, actionFetchDevices } from './Setting.actions';
import { settingSelector } from './Setting.selector';

const enhance = (WrappedComp) => (props) => {
  const { defaultServerId } = useSelector(settingSelector);
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(actionFetchServers());
  }, [defaultServerId]);
  React.useEffect(() => {
    dispatch(actionFetchDevices());
  }, []);
  return (
    <ErrorBoundary>
      <WrappedComp {...props} />
    </ErrorBoundary>
  );
};

export default compose(enhance);
