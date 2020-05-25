import { createSelector } from 'reselect';
import { CONSTANT_COMMONS } from '@src/constants';
import { fromPairs } from 'lodash';
import {
  pTokensSelector,
  internalTokensSelector,
  tokensFollowedSelector,
  isGettingBalance as isGettingBalanceToken,
} from '@src/redux/selectors/token';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import uniqBy from 'lodash/uniqBy';
import format from '@src/utils/format';
import isNaN from 'lodash/isNaN';
import {
  isGettingBalance as isGettingBalanceAccount,
  defaultAccountName,
} from './account';

export const isGettingBalance = createSelector(
  isGettingBalanceToken,
  isGettingBalanceAccount,
  defaultAccountName,
  (tokens, accounts, defaultAccountName) => {
    return [
      ...(accounts?.includes(defaultAccountName)
        ? [CONSTANT_COMMONS.PRV_TOKEN_ID]
        : []),
      ...tokens,
    ];
  },
);

export const availableTokensSelector = createSelector(
  pTokensSelector,
  internalTokensSelector,
  tokensFollowedSelector,
  selectedPrivacySeleclor.getPrivacyDataByTokenID,
  (pTokens, internalTokens, followedTokens, getPrivacyDataByTokenID) => {
    const followedTokenIds = followedTokens.map(t => t?.id) || [];
    const allTokenIds = Object.keys(
      fromPairs([
        ...internalTokens?.map(t => [t?.id]),
        ...pTokens?.map(t => [t?.tokenId]),
      ]),
    );
    const tokens = [];
    allTokenIds?.forEach(tokenId => {
      const token = getPrivacyDataByTokenID(tokenId);
      if (token?.name && token?.symbol && token.tokenId) {
        let _token = { ...token };
        if (followedTokenIds.includes(token.tokenId)) {
          _token.isFollowed = true;
        }
        tokens.push(_token);
      }
    });
    const excludeRPV = token => token?.tokenId !== CONSTANT_COMMONS.PRV.id;
    return uniqBy(tokens.filter(excludeRPV), 'tokenId') || [];
  },
);

export const totalShieldedTokensSelector = createSelector(
  availableTokensSelector,
  selectedPrivacySeleclor.getPrivacyDataByTokenID,
  (tokens, getPrivacyDataByTokenID) => {
    const prv = getPrivacyDataByTokenID(CONSTANT_COMMONS.PRV.id);
    const totalShieldedTokens = [...tokens, prv].reduce(
      (prevValue, currentValue) => {
        const _currentValue =
          currentValue?.pricePrv *
          format.amountFull(currentValue?.amount, currentValue?.pDecimals);
        return prevValue + isNaN(_currentValue) ? 0 : _currentValue;
      },
      0,
    );
    return totalShieldedTokens;
  },
);

export const unFollowTokensSelector = createSelector(
  availableTokensSelector,
  tokens => tokens.filter(token => !(token?.isFollowed === true)),
);

export default {
  isGettingBalance,
};
