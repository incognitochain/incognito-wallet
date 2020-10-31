import React, {useEffect, useMemo, useState} from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { nodeSelector } from '@screens/Node/Node.selector';
import {
  actionUpdateNumberLoadedVNodeBLS,
  updateDeviceItem
} from '@screens/Node/Node.actions';
import { isEmpty } from 'lodash';

const enhance = WrappedComp => props => {
  const dispatch = useDispatch();
  const {
    item: device,
    onImport
  } = props;

  const {
    isRefreshing
  } = useSelector(nodeSelector);

  const [loading, setLoading] = useState(false);

  const getVNodeInfo = async () => {
    const blsKey    = device?.PublicKeyMining;
    const productId = device?.ProductId;
    dispatch(updateDeviceItem(
      { blsKey, productId, device },
      () => {
        if (isEmpty(blsKey)) {
          dispatch(actionUpdateNumberLoadedVNodeBLS());
        }
        setLoading(false);
      }));
  };

  const getPNodeInfo = async () => {

  };

  const getNodeInfo = async () => {
    device.IsVNode
      ? getVNodeInfo().then()
      : getVNodeInfo().then();
  };

  const fetchData = () => {
    setLoading(true);
    getNodeInfo().then();
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isRefreshing) {
      fetchData();
    }
  }, [isRefreshing]);

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          item: device,
          loading: loading,

          onImport
        }}
      />
    </ErrorBoundary>
  );
};

export default enhance;