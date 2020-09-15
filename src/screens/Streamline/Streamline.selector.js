import { createSelector } from 'reselect';

export const streamlineSelector = createSelector(
  (state) => state.streamline,
  (streamline) => streamline,
);

export const streamlineStorageSelector = createSelector(
  streamlineSelector,
  (streamline) => streamline?.storage,
);
