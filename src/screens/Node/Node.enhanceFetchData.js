import React, {useCallback, useEffect} from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import {useDispatch, useSelector} from 'react-redux';
import {nodeSelector, vNodeOptionsSelector} from '@screens/Node/Node.selector';
import {useFocusEffect} from 'react-navigation-hooks';
import {getTotalVNode} from '@screens/Node/Node.utils';
import {
  actionGetNodesInfoFromApi as getNodesInfoFromApi,
  actionSetTotalVNode as setTotalVNode,
  actionUpdateListNodeDevice as updateListNode
} from '@screens/Node/Node.actions';
import LocalDatabase from '@utils/LocalDatabase';

let lastRefreshTime;

const enhanceFetchData = WrappedComp => props => {
  const dispatch    = useDispatch();
  const { refresh } = props?.navigation?.state?.params || {};

  const {
    listDevice,
    isFetched,
  } = useSelector(nodeSelector);

  const {
    hasVNode,
    vNodeNotHaveBLS
  } = useSelector(vNodeOptionsSelector);

  const fetchData = async (firstTime = false) => {
    if (firstTime !== true && (!refresh || (refresh === lastRefreshTime))) {
      return;
    }

    lastRefreshTime = refresh || new Date().getTime();

    // update list nodes from local
    let listDevice = await LocalDatabase.getListDevices();
    dispatch(updateListNode({ listDevice }));

    //add loading here
    getTotalVNode()
      .then(async ({ hasVNode, vNodeNotHaveBLS }) => {
        //check vNode have blsKey
        dispatch(setTotalVNode({ hasVNode, vNodeNotHaveBLS }));
        if ((hasVNode && vNodeNotHaveBLS === 0) || !hasVNode) {
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

    // has VNode && have vNode dont have blsKey
    // start loading waiting vNode get blsKey
    // else if (hasVNode && vNodeNotHaveBLS === -1) {
    //   dispatch(updateFetching(true));
    // }
  }, [
    isFetched,
    hasVNode,
    vNodeNotHaveBLS,
    listDevice
  ]);

  useEffect(() => {
    fetchData(true).then();
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