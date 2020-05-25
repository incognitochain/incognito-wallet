import includes from 'lodash/includes';
import lowerCase from 'lodash/lowerCase';

export const handleFilterTokenByKeySearch = ({ tokens, keySearch }) =>
  tokens.filter(
    token =>
      includes(lowerCase(token?.displayName), keySearch) ||
      includes(lowerCase(token?.name), keySearch) ||
      includes(lowerCase(token?.symbol), keySearch) ||
      includes(lowerCase(token?.pSymbol), keySearch) ||
      includes(lowerCase(token?.networkName), keySearch),
  );
