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
import formatUtil from '@utils/format';
import {
  getStorageLoadWalletError,
  setStorageLoadWalletError
} from '@models/storageError';
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

export async function loadWallet(
  passphrase,
  name = 'Wallet',
  rootName = '',
  migratePassCodeToDefault = false //Turn off passcode encrypt wallet by default
) {
  try {
    let wallet = new Wallet();
    wallet.Name = name;
    wallet.RootName = rootName;
    await configsWallet(wallet);
    wallet = await wallet.loadWallet(passphrase, migratePassCodeToDefault);
    return wallet?.Name ? wallet : false;
  } catch (error) {
    const errors = await getStorageLoadWalletError();
    errors.push({
      time: formatUtil.formatDateTime(new Date().getTime()),
      name,
      rootName,
      error: JSON.stringify(error),
      function: 'LOAD_WALLET_WALLET_SERVICE'
    });
    await setStorageLoadWalletError(errors);
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
    wallet.PortalService = server?.portalServices;
    wallet.Network = server?.id;
    wallet.WebAppService = server?.webAppService;
    if (typeof setShardNumber === 'function') {
      await setShardNumber(server?.shardNumber);
    }
  } catch (error) {
    console.log('CONFIGS_WALLET_ERROR', error);
    throw error;
  }
  return wallet;
}

export async function initWallet(walletName = 'Wallet', rootName) {
  try {
    const { aesKey } = await getPassphrase();
    let wallet = new Wallet();
    wallet.RootName = rootName;
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
    console.time('TIME_GET_PASS_PHRASE');
    const { aesKey } = await getPassphrase();
    console.timeEnd('TIME_GET_PASS_PHRASE');
    let wallet = new Wallet();
    console.time('TIME_CONFIGS_WALLET');
    await configsWallet(wallet);
    console.timeEnd('TIME_CONFIGS_WALLET');
    console.time('TIME_IMPORT_WALLET');
    await wallet.import(mnemonic, aesKey, name, storage);
    console.timeEnd('TIME_IMPORT_WALLET');
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
