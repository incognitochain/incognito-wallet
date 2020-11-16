import React, { useCallback, useEffect } from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { vNodeOptionsSelector } from '@screens/Node/Node.selector';
import {useFocusEffect, useNavigationParam} from 'react-navigation-hooks';
import { getTotalVNode } from '@screens/Node/Node.utils';
import {
  actionClearNodeData as clearNodeData,
  actionGetNodesInfoFromApi as getNodesInfoFromApi,
  actionSetTotalVNode as setTotalVNode,
  actionUpdateListNodeDevice as updateListNode
} from '@screens/Node/Node.actions';
import LocalDatabase from '@utils/LocalDatabase';

let lastRefreshTime;

const enhanceFetchData = WrappedComp => props => {
  const {
    listDevice,
    isFetched
  } = props;

  const dispatch    = useDispatch();
  const refresh     = useNavigationParam('refresh');

  const {
    hasVNode,
    vNodeNotHaveBLS
  } = useSelector(vNodeOptionsSelector);

  const fetchData = async (firstTime = false) => {
    if (firstTime !== true && (!refresh || (refresh === lastRefreshTime))) {
      return;
    }
    //clear data
    dispatch(clearNodeData());

    lastRefreshTime = refresh || new Date().getTime();

    // update list nodes from local
    let listDevice = await LocalDatabase.getListDevices();
    dispatch(updateListNode({ listDevice }));

    //add loading here
    getTotalVNode()
      .then(async ({ hasVNode, vNodeNotHaveBLS, hasNode }) => {
        //check vNode have blsKey
        dispatch(setTotalVNode({ hasVNode, vNodeNotHaveBLS }));
        if (hasNode && ((hasVNode && vNodeNotHaveBLS === 0) || !hasVNode)) {
          dispatch(getNodesInfoFromApi());
        }
      });
  };

  const refreshData = () => {
    dispatch(getNodesInfoFromApi(true));
  };

  useEffect(() => {
    // return when dont have device
    if (!listDevice || listDevice.length === 0 || isFetched) return;

    // if have vNode and all vNode loaded blsKey
    // dont have vNode
    if ((hasVNode && vNodeNotHaveBLS === 0) || !hasVNode) {
      dispatch(getNodesInfoFromApi());
    }

  }, [
    isFetched,
    hasVNode,
    vNodeNotHaveBLS,
    listDevice
  ]);

  useEffect(() => {
    fetchData(true).then();

    return () => {
      // Screen removed clear List Node
      dispatch(clearNodeData(true));
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData().then();
    }, [refresh])
  );

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,

          refreshData
        }}
      />
    </ErrorBoundary>
  );
};

export default enhanceFetchData;