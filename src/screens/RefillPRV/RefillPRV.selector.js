import { createSelector } from 'reselect';

const refillPRVSelector = createSelector(
  (state) => state.refillPRVReducer,
  (refillPRVReducer) => refillPRVReducer,
);

const modalVisibleSelector = createSelector(
  refillPRVSelector,
  ({ isVisible }) => isVisible,
);

const minPRVNeededSelector = createSelector(
  refillPRVSelector,
  ({ minPRVNeeded }) => minPRVNeeded,
);



export {
  refillPRVSelector,
  modalVisibleSelector,
  minPRVNeededSelector
};
