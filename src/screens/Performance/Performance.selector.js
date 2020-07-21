import { createSelector } from 'reselect';

export const performanceSelector = createSelector(
  (state) => state.performance,
  (performance) => performance,
);
