import React, {useEffect} from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import {
  actionUpdatePNodeItem,
  actionUpdateVNodeItem as updateVNodeItem,
} from '@screens/Node/Node.actions';
import {
  checkLoadingNodeByProductId, nodeSelector
} from '@screens/Node/Node.selector';

const enhance = WrappedComp => props => {
  const dispatch = useDispatch();
  const {
    item: device,
    onImport,
    onRemove,
    onStake,
    onUnstake,
    onWithdraw
  } = props;

  const {
    isRefreshing: isRefresh
  } = useSelector(nodeSelector);
  const isLoading
    = useSelector(checkLoadingNodeByProductId)(device?.ProductId);

  const getVNodeInfo = () => {
    dispatch(updateVNodeItem(device));
  };

  const getPNodeInfo = () => {
    dispatch(actionUpdatePNodeItem(device?.ProductId));
  };

  const fetchData = () => {
    device.IsVNode ? getVNodeInfo() : getPNodeInfo();
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isRefresh) {
      fetchData();
    }
  }, [isRefresh]);

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          item: device,
          loading: isLoading,

          onImport,
          onRemove,
          onStake,
          onUnstake,
          onWithdraw,
        }}
      />
    </ErrorBoundary>
  );
};

export default enhance;