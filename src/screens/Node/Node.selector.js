import { createSelector } from 'reselect';

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
      withdrawTxs:  node?.withdrawTxs
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

export const missingSetupNodeSelector = createSelector(
  nodeSelector,
  (node) => node?.missingSetup,
);