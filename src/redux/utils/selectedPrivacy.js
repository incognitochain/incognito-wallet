import isNaN from 'lodash/isNaN';

export const getPrice = ({ token, tokenUSDT }) => {
  const { pricePrv } = tokenUSDT;
  const defaultValue = {
    pricePrv: 0.5,
    change: '0',
  };
  if (!tokenUSDT || !pricePrv) {
    return defaultValue;
  }
  if (token?.isMainCrypto) {
    return {
      change: '0',
      pricePrv: 1,
    };
  }
  const _pricePrv = token?.priceUsd / pricePrv;
  return {
    change: token?.change || defaultValue.change,
    pricePrv:
      token?.pricePrv !== 0
        ? token?.pricePrv
        : isNaN(_pricePrv)
          ? 0
          : _pricePrv,
  };
};
