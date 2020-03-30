import axios from 'axios';
import {CONSTANT_CONFIGS, TRADING} from '@src/constants';
import TradingToken from '@models/tradingToken';
import TradingQuote from '@models/tradingQuote';
import http from '@services/http';

const instance = axios.create({
  baseURL: CONSTANT_CONFIGS.OX_EXCHANGE_URL,
});

instance.interceptors.response.use(res => {
  const result = res?.data;

  return Promise.resolve(result);
}, errorData => {
  return Promise.reject(errorData?.response?.data);
});

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
 * @param {Object} sellToken The ERC20 token
 * @param {Number} sellAmount The amount of sellToken (in sellToken units) you want to send.
 * @param {Object} buyToken The ERC20 token
 * @returns {Promise<TradingQuote>}
 */
export async function get0xQuote({sellToken, sellAmount, buyToken}) {
  const url = `swap/v0/quote?sellToken=${sellToken.symbol}&buyToken=${buyToken.symbol}&sellAmount=${sellAmount}`;
  const data = await instance.get(url);
  return new TradingQuote({
    address: data.to,
    price: data.price,
    amount: data.buyAmount,
  });
}

/**
 * Get quote of a trading pair on 0x exchange
 * @param {String} sellToken The ERC20 token address or symbol of the token you want to send. "ETH" can be provided as a valid sellToken.
 * @param {Number} sellAmount The amount of sellToken (in sellToken units) you want to send.
 * @param {String} buyToken The ERC20 token address or symbol of the token you want to receive.
 * @returns {String}
 */
export function generateQuoteURL({sellToken, sellAmount, buyToken}) {
  return `${CONSTANT_CONFIGS.OX_EXCHANGE_URL}swap/v0/quote?sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${sellAmount}`;
}
