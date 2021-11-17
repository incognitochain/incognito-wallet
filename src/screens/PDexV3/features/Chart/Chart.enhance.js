import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { withLayout_2 } from '@src/components/Layout';
import { useDispatch, batch } from 'react-redux';
import { useNavigationParam } from 'react-navigation-hooks';
import { actionSetPoolSelected } from '@screens/PDexV3/features/OrderLimit';
import {
  actionFetch,
  actionSetSelectedPool,
} from './Chart.actions';

const enhance = (WrappedComp) => (props) => {
  const poolid = useNavigationParam('poolId');
  const dispatch = useDispatch();
  const fetchData = async () => {
    if (!poolid) {
      return;
    }
    await dispatch(actionSetSelectedPool(poolid));
    dispatch(actionFetch());
  };
  const callback = async (poolId) => {
    batch(async () => {
      await dispatch(actionSetPoolSelected(poolId));
      await dispatch(actionSetSelectedPool(poolId));
      dispatch(actionFetch());
    });
  };
  React.useEffect(() => {
    fetchData();
    return () => {
    };
  }, [poolid]);
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, onRefresh: fetchData, callback }} />
    </ErrorBoundary>
  );
};

export default compose(
  enhance,
  withLayout_2,
);
