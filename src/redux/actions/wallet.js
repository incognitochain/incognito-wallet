/* eslint-disable import/no-cycle */
import { batch } from 'react-redux';
import { configsWallet } from '@src/services/wallet/WalletService';
import accountService from '@src/services/wallet/accountService';
import type from '@src/redux/types/wallet';
import {
  setListAccount,
  setAccount,
  setDefaultAccount,
  actionSetSignPublicKeyEncode, actionSetNFTTokenData,
} from '@src/redux/actions/account';
import { currentMasterKeySelector } from '@src/redux/selectors/masterKey';
import { walletSelector } from '@src/redux/selectors/wallet';
import {
  actionSyncAccountMasterKey,
  updateMasterKey,
} from '@src/redux/actions/masterKey';
import { Validator } from 'incognito-chain-web-js/build/wallet';
import { ExHandler } from '@src/services/exception';
import isEqual from 'lodash/isEqual';
import { FollowAction } from '@screens/Wallet/features/FollowList';
import { getPTokenList } from '@src/redux/actions/token';

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
  const accounts = await wallet.listAccount();
  await dispatch(updateMasterKey(masterKey));
  await dispatch(setListAccount(accounts));
  return accounts;
};

export const actionSubmitOTAKeyForListAccount =
  (wallet) => async () => {
    try {
      if (!wallet) {
        return;
      }
      const listAccount = await wallet.listAccount();
      if (!listAccount) {
        return;
      }
      const task = listAccount.map((account) => {
        const accountWallet = accountService.getAccount(account, wallet);
        if (!!accountWallet && accountWallet?.name) {
          return accountWallet.submitOTAKey();
        }
      });
      await Promise.all(task);
    } catch (error) {
      console.log('SUBMIT OTA KEY ERROR', error);
    }
  };

export const actionRequestAirdropNFTForListAccount = (wallet) => async () => {
  try {
    if (!wallet) {
      return;
    }
    const listAccount = await wallet.listAccount();
    if (!listAccount) {
      return;
    }
    const task = listAccount.map((account) => {
      const accountWallet = accountService.getAccount(account, wallet);
      if (!!accountWallet && accountWallet?.name) {
        return accountWallet.requestAirdropNFT();
      }
    });
    await Promise.all(task);
  } catch (error) {
    console.log('REQUEST AIRDROP NFT ERROR', error);
  }
};

export const reloadWallet =
  (accountName = '') =>
    async (dispatch, getState) => {
      let listAccount = [];
      new Validator('reloadWallet-accountName', accountName).string();
      const state = getState();
      const masterKey = currentMasterKeySelector(state);
      let wallet = masterKey.wallet;
      let defaultAccount;
      try {
        await configsWallet(wallet);
        if (wallet?.Name) {
          listAccount = await wallet.listAccount();
          defaultAccount =
          listAccount.find((item) => isEqual(item?.accountName, accountName)) ||
          listAccount[0];
          if (!defaultAccount?.accountName) {
            throw new Error(`Can not get default account ${accountName}`);
          }
          batch(() => {
            dispatch(setWallet(wallet));
            dispatch(setListAccount(listAccount));
            dispatch(setAccount(defaultAccount));
            dispatch(setDefaultAccount(defaultAccount));
            dispatch(getPTokenList());
          });
          setTimeout(() => {
            batch(() => {
              dispatch(FollowAction.actionLoadFollowBalance());
              dispatch(actionSetSignPublicKeyEncode());
              dispatch(actionSyncAccountMasterKey());
              dispatch(actionSetNFTTokenData());
            });
          }, 500);
        }
        return wallet;
      } catch (e) {
        new ExHandler(e).showErrorToast();
      }
    };
