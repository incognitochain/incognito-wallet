import http from '@src/services/http';
import { PoolConfigModel, PoolHistory, UserCoinPoolModel } from '@models/pool';
import { cachePromise, KEYS } from '@services/cache';

export async function getPoolConfigNoCache() {
  return http.get('pool/staker/configs')
    .then(data => new PoolConfigModel(data));
}

export async function getPoolConfig() {
  return cachePromise(KEYS.PoolConfig, getPoolConfigNoCache, 60000);
}

export const getUserPoolDataNoCache = (paymentAddress, coins) => () => {
  const url = `/pool/staker/balance-info?p_stake_address=${paymentAddress}`;
  return http.get(url)
    .then(data => data.map(item => new UserCoinPoolModel(item, coins)));
};

export async function getUserPoolData(paymentAddress, coins) {
  return cachePromise(KEYS.PoolUserData(paymentAddress), getUserPoolDataNoCache(paymentAddress, coins), 5000);
}

export async function provide(paymentAddress, tx, signPublicKeyEncode, amount) {
  const url = '/pool/staker/create-stake';
  return http.post(url, {
    'IncognitoTx': tx,
    'PStakeAddress': paymentAddress,
    'SignPublicKeyEncode': signPublicKeyEncode,
    'Amount': amount
  });
}


export async function withdrawReward(paymentAddress, signEncode) {
  const url = '/pool/staker/withdraw-reward';
  return http.post(url, {
    'PStakeAddress': paymentAddress,
    'SignEncode': signEncode,
    'PaymentAddress': paymentAddress,
    'Amount': 0,
  });
}

export async function withdrawProvision(paymentAddress, signEncode, amount, tokenId) {
  const url = '/pool/staker/create-unstake';
  return http.post(url, {
    'PStakeAddress': paymentAddress,
    'SignEncode': signEncode,
    'Amount': amount,
    'TokenID': tokenId,
  });
}

export async function getHistories(account, page, limit, coins) {
  const url = `/pool/staker/history?p_stake_address=${account.PaymentAddress}&page=${page}&limit=${limit}&type=1,2,6`;
  return http.get(url)
    .then(data => ({
      items: data.Items.map(item => new PoolHistory(item, account, coins)),
      total: data.Total,
    }));
}
