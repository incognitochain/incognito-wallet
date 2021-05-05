import LocalDatabase from '@utils/LocalDatabase';
import types from '@src/redux/types/masterKey';
// eslint-disable-next-line import/no-cycle
import MasterKeyModel from '@models/masterKey';
import storage from '@src/services/storage';
// eslint-disable-next-line import/no-cycle
import {
  importWallet,
  saveWallet,
  storeWalletAccountIdsOnAPI,
} from '@services/wallet/WalletService';
// eslint-disable-next-line import/no-cycle
import { reloadWallet } from '@src/redux/actions/wallet';
import { getWalletAccounts } from '@services/api/masterKey';
// eslint-disable-next-line import/no-cycle
import {
  reloadAccountFollowingToken,
  reloadBalance,
} from '@src/redux/actions/account';
import { pTokensSelector } from '@src/redux/selectors/token';
import {
  masterKeysSelector,
  masterlessKeyChainSelector,
  noMasterLessSelector,
} from '@src/redux/selectors/masterKey';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import _ from 'lodash';
import { clearWalletCaches } from '@services/cache';
import accountService from '@services/wallet/accountService';

const DEFAULT_MASTER_KEY = new MasterKeyModel({
  name: 'Wallet',
  isActive: true,
});

const MASTERLESS = new MasterKeyModel({
  name: 'Masterless',
  isActive: false,
});

const updateNetwork = async () => {
  const serverJSONString = await storage.getItem('$servers');
  const servers = JSON.parse(serverJSONString || '[]');
  const currentServer = servers.find((item) => item.default) || {
    id: 'mainnet',
  };
  const isMainnet = currentServer.id === 'mainnet';
  MasterKeyModel.network = isMainnet ? 'mainnet' : 'testnet';
};

const migrateData = async () => {
  let isMigratedData = false;
  const data = await storage.getItem('Wallet');

  if (data) {
    await storage.setItem(`$${MasterKeyModel.network}-master-masterless`, data);
    // await storage.removeItem('Wallet');
    isMigratedData = true;
  }

  const dexHistories = await LocalDatabase.getOldDexHistory();
  if (dexHistories.length > 0) {
    await storage.setItem(
      `$${MasterKeyModel.network}-master-masterless-dex-histories`,
      JSON.stringify(dexHistories),
    );
    isMigratedData = true;
  }

  return isMigratedData;
};

const initMasterKeySuccess = (data) => ({
  type: types.INIT,
  payload: data,
});

const followDefaultTokens = async (account, pTokenList, wallet) => {
  try {
    const pTokens = pTokenList;
    const defaultTokens = [];
    pTokens?.forEach((token) => {
      if (token.default) {
        defaultTokens.push(token.convertToToken());
      }
    });
    if (defaultTokens.length > 0) {
      await accountService.addFollowingTokens(defaultTokens, account, wallet);
    }
  } catch (e) {
    throw e;
  }
};

const followDefaultTokenForWallet = (wallet, accounts) => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const pTokens = pTokensSelector(state);

  if (!accounts || !accounts.length) {
    for (const account of wallet.MasterAccount.child) {
      await followDefaultTokens(account, pTokens, wallet);
    }
  } else {
    for (const account of accounts) {
      await followDefaultTokens(account, pTokens, wallet);
    }
  }
};

export const initMasterKey = (masterKeyName, mnemonic) => async (dispatch) => {
  await updateNetwork();
  const isMigrated = await migrateData();

  const defaultMasterKey = new MasterKeyModel(DEFAULT_MASTER_KEY);
  const masterlessMasterKey = new MasterKeyModel(MASTERLESS);
  const masterlessWallet = await masterlessMasterKey.loadWallet();

  if (!isMigrated) {
    masterlessWallet.MasterAccount.child = [];
  }

  defaultMasterKey.name = masterKeyName;
  const wallet = await importWallet(
    mnemonic,
    defaultMasterKey.getStorageName(),
  );
  await syncServerAccounts(wallet);

  defaultMasterKey.mnemonic = wallet.Mnemonic;
  defaultMasterKey.wallet = wallet;

  await saveWallet(wallet);
  await saveWallet(masterlessWallet);

  const masterKeys = [defaultMasterKey, masterlessMasterKey];

  await storeWalletAccountIdsOnAPI(wallet);
  await dispatch(initMasterKeySuccess(masterKeys));

  await dispatch(switchMasterKey(defaultMasterKey.name));
  await dispatch(followDefaultTokenForWallet(wallet));

  await saveWallet(wallet);
  await saveWallet(masterlessWallet);
};

