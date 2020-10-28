import { createSelector } from 'reselect';

export const nodeSelector = createSelector(
  (state) => state.node,
  (node) => ({
    ...node,
    isFetching:   node?.isFetching,
    withdrawing:  node?.withdrawing,
    listDevice:   node?.listDevice,
    allTokens:    node?.allTokens,
    nodeRewards:  node?.nodeRewards,
    committees:   node?.committees
  }),
);