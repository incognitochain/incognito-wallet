import {CONSTANT_COMMONS, TRADING} from '@src/constants';
import TradingToken from '@models/tradingToken';
import TradingQuote from '@models/tradingQuote';
import http from '@services/http';
import BigNumber from 'bignumber.js';

/**
 * Get all tradable tokens on Kyber exchange
 * @returns {Promise<Array<TradingToken>>}
 */
export async function getKyberTokens() {
  const data = await http.get('uniswap/listKyberTokens');

  return data.map(item => new TradingToken({
    id: item.ID,
    address: item.ContractID,
    name: item.Name,
    symbol: item.Symbol,
    decimals: item.Decimals,
    pDecimals: item.PDecimals,
    protocol: TRADING.PROTOCOLS.KYBER,
  }));
}

/**
 * Get quote of a trading pair on Kyber exchange
 * @param {Object} sellToken
 * @param {Number} sellAmount The amount of sellToken (in sellToken units) you want to send.
 * @param {Object} buyToken
 * @returns {Promise<TradingQuote>}
 */
export async function getKyberQuote({sellToken, sellAmount, buyToken}) {
  let sellAddress = sellToken.address;
  let buyAddress = buyToken.address;

  if (sellToken.symbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH) {
    sellAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  }

  if (buyToken.symbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH) {
    buyAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  }

  const url = `uniswap/getKyberRate?SrcToken=${sellAddress}&DestToken=${buyAddress}&Amount=${sellAmount}`;
  const data = await http.get(url);
  const {ExpectedRate, SlippageRate} = data;

  const originalSellAmount = BigNumber(sellAmount)
    .dividedBy(BigNumber(10).pow(sellToken.decimals));
  const originalPrice = BigNumber(ExpectedRate)
    .dividedBy(BigNumber(10).pow(18));
  const amount = BigNumber(originalPrice)
    .multipliedBy(originalSellAmount)
    .multipliedBy(BigNumber(10).pow(buyToken.decimals));

  const maxPrice = BigNumber(SlippageRate)
    .dividedBy(BigNumber(10).pow(18));
  const minimumAmount = BigNumber(maxPrice)
    .multipliedBy(originalSellAmount)
    .multipliedBy(BigNumber(10).pow(buyToken.decimals));

  return new TradingQuote({
    price: originalPrice.toString(),
    amount,
    minimumAmount,
    maxPrice,
    expectedRate: ExpectedRate,
  });
}
