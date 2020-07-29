import http from '@src/services/http';
import { DepositResponse, PDexTradeHistoryModel, RewardModel } from '@models/pDefi';
import { cachePromise } from '@services/cache';
import { TRADING } from '@src/constants';

export const getRewards = (paymentAddress) => {
  return http.get(`auth/liquidity-reward?wallet=${paymentAddress}`)
    .then(data => data.List.map(item => new RewardModel(item)));
};

export const deposit = ({
  tokenId,
  amount,
  networkFee,
  networkFeeTokenId,
  receiverAddress,
}) => {
  return http.post('pdefi/request-deposit', {
    'TokenID': tokenId,
    'Amount': Math.floor(amount),
    'NetworkFee': Math.floor(networkFee),
    'NetworkFeeTokenID': networkFeeTokenId,
    'ReceiverAddress': receiverAddress
  }).then(data => new DepositResponse(data));
};

export const trade = ({
  depositId,
  tradingFee,
  buyTokenId,
  buyAmount,
  minimumAmount,
  buyExpectedAmount,
}) => {
  return http.post('pdefi/request-pdex-trade', {
    'DepositID': depositId,
    'TradingFee': Math.floor(tradingFee),
    'BuyTokenID': buyTokenId,
    'BuyAmount': Math.floor(buyAmount),
    'MinimumAmount': Math.floor(minimumAmount),
    'BuyExpectedAmount': Math.floor(buyExpectedAmount),
  });
};

const getHistoriesNoCache = (accounts, tokens, page = 1, limit = 10) => () => {
  return http.post('pdefi/history-pdex-trade', {
    Page: page,
    Limit: limit,
    Wallets: accounts.map(item => item.PaymentAddress).join(','),
  }).then(data => data?.Data ? data.Data.map(item => new PDexTradeHistoryModel(item, tokens, accounts)) : []);
};

export const getHistories = (accounts, tokens, page = 1, limit = 10) => {
  return cachePromise(`history-pdex-trade-${page}`, getHistoriesNoCache(accounts, tokens, page, limit), 15000);
};

export const tradePKyber = ({
  depositId,
  sellTokenAddress,
  sellAmount,
  buyTokenAddress,
  expectAmount,
}) => {
  return http.post('/uniswap/execute', {
    'SrcTokens': sellTokenAddress,
    'SrcQties': sellAmount,
    'DestTokens': buyTokenAddress,
    'DappAddress': TRADING.KYBER_TRADE_ADDRESS,
    'DepositId': depositId,
    'ExpectAmount': expectAmount,
  });
};

export const submitChargeFeeTx = ({
  feeTxId,
  depositId,
}) => {
  return http.post('uniswap/execute', {
    ID: depositId,
    ChargeFeesTx: feeTxId,
  });
};
