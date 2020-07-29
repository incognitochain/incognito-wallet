import { createSelector } from 'reselect';
import { camelCaseKeys } from '@src/utils';

export const profileSelector = createSelector(
  (state) => state.profile,
  (profile) => ({ ...profile, data: camelCaseKeys(profile?.data || {}) }),
);

export const userIdSelector = createSelector(
  profileSelector,
  (profile) => profile?.data?.id,
);
