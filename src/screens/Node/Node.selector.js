import { createSelector } from 'reselect';

export const nodeSelector = createSelector(
  (state) => state.node,
  (node) => {
    const { rewards,withdrawable, noRewards  } = node?.combineRewards;

    return {
      ...node, 
      isFetching:   node?.isFetching,
      withdrawing:  node?.withdrawing,
      listDevice:   node?.listDevice,
      allTokens:    node?.allTokens,
      nodeRewards:  node?.nodeRewards,
      committees:   node?.committees,

      missingSetup: node?.missingSetup,

      //Combine awards below
      rewards:      rewards,
      withdrawable: withdrawable,
      noRewards:    noRewards,
    };
  }
);

export const missingSetupNodeSelector = createSelector(
  nodeSelector,
  (node) => node?.missingSetup,
);