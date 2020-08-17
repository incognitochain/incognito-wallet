import _ from 'lodash';
import { get0xQuote } from '@services/trading/0x';
import { CONSTANT_COMMONS, CONSTANT_CONFIGS, TRADING } from '@src/constants';
import http from '@src/services/http';
import { getKyberQuote, getKyberTokens } from '@services/trading/kyber';
import BigNumber from 'bignumber.js';
import convertUtils from '@utils/convert';
import UniswapRequest from '@models/uniswapRequest';
import tokenService from '@services/wallet/tokenService';
import { cachePromise, KEYS } from '@services/cache';

const { PROTOCOLS, setDAppAddresses } = TRADING;

/**
 * Get all tradable tokens of multiple exchanges
 * @returns {Promise<Array<TradingToken>>}
 */
export async function getAllTradingTokens() {
  const allArrays = await Promise.all([
    getKyberTokens(),
  ]);

  let tokens = _.flatten(allArrays);

  tokens = _(tokens)
    .map(item => _.mergeWith(
      item,
      tokens.find(anotherToken => anotherToken !== item && anotherToken.id === item.id)
    ), item => item.protocol)
    .uniqBy(item => item.id)
    .map(item => ({
      ...item,
      protocol: _.castArray(item.protocol),
    }))
    .orderBy(item => _.toLower(item.symbol))
    .value();

  return [{
    id: CONSTANT_CONFIGS.ETH_TOKEN_ID,
    address: '0x0000000000000000000000000000000000000000',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    pDecimals: 9,
    protocol: [TRADING.PROTOCOLS.OX, TRADING.PROTOCOLS.KYBER],
  }].concat(tokens);
}

/**
 * Get quote of a trading pair
 * @param {TradingToken} sellToken The ERC20 token address or symbol of the token you want to send. "ETH" can be provided as a valid sellToken.
 * @param {Number} sellAmount The amount of sellToken (in sellToken units) you want to send.
 * @param {TradingToken} buyToken The ERC20 token address or symbol of the token you want to receive.
 * @param {String} protocol protocol type (0x, Kyber)
 * @returns {Promise<TradingQuote>}
 */
export async function getQuote({buyToken, sellToken, sellAmount, protocol}) {
  const supportedProtocols = {
    [PROTOCOLS.OX]: get0xQuote,
    [PROTOCOLS.KYBER]: getKyberQuote,
  };

  const originalSellAmount = convertUtils.toDecimals(sellAmount, sellToken);

  const quote = await supportedProtocols[protocol]({
    buyToken,
    sellToken,
    sellAmount: originalSellAmount,
  });

  quote.amount = BigNumber(quote.amount)
    .dividedBy(BigNumber(10).pow(buyToken.decimals))
    .multipliedBy(BigNumber(10).pow(buyToken.pDecimals))
    .dividedToIntegerBy(1)
    .toNumber();

  quote.minimumAmount = BigNumber(quote.minimumAmount)
    .dividedBy(BigNumber(10).pow(buyToken.decimals))
    .multipliedBy(BigNumber(10).pow(buyToken.pDecimals))
    .dividedToIntegerBy(1)
    .toNumber();

  return quote;
}

function getDAppAddressesNoCache() {
  const url = '/uniswap/dapp-address';
  return http.get(url);
}

export async function getDAppAddresses() {
  const data = await cachePromise(KEYS.DAppAddress, getDAppAddressesNoCache, 600000);
  const config = {};

  data.forEach(item => config[item.DappName] = item.ContractId);
  setDAppAddresses(config);
}

export async function getUniswapBalance(scAddress, token) {
  const url = `/uniswap/getDepositedBalance?Address=${scAddress}&Token=${token.address}`;
  const res = await http.get(url);
  const data = res.DepositedBalance;

  return BigNumber(data)
    .dividedBy(BigNumber(10).pow(token.decimals))
    .multipliedBy(BigNumber(10).pow(token.pDecimals))
    .dividedToIntegerBy(1)
    .toNumber();
}

