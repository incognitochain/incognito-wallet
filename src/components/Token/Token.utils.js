import includes from 'lodash/includes';
import toLower from 'lodash/toLower';

export const handleFilterTokenByKeySearch = ({ tokens, keySearch }) =>
  tokens.filter(
    (token) =>
      includes(toLower(token?.displayName), keySearch) ||
      includes(toLower(token?.name), keySearch) ||
      includes(toLower(token?.symbol), keySearch) ||
      includes(toLower(token?.pSymbol), keySearch) ||
      includes(toLower(token?.networkName), keySearch),
  );
