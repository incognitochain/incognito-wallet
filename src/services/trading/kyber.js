import {CONSTANT_COMMONS, CONSTANT_CONFIGS, TRADING} from '@src/constants';
import TradingToken from '@models/tradingToken';
import TradingQuote from '@models/tradingQuote';
import http from '@services/http';
import BigNumber from 'bignumber.js';
import formatUtils from '@utils/format';

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
  const {ExpectedRate} = data;

  return new TradingQuote({
    price: formatUtils.amountFull(BigNumber(ExpectedRate)
      .dividedBy(BigNumber(10).pow(sellToken.decimals))
      .multipliedBy(BigNumber(10).pow(sellToken.pDecimals))
      .dividedToIntegerBy(1)
      .toNumber(), sellToken.pDecimals
    ),
    amount: BigNumber(ExpectedRate)
      .multipliedBy(
        BigNumber(sellAmount)
          .dividedBy(BigNumber(10).pow(sellToken.decimals))
      )
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
