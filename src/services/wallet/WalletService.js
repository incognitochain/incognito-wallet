/* eslint-disable import/no-cycle */
import AccountModel from '@src/models/account';
import storage from '@src/services/storage';
import {
  ConfirmedTx as ConfirmedTxWallet,
  FailedTx as FailedTxWallet,
  genImageFromStr as genImageFromStrWallet,
  RpcClient,
  SuccessTx as SuccessTxWallet,
  Wallet
} from 'incognito-chain-web-js/build/wallet';
import {randomBytes} from 'react-native-randombytes';
import {getPassphrase} from './passwordService';
import {getMaxShardNumber} from './RpcClientService';
import Server from './Server';

const numOfAccount = 1;
const walletName = 'wallet1';

export const genImageFromStr = genImageFromStrWallet;
export const ConfirmedTx = ConfirmedTxWallet;
export const SuccessTx = SuccessTxWallet;
export const FailedTx = FailedTxWallet;

export async function loadListAccount(wallet) {
  try {
    const listAccountRaw = (await wallet.listAccount()) || [];
    return listAccountRaw.map(account => new AccountModel(account)) || [];
  } catch (e) {
    throw e;
  }
}

/**
 *
 * @param {object} wallet
 * @returns [{{string} AccountName, {string} BLSPublicKey, {int} Index}]
 */
export async function loadListAccountWithBLSPubKey(wallet) {
  try {
    const listAccountRaw = (await wallet.listAccountWithBLSPubKey()) || [];
    // const listAccount =
    //   listAccountRaw.map(account => new AccountModel(account)) || [];

    return listAccountRaw;
  } catch (e) {
    throw e;
  }
}


export async function loadWallet(passphrase) {
  const server = await Server.getDefault();
  // console.log('[loadWallet] with server ', server);
  Wallet.RandomBytesFunc = randomBytes;
  Wallet.setPrivacyUtilRandomBytesFunc(randomBytes);
  // console.log('set randombyte done');
  Wallet.RpcClient = new RpcClient(
    server.address,
    server.username,
    server.password
  );

  Wallet.ShardNumber = 8;

  const wallet = new Wallet();
  wallet.Storage = storage;

  await wallet.loadWallet(passphrase);

  const accounts = wallet.MasterAccount.child;
  for (const account of accounts) {
    try {
      await account.loadAccountCached(storage);
    } catch (e) {
      console.debug('LOAD ACCOUNTS CACHE ERROR', e);
      await account.clearCached();
      await account.saveAccountCached(storage);
    }
  }
  return wallet?.Name ? wallet : false;
}

export async function initWallet() {
  try {
    const passphrase = await getPassphrase();
    const wallet = new Wallet();
    wallet.Storage = storage;
    wallet.init(passphrase, storage, walletName, 'Anon');
    await wallet.save(passphrase);
    return wallet;
  } catch (e) {
    throw e;
  }
}

export async function saveWallet(wallet) {
  wallet.Storage = storage;
  wallet.save(await getPassphrase());
}

export function deleteWallet(wallet) {
  wallet.Storage = storage;
  return wallet.deleteWallet();
}

export async function loadHistoryByAccount(wallet, accountName) {
  wallet.Storage = storage;
  await updateStatusHistory(wallet).catch(() => console.warn('History statuses were not updated'));
  return (await wallet.getHistoryByAccount(accountName)) || [];
}

export async function updateStatusHistory(wallet) {
  await wallet.updateStatusHistory();
  await saveWallet(wallet);
  // wallet.save(await getPassphrase());
}

export function clearCache(wallet) {
  wallet.clearCached();
}