const loadAllMasterKeysSuccess = (data) => ({
  type: types.LOAD_ALL,
  payload: data,
});

export const loadAllMasterKeys = () => async (dispatch) => {
  await updateNetwork();

  let masterKeyList = _.uniqBy(
    await LocalDatabase.getMasterKeyList(),
    (item) => item.name,
  ).map((item) => new MasterKeyModel(item));

  for (let key of masterKeyList) {
    await key.loadWallet();
    if (key.name.toLowerCase() === 'masterless') {
      continue;
    }
    const wallet = key.wallet;
    console.log(
      '\n\nKEY SET ACCOUNT [0] aaaaa',
      wallet.MasterAccount.child[0].key.KeySet,
    );
    let masterAccountInfo = await wallet.MasterAccount.getDeserializeInformation();
    console.debug('masterAccountInfo', masterAccountInfo);
    const serverAccounts = await getWalletAccounts(
      masterAccountInfo.PublicKeyCheckEncode,
    );
    const accountIds = [];
    for (const account of wallet.MasterAccount.child) {
      const accountInfo = await account.getDeserializeInformation();
      accountIds.push(accountInfo.ID);
    }
    const newAccounts = serverAccounts.filter(
      (item) =>
        !accountIds.includes(item.id) &&
        !(key.deletedAccountIds || []).includes(item.id),
    );

    if (newAccounts.length > 0) {
      const newCreatedAccounts = [];
      for (const account of newAccounts) {
        try {
          const newAccount = await wallet.importAccountWithId(
            account.id,
            account.name,
          );
          newCreatedAccounts.push(newAccount);
        } catch {
          //
        }
      }
      await dispatch(followDefaultTokenForWallet(wallet, newCreatedAccounts));
      await wallet.save();
    }
  }

  await dispatch(loadAllMasterKeysSuccess(masterKeyList));
};

const switchMasterKeySuccess = (data) => ({
  type: types.SWITCH,
  payload: data,
});

export const switchMasterKey = (masterKeyName, accountName) => async (
  dispatch,
) => {
  clearWalletCaches();
  await dispatch(switchMasterKeySuccess(masterKeyName));
  await dispatch(reloadWallet(accountName));
};

const createMasterKeySuccess = (newMasterKey) => ({
  type: types.CREATE,
  payload: newMasterKey,
});

export const createMasterKey = (data) => async (dispatch) => {
  const newMasterKey = new MasterKeyModel({
    ...data,
  });
  const wallet = await importWallet(
    data.mnemonic,
    newMasterKey.getStorageName(),
  );
  await saveWallet(wallet);

  newMasterKey.wallet = wallet;
  newMasterKey.mnemonic = wallet.Mnemonic;

  await dispatch(createMasterKeySuccess(newMasterKey));
  await dispatch(switchMasterKey(data.name));

  await dispatch(followDefaultTokenForWallet(wallet));

  await wallet.save();
  await storeWalletAccountIdsOnAPI(wallet);
  await dispatch(reloadWallet());
};

const importMasterKeySuccess = (newMasterKey) => ({
  type: types.IMPORT,
  payload: newMasterKey,
});

const syncServerAccounts = async (wallet) => {
  const masterAccountInfo = await wallet.MasterAccount.getDeserializeInformation();
  const accounts = await getWalletAccounts(
    masterAccountInfo.PublicKeyCheckEncode,
  );

  if (accounts.length > 0) {
    wallet.MasterAccount.child = [];
    for (const account of accounts) {
      try {
        await wallet.importAccountWithId(account.id, account.name);
      } catch {
        //
      }
    }
  }
};

const syncUnlinkWithNewMasterKey = (newMasterKey) => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const masterless = masterlessKeyChainSelector(state);
  const accounts = await masterless.getAccounts();

  const masterLessWallet = masterless.wallet;
  const wallet = newMasterKey.wallet;

  for (const account of accounts) {
    const findItemWithKey = (item) =>
      item.getPrivateKey() === account.PrivateKey;

    const isCreated = await wallet.hasCreatedAccount(account.PrivateKey);
    if (isCreated) {
      const masterAccountIndex = wallet.MasterAccount.child.findIndex(
        findItemWithKey,
      );
      const masterlessAccount = masterLessWallet.MasterAccount.child.find(
        findItemWithKey,
      );

      masterLessWallet.MasterAccount.child = masterLessWallet.MasterAccount.child.filter(
        (item) => !findItemWithKey(item),
      );

      if (masterAccountIndex > -1) {
        const masterAccount = wallet.MasterAccount.child[masterAccountIndex];
        masterlessAccount.name = masterAccount.name;
        wallet.MasterAccount.child[masterAccountIndex] = masterlessAccount;
      } else {
        wallet.MasterAccount.child.push(masterlessAccount);
      }

      // Found duplicate account name
      if (wallet.MasterAccount.child.filter(findItemWithKey).length > 1) {
        const isDuplicatedNameAccount = wallet.MasterAccount.child.find(
          findItemWithKey,
        );
        if (isDuplicatedNameAccount) {
          let index = 1;
          let newName = isDuplicatedNameAccount.name + index;
          while (
            wallet.MasterAccount.child.find((item) => item.name === newName)
          ) {
            index++;
            newName = isDuplicatedNameAccount.name + index;
          }

          isDuplicatedNameAccount.name = newName;
        }
      }
    }
  }

  await saveWallet(masterLessWallet);
  await dispatch(updateMasterKey(masterless));
};

export const importMasterKey = (data) => async (dispatch) => {
  const newMasterKey = new MasterKeyModel({
    ...data,
  });
  const wallet = await importWallet(
    data.mnemonic,
    newMasterKey.getStorageName(),
  );
  await syncServerAccounts(wallet);

  newMasterKey.wallet = wallet;
  newMasterKey.mnemonic = wallet.Mnemonic;

  await dispatch(importMasterKeySuccess(newMasterKey));
  await dispatch(switchMasterKey(data.name));

  await dispatch(followDefaultTokenForWallet(wallet));

  await dispatch(syncUnlinkWithNewMasterKey(newMasterKey));
  await saveWallet(wallet);

  await storeWalletAccountIdsOnAPI(wallet);

  await dispatch(reloadWallet());
};

const updateMasterKeySuccess = (masterKey) => ({
  type: types.UPDATE,
  payload: masterKey,
});

export const updateMasterKey = (masterKey) => async (dispatch) => {
  dispatch(updateMasterKeySuccess(masterKey));
};

const removeMasterKeySuccess = (history) => ({
  type: types.REMOVE,
  payload: history,
});

export const removeMasterKey = (name) => async (dispatch, getState) => {
  const state = getState();
  const list = masterKeysSelector(state);
  const newList = _.remove([...list], (item) => item.name !== name);
  const activeItem = newList.find((item) => item.isActive);
  if (!activeItem) {
    const firstItem = newList.filter(
      (item) => item.name.toLowerCase() !== 'masterless',
    )[0];
    await dispatch(switchMasterKey(firstItem.name));
  }

  await dispatch(removeMasterKeySuccess(name));
};

const loadAllMasterKeyAccountsSuccess = (accounts) => ({
  type: types.LOAD_ALL_ACCOUNTS,
  payload: accounts,
});

export const loadAllMasterKeyAccounts = () => async (dispatch, getState) => {
  const state = getState();
  const masterKeys = [
    ...noMasterLessSelector(state),
    masterlessKeyChainSelector(state),
  ];
  let accounts = [];
  for (const masterKey of masterKeys) {
    const masterKeyAccounts = await masterKey.getAccounts(true);
    accounts = [...accounts, ...masterKeyAccounts];
  }

  await dispatch(loadAllMasterKeyAccountsSuccess(accounts));
};
