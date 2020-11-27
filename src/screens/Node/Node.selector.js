import { createSelector } from 'reselect';
import memoize from 'memoize-one';
import { findNodeIndexByProductId } from '@screens/Node/Node.utils';

export const nodeSelector = createSelector(
  (state) => state.node,
  (node) => {
    return {
      ...node, 
      isFetching:   node?.isFetching,
      isRefreshing: node?.isRefreshing,
      missingSetup: node?.missingSetup,

      listDevice:   node?.listDevice, // List node device
      noRewards:    node?.noRewards,
      nodeRewards:  node?.nodeRewards,
      withdrawTxs:  node?.withdrawTxs,
      loadedNodes:  node?.loadedNodes
    };
  }
);

export const vNodeOptionsSelector = createSelector(
  nodeSelector,
  (node) => {
    const {
      hasVNode,
      vNodeNotHaveBLS,
    } = node?.vNodeOptions;
    return {
      hasVNode,
      vNodeNotHaveBLS,
    };
  },
);

export const listDeviceSelector = createSelector(
  nodeSelector,
  (node) => (node?.listDevice || []),
);

export const loadedNodesSelector = createSelector(
  nodeSelector,
  (node) => (node?.loadedNodes || []),
);

export const missingSetupNodeSelector = createSelector(
  nodeSelector,
  (node) => node?.missingSetup,
);

export const getDeviceByProductId = createSelector(
  listDeviceSelector,
  (listDevice) =>
    memoize((productId) => {
      const deviceIndex = findNodeIndexByProductId(listDevice, productId);
      if (deviceIndex > -1 && listDevice.length > deviceIndex) {
        return listDevice[deviceIndex];
      }
      return null;
    }),
);

export const checkLoadingNodeByProductId = createSelector(
  nodeSelector,
  loadedNodesSelector,
  (node, loadedNodes) =>
    memoize((productId) => {
      const nodeIsLoading = !loadedNodes[productId];
      return nodeIsLoading || node?.isFetching || node?.isRefreshing;
    }),
);