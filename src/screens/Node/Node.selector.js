import { createSelector } from 'reselect';

export const nodeSelector = createSelector(
  (state) => state.node,
  (node) => {

    return {
      ...node, 
      isFetching:   node?.isFetching,
      withdrawing:  node?.withdrawing,
      allTokens:    node?.allTokens,
      // nodeRewards:  node?.nodeRewards,
      // committees:   node?.committees,

      missingSetup: node?.missingSetup,

      //Combine awards below
      rewards:      node?.rewards,
      withdrawable: node?.withdrawable,

      //new flow
      listDevice:   node?.listDevice, //List node device
      nodesFromApi: node?.nodesFromApi,
      noRewards:    node?.noRewards,
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