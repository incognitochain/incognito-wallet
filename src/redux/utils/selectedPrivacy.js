import isNaN from 'lodash/isNaN';

export const getPrice = ({ token, tokenUSDT }) => {
  const { pricePrv: priceOneUsdtByPrv } = tokenUSDT;
  const priceOnePrvToUsdt = 1 / priceOneUsdtByPrv;
  const defaultValue = {
    pricePrv: 0,
    change: '0',
  };
  if (!tokenUSDT || !priceOnePrvToUsdt) {
    return defaultValue;
  }
  if (token?.isMainCrypto) {
    return {
      change: '0',
      pricePrv: 1,
      priceUsd: priceOnePrvToUsdt || 0,
    };
  }
  const _pricePrv =
    Number(token?.pricePrv) !== 0
      ? token?.pricePrv
      : token?.priceUsd / priceOnePrvToUsdt;
  const _priceUsd =
    Number(token?.priceUsd) !== 0
      ? token?.priceUsd
      : _pricePrv * priceOnePrvToUsdt;
  return {
    change: token?.change || defaultValue.change,
    pricePrv:
      token?.pricePrv !== 0
        ? token?.pricePrv
        : isNaN(_pricePrv)
          ? 0
          : _pricePrv,
    priceUsd: _priceUsd,
  };
};
