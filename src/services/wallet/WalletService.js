/* eslint-disable import/no-cycle */
import AccountModel from '@src/models/account';
import storage from '@src/services/storage';
import {
  ConfirmedTx as ConfirmedTxWallet,
  FailedTx as FailedTxWallet,
  genImageFromStr as genImageFromStrWallet,
  SuccessTx as SuccessTxWallet,
  Wallet,
  PrivacyVersion,
  setShardNumber,
} from 'incognito-chain-web-js/build/wallet';
import { randomBytes } from 'react-native-randombytes';
import { DEX } from '@utils/dex';
import accountService from '@services/wallet/accountService';
import { updateWalletAccounts } from '@services/api/masterKey';
import { getToken } from '@src/services/auth';
import { getPassphrase } from './passwordService';
import Server from './Server';

Wallet.RandomBytesFunc = randomBytes;
Wallet.setPrivacyUtilRandomBytesFunc(randomBytes);

export const genImageFromStr = genImageFromStrWallet;
export const ConfirmedTx = ConfirmedTxWallet;
export const SuccessTx = SuccessTxWallet;
export const FailedTx = FailedTxWallet;

export async function loadListAccount(wallet) {
  try {
    const listAccountRaw = (await wallet.listAccount()) || [];
    return listAccountRaw.map((account) => new AccountModel(account)) || [];
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

export async function loadWallet(passphrase, name = 'Wallet') {
  try {
    let wallet = new Wallet();
    wallet.Name = name;
    // TODO: mockup;
    const keyMeasureStorage = wallet.getKeyMeasureStorage();
    await wallet.clearWalletStorage({ key: keyMeasureStorage });
    await configsWallet(wallet);
    await wallet.loadWallet(passphrase, name);
    return wallet?.Name ? wallet : false;
  } catch (error) {
    console.log('ERROR WHEN LOAD WALLET', error);
  }
}

export async function configsWallet(wallet) {
  try {
    if (!wallet) {
      return;
    }
    const server = await Server.getDefault();
    wallet.RpcClient = server.address;
    wallet.RpcCoinService = server?.coinServices;
    wallet.Storage = storage;
    wallet.PrivacyVersion = PrivacyVersion.ver2;
    wallet.UseLegacyEncoding = true;
    wallet.PubsubService = server?.pubsubServices;
    wallet.RpcRequestService = server?.requestServices;
    wallet.AuthToken = await getToken();
    wallet.RpcApiService = server?.apiServices;
    if (typeof setShardNumber === 'function') {
      await setShardNumber(server?.shardNumber);
    }
  } catch (error) {
    console.log('CONFIGS_WALLET_ERROR', error);
    throw error;
  }
  return wallet;
}

export async function initWallet(walletName = 'Wallet') {
  try {
    const { aesKey } = await getPassphrase();
    let wallet = new Wallet();
    await configsWallet(wallet);
    await wallet.init(aesKey, storage, walletName, 'Anon');
    await wallet.save(aesKey);
    return wallet;
  } catch (e) {
    throw e;
  }
}

export async function saveWallet(wallet) {
  const { aesKey } = await getPassphrase();
  wallet.Storage = storage;
  wallet.save(aesKey);
}

export function deleteWallet(wallet) {
  wallet.Storage = storage;
  return wallet.deleteWallet();
}

export async function loadHistoryByAccount(wallet, accountName) {
  wallet.Storage = storage;
  await updateStatusHistory(wallet).catch(() =>
    console.warn('History statuses were not updated'),
  );
  return (await wallet.getHistoryByAccount(accountName)) || [];
}

export async function updateStatusHistory(wallet) {
  //TODO: remove
  await wallet.updateStatusHistory();
}

export async function updateHistoryStatus(wallet, txId) {
  //TODO: remove
  await wallet.updateTxStatus(txId);
}

export async function importWallet(mnemonic, name) {
  try {
    const { aesKey } = await getPassphrase();
    let wallet = new Wallet();
    await configsWallet(wallet);
    await wallet.import(mnemonic, aesKey, name, storage);
    return wallet;
  } catch (e) {
    throw e;
  }
}

export async function createDefaultAccounts(wallet) {
  let isCreatedNewAccount = false;

  let accounts = await wallet.listAccount();

  if (
    !accounts.find(
      (item) =>
        item.AccountName.toLowerCase() === DEX.MAIN_ACCOUNT.toLowerCase(),
    )
  ) {
    const newAccount = await accountService.createAccount(
      DEX.MAIN_ACCOUNT,
      wallet,
    );
    const newAccountInfo = await newAccount.getDeserializeInformation();
    isCreatedNewAccount = true;
    accounts.push(newAccountInfo);
  }
  if (
    !accounts.find(
      (item) =>
        item.AccountName.toLowerCase() === DEX.WITHDRAW_ACCOUNT.toLowerCase(),
    )
  ) {
    accounts = await wallet.listAccount();
    const newAccount = await accountService.createAccount(
      DEX.WITHDRAW_ACCOUNT,
      wallet,
    );
    const newAccountInfo = await newAccount.getDeserializeInformation();
    isCreatedNewAccount = true;
    accounts.push(newAccountInfo);
  }

  if (isCreatedNewAccount) {
    const masterAccountInfo = await wallet.MasterAccount.getDeserializeInformation();
    await updateWalletAccounts(
      masterAccountInfo.PublicKeyCheckEncode,
      accounts.map((item) => ({
        id: item.ID,
        name: item.AccountName,
      })),
    );
  }

  return isCreatedNewAccount;
}

export async function storeWalletAccountIdsOnAPI(wallet) {
  const listAccount = await wallet.listAccount();
  const accounts = listAccount.map((account) => ({
    name: account.AccountName,
    id: account.ID,
  }));
  const masterAccountInfo = await wallet.MasterAccount.getDeserializeInformation();
  return updateWalletAccounts(masterAccountInfo.PublicKeyCheckEncode, accounts);
}
