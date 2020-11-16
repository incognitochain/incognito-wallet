import React, {useEffect, useState} from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { nodeSelector } from '@screens/Node/Node.selector';
import {
  actionUpdateNumberLoadedVNodeBLS, actionUpdatePNodeItem,
  actionUpdateVNodeItem
} from '@screens/Node/Node.actions';
import { isEmpty } from 'lodash';

const enhance = WrappedComp => props => {
  const dispatch = useDispatch();
  const {
    item: device,
    isFetching,

    onImport,
    onRemove,
    onStake,
    onUnstake,
    onWithdraw
  } = props;

  const [loading, setLoading] = useState(false);
  const { isRefreshing: isRefresh } = useSelector(nodeSelector);

  const getVNodeInfo = async () => {
    const blsKey    = device?.PublicKeyMining;
    const publicKey = device?.PublicKey;
    const productId = device?.ProductId;

    dispatch(actionUpdateVNodeItem(
      { blsKey, productId, device },
      () => {
        if (isEmpty(blsKey) || isEmpty(publicKey)) {
          dispatch(actionUpdateNumberLoadedVNodeBLS());
        }
        setLoading(false);
      }));
  };

  const getPNodeInfo = async () => {
    const productId = device?.ProductId;
    dispatch(actionUpdatePNodeItem(
      { productId },
      () => {
        setLoading(false);
      }));
  };

  const getNodeInfo = async () => {
    device.IsVNode
      ? getVNodeInfo().then()
      : getPNodeInfo().then();
  };

  const fetchData = () => {
    setLoading(true);
    getNodeInfo().then();
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
          loading: loading || isFetching || isRefresh,

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