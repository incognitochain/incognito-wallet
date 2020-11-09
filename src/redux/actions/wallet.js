import { loadListAccount } from '@src/services/wallet/WalletService';
import accountService from '@src/services/wallet/accountService';
import type from '@src/redux/types/wallet';
// eslint-disable-next-line import/no-cycle
import {
  setListAccount,
  setDefaultAccount,
} from '@src/redux/actions/account';
import { accountSeleclor } from '@src/redux/selectors';
import { currentMasterKeySelector } from '@src/redux/selectors/masterKey';
import { walletSelector } from '@src/redux/selectors/wallet';
// eslint-disable-next-line import/no-cycle
import { updateMasterKey } from '@src/redux/actions/masterKey';

const getStoredDefaultAccountName = async (listAccount) => {
  const firstAccountName = listAccount && listAccount[0]?.name;
  try {
    const storedName = await accountService.getDefaultAccountName();
    if (storedName) {
      const account = listAccount.find(item => item.name === storedName);

      if (account) {
        return storedName;
      }
    }
    throw new Error(
      'Can not find stored account name, will fallback to first account',
    );
  } catch {
    return firstAccountName;
  }
};

export const setWallet = (
  wallet = throw new Error('Wallet object is required'),
) => ({
  type: type.SET,
  data: wallet,
});

export const removeWallet = () => ({
  type: type.REMOVE,
});

export const reloadAccountList = () => async (dispatch, getState) => {
  const state = getState();
  const wallet = walletSelector(state);
  const masterKey = currentMasterKeySelector(state);
  if (!wallet) {
    return;
  }
  const accounts = await loadListAccount(wallet);
  await dispatch(updateMasterKey(masterKey));
  await dispatch(setListAccount(accounts));
  return accounts;
};

export const reloadWallet = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const masterKey = currentMasterKeySelector(state);
    const wallet = masterKey.wallet;

    let defaultAccount = accountSeleclor.defaultAccount(state);

    if (wallet) {
      dispatch(setWallet(wallet));

      const accounts = await loadListAccount(wallet);

      // Change default account to first account after switching master key
      if (defaultAccount) {
        const existed = accounts.find(item => item.PrivateKey === defaultAccount.PrivateKey);
        if (!existed) {
          defaultAccount = accounts[0];
          dispatch(setDefaultAccount(defaultAccount));
        }
      }

      dispatch(setListAccount(accounts));

      if (!defaultAccount) {
        const defaultAccountName = await getStoredDefaultAccountName(accounts);
        defaultAccount = accounts?.find((a) => a?.name === defaultAccountName);
        defaultAccount && dispatch(setDefaultAccount(defaultAccount));
      }

      return wallet;
    }
    return false;
  } catch (e) {
    throw e;
  }
};
