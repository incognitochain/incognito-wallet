import { createSelector } from 'reselect';

export const followed = (state) => state?.token?.followed || [];
export const isGettingBalance = (state) => state?.token?.isGettingBalance || [];
export const pTokens = (state) => state?.token?.pTokens || [];
export const internalTokens = (state) => state?.token?.internalTokens || [];
export const tokensFollowedSelector = createSelector(
  followed,
  (tokens) => tokens,
);
export const pTokensSelector = createSelector(
  (state) => state?.token?.pTokens,
  (pTokens) => pTokens || [],
);

export const internalTokensSelector = createSelector(
  (state) => state?.token?.internalTokens,
  (internalTokens) => internalTokens || [],
);

export const historyTokenSelector = createSelector(
  (state) => state?.token?.history,
  (history) => history,
);

export const followingTokenSelector = createSelector(
  (state) => state?.token?.following,
  (following) => (tokenId) => following.includes(tokenId),
);

export const isTokenFollowedSelector = createSelector(
  tokensFollowedSelector,
  (tokens) => (tokenId) => tokens.find((token) => token?.id === tokenId),
);

export const toggleVerifiedTokensSelector = createSelector(
  (state) => state?.token?.toggleVerified,
  (toggleVerified) => toggleVerified,
);

export default {
  followed,
  isGettingBalance,
  pTokens,
  internalTokens,
  tokensFollowedSelector,
  pTokensSelector,
  internalTokensSelector,
  historyTokenSelector,
  followingTokenSelector,
  isTokenFollowedSelector,
  toggleVerifiedTokensSelector,
};