/**
 * Withdraw balance
 * @param {String} timestamp
 * @param {String} icAddress Incognito wallet address
 * @param {String} signBytes
 * @param {String} sourceTokenAmount Token amount
 * @param {String} sourceTokenAddress Token contract address
 * @param {String} destTokenAddress Token contract address
 * @param {String} tokenId Token id
 * @returns {Promise<*>}
 */
export async function withdrawSmartContract({
  timestamp,
  icAddress,
  signBytes,
  sourceTokenAmount,
  sourceTokenAddress,
  tokenId,
}) {
  const url = '/uniswap/requestWithdraw';
  return http.post(url, {
    'Timestamp': timestamp,
    'WalletAddress': icAddress,
    'SignBytes': signBytes,
    'SrcQties': sourceTokenAmount,
    'SrcTokens': sourceTokenAddress,
    'PrivacyTokenAddress': tokenId,
  });
}


/**
 * Execute trading
 * @param {String} timestamp
 * @param {String} icAddress Incognito wallet address
 * @param {String} signBytes
 * @param {String} sourceTokenAmount Token amount
 * @param {String} sourceTokenAddress Token contract address
 * @param {String} destTokenAddress Token contract address
 * @param {String} tokenId Token id
 * @param {String} dAppAddress Smart contract address
 * @param {String} input
 * @returns {Promise<*>}
 */
export async function execute({
  timestamp,
  icAddress,
  signBytes,
  sourceTokenAmount,
  sourceTokenAddress,
  destTokenAddress,
  tokenId,
  dAppAddress,
  input,
}) {
  const url = '/uniswap/execute';
  return http.post(url, {
    'Timestamp': timestamp,
    'WalletAddress': icAddress,
    'SignBytes': signBytes,
    'SrcQties': sourceTokenAmount,
    'SrcTokens': sourceTokenAddress,
    'DestTokens': destTokenAddress,
    'PrivacyTokenAddress': tokenId,
    'DappAddress': dAppAddress,
    'Input': input,
  });
}

/**
 * Execute trading
 * @param {String} timestamp
 * @param {String} signBytes
 * @param {String} dAppAddress Smart contract address
 * @param {String} input
 * @returns {Promise<String>}
 */
export async function execute0x({
  timestamp,
  signBytes,
  dAppAddress,
  input,
}) {
  const url = '/uniswap/execute0x';
  return http.post(url, {
    'Timestamp': timestamp,
    'SignBytes': signBytes,
    'DappAddress': dAppAddress,
    'Input': input,
  });
}

export async function getRequest(id) {
  const res = await http.get(`uniswap/getUniswapById?id=${id}`);

  return new UniswapRequest(res);
}

export const submitBurnProof = ({
  paymentAddress,
  walletAddress,
  tokenId,
  burningTxId,
}) => {
  return http.post('uniswap/submitBurnProof', {
    PaymentAddress: paymentAddress,
    PrivacyTokenAddress: tokenId,
    IncognitoTx: burningTxId,
    WalletAddress: walletAddress ?? paymentAddress,
  });
};

export const depositToSmartContract = async ({
  token,
  amount,
  prvFee = 0,
  tokenFee = 0,
  wallet,
  dexMainAccount,
  scAddress
}) => {
  const tokenObject = {
    Privacy: true,
    TokenID: token.id,
    TokenName: '',
    TokenSymbol: '',
    TokenTxType: CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND,
    TokenAmount: amount,
    Amount: amount,
    TokenReceivers: {
      PaymentAddress: dexMainAccount.PaymentAddress,
      Amount: amount
    }
  };

  return await tokenService.depositToSmartContract(
    tokenObject,
    prvFee,
    tokenFee,
    scAddress,
    dexMainAccount,
    wallet,
  );
};

/**
 * Airdrop using for test
 * @param address
 * @returns *
 */
export const airdrop = async (address) => {
  return http.post('uniswap/airdrop', {
    DestTokens: address,
  });
};
