import {TRADING} from '@src/constants';
import TradingToken from '@models/tradingToken';
import TradingQuote from '@models/tradingQuote';
import http from '@services/http';

/**
 * Get all tradable tokens on 0x exchange
 * @returns {Promise<Array<TradingToken>>}
 */
export async function get0xTokens() {
  const data = await http.get('uniswap/list0xTokens');

  return data.map(item => new TradingToken({
    id: item.ID,
    address: item.ContractID,
    name: item.Name,
    symbol: item.Symbol,
    decimals: item.Decimals,
    pDecimals: item.PDecimals,
    protocol: TRADING.PROTOCOLS.OX,
  }));
}

/**
 * Get quote of a trading pair on 0x exchange
 * @param {Object<{
 *   sellToken: Object,
 *   sellAmount: String,
 *   buyToken: Object,
 *   slippagePercentage: String,
 * }>}
 * @returns {Promise<TradingQuote>}
 */
export async function get0xQuote({
  sellToken,
  sellAmount,
  buyToken,
  slippagePercentage,
}) {
  const url = generateQuoteURL({
    sellToken: sellToken.symbol,
    sellAmount,
    buyToken: buyToken.symbol,
    slippagePercentage,
  });

  const data = await http.get(url);
  return new TradingQuote({
    to: data.to,
    price: data.price,
    amount: data.buyAmount,
    data: data.data,
  });
}

/**
 * Get quote of a trading pair on 0x exchange
 * @param {Object<{
 *   sellToken: String,
 *   sellAmount: String,
 *   buyToken: String,
 *   slippagePercentage: String,
 * }>}
 * @returns {String}
 */
export function generateQuoteURL({
  sellToken,
  sellAmount,
  buyToken,
  slippagePercentage
}) {
  let url = `/uniswap/get0xRate?SrcTokenName=${sellToken}&DestTokenName=${buyToken}&Amount=${sellAmount}`;

  if (slippagePercentage) {
    url = `${url}&SlippageRate=${slippagePercentage}`;
  } else {
    url = `${url}&SlippageRate=${0.01}`;
  }

  return url;
}
