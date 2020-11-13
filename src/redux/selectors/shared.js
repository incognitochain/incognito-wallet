import { createSelector } from 'reselect';
import { CONSTANT_COMMONS } from '@src/constants';
import {
  pTokensSelector,
  internalTokensSelector,
  tokensFollowedSelector,
  isGettingBalance as isGettingBalanceToken,
} from '@src/redux/selectors/token';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { uniqBy, isNaN, compact, fromPairs } from 'lodash';
import convert from '@src/utils/convert';
import { BIG_COINS } from '@src/screens/DexV2/constants';
import { currencySelector } from '@screens/Setting';
import { defaultAccountName, defaultAccountBalanceSelector } from './account';
import { getPrivacyDataByTokenID } from './selectedPrivacy';

export const isGettingBalance = createSelector(
  isGettingBalanceToken,
  (state) => state?.account?.isGettingBalance,
  defaultAccountName,
  (tokens, accounts, defaultAccountName) => {
    const isLoadingAccountBalance = accounts?.includes(defaultAccountName);
    const result = [...tokens];
    return isLoadingAccountBalance
      ? [...result, CONSTANT_COMMONS.PRV.id]
      : result;
  },
);

export const availableTokensSelector = createSelector(
  pTokensSelector,
  internalTokensSelector,
  tokensFollowedSelector,
  selectedPrivacySeleclor.getPrivacyDataByTokenID,
  (pTokens, internalTokens, followedTokens, getPrivacyDataByTokenID) => {
    const followedTokenIds = followedTokens.map((t) => t?.id) || [];
    const allTokenIds = Object.keys(
      fromPairs([
        ...internalTokens?.map((t) => [t?.id]),
        ...pTokens?.map((t) => [t?.tokenId]),
      ]),
    );
    const tokens = [];
    allTokenIds?.forEach((tokenId) => {
      const token = getPrivacyDataByTokenID(tokenId);
      if (token?.name && token?.symbol && token.tokenId) {
        let _token = { ...token };
        if (followedTokenIds.includes(token.tokenId)) {
          _token.isFollowed = true;
        }
        tokens.push(_token);
      }
    });
    const excludeRPV = (token) => token?.tokenId !== CONSTANT_COMMONS.PRV.id;
    return uniqBy(tokens.filter(excludeRPV), 'tokenId') || [];
  },
);

export const pTokenSelector = createSelector(
  selectedPrivacySeleclor.getPrivacyDataByTokenID,
  currencySelector,
  (getPrivacyDataByTokenID, isToggleUSD) => {
    const decimalDigit = getPrivacyDataByTokenID(
      isToggleUSD ? BIG_COINS.USDT : BIG_COINS.PRV
    );
    return {
      pToken: decimalDigit,
      isToggleUSD
    };
  },
);

export const prefixCurrency = createSelector(
  currencySelector,
  (isToggleUSD) => {
    return isToggleUSD ?
      CONSTANT_COMMONS.USD_SPECIAL_SYMBOL:
      CONSTANT_COMMONS.PRV_SPECIAL_SYMBOL;
  },
);

export const totalShieldedTokensSelector = createSelector(
  availableTokensSelector,
  selectedPrivacySeleclor.getPrivacyDataByTokenID,
  defaultAccountBalanceSelector,
  tokensFollowedSelector,
  pTokenSelector,
  (availableTokens, getPrivacyDataByTokenID, accountBalance, followed, currency) => {
    const { isToggleUSD, pToken: decimalDigit } = currency;
    const tokens = followed.map((token) =>
      availableTokens.find(
        (t) => t?.tokenId === token?.id || t?.tokenId === token?.tokenId,
      ),
    );

    const prv = {
      ...getPrivacyDataByTokenID(CONSTANT_COMMONS.PRV.id),
      amount: accountBalance,
    };
    const totalShieldedTokens = compact([...tokens, prv]).reduce(
      (prevValue, currentValue) => {
        const totalShieldByPRV = prevValue.totalShieldByPRV;
        const totalShieldByUSD = prevValue.totalShieldByUSD;
        const pricePrv = currentValue?.pricePrv || 0;
        const priceUsd = currentValue?.priceUsd || 0;
        const humanAmount = convert.toHumanAmount(
          currentValue?.amount,
          currentValue?.pDecimals,
        );

        let _currentPrvValue = pricePrv * convert.toNumber(humanAmount);
        if (isNaN(_currentPrvValue)) {
          _currentPrvValue = 0;
        }

        let _currentUsdValue = priceUsd * convert.toNumber(humanAmount);
        if (isNaN(_currentUsdValue)) {
          _currentUsdValue = 0;
        }
        return {
          totalShieldByPRV: totalShieldByPRV + _currentPrvValue,
          totalShieldByUSD: totalShieldByUSD + _currentUsdValue
        };
      },
      {
        totalShieldByPRV: 0,
        totalShieldByUSD: 0
      },
    );

    const { totalShieldByPRV, totalShieldByUSD } = totalShieldedTokens;
    const totalShielded = isToggleUSD ? totalShieldByUSD : totalShieldByPRV;

    return convert.toOriginalAmount(
      totalShielded,
      decimalDigit?.pDecimals,
      true,
    );
  },
);

export const unFollowTokensSelector = createSelector(
  availableTokensSelector,
  (tokens) => tokens.filter((token) => !(token?.isFollowed === true)),
);

export default {
  isGettingBalance,
};
