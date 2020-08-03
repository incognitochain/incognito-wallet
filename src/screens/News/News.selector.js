import { createSelector } from 'reselect';

export const newsSelector = createSelector(
  (state) => state.news,
  (news) => news,
);

export const newsDataSelector = createSelector(
  newsSelector,
  (news) => news?.data || [],
);
