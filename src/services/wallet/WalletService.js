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
} from 'incognito-chain-web-js/build/wallet';
import { randomBytes } from 'react-native-randombytes';
import { DEX } from '@utils/dex';
import accountService from '@services/wallet/accountService';
import { updateWalletAccounts } from '@services/api/masterKey';
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
  let wallet = new Wallet();
  const server = await Server.getDefault();
  wallet.RpcClient = server.address;
  wallet.RpcCoinService = server?.coinServices;
  wallet.Name = name;
  wallet.Storage = storage;
  wallet.PrivacyVersion = PrivacyVersion.ver2;
  wallet.UseLegacyEncoding = true;
  await wallet.loadWallet(passphrase, name);
  await saveWallet(wallet);
  return wallet?.Name ? wallet : false;
}

export async function initWallet(walletName = 'Wallet') {
  try {
    const passphrase = await getPassphrase();
    const wallet = new Wallet();
    wallet.Storage = storage;
    await wallet.init(passphrase, storage, walletName, 'Anon');
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
  await updateStatusHistory(wallet).catch(() =>
    console.warn('History statuses were not updated'),
  );
  return (await wallet.getHistoryByAccount(accountName)) || [];
}

export async function updateStatusHistory(wallet) {
  await wallet.updateStatusHistory();
  await saveWallet(wallet);
  // wallet.save(await getPassphrase());
}

export function clearCache(wallet) {
  wallet.clearCached(storage);
}

export async function updateHistoryStatus(wallet, txId) {
  await wallet.updateTxStatus(txId);
  await saveWallet(wallet);
}

export async function importWallet(mnemonic, name) {
  try {
    const passphrase = await getPassphrase();
    const wallet = new Wallet();
    wallet.Storage = storage;
    await wallet.import(mnemonic, passphrase, name, storage);
    await wallet.save(passphrase);
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
  const accounts = [];

  for (const account of wallet.MasterAccount.child) {
    const info = await account.getDeserializeInformation();
    accounts.push({
      name: info.AccountName,
      id: info.ID,
    });
  }

  const masterAccountInfo = await wallet.MasterAccount.getDeserializeInformation();
  return updateWalletAccounts(masterAccountInfo.PublicKeyCheckEncode, accounts);
}
