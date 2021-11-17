import _, { memoize } from 'lodash';
import { createSelector } from 'reselect';
import { getAccountWallet } from '@src/services/wallet/Wallet.shared';
import { walletSelector } from './wallet';

export const accountSelector = createSelector(
  (state) => state.account,
  (account) => account,
);

export const isGettingBalance = createSelector(
  (state) => state?.account?.isGettingBalance || [],
);
export const defaultAccountName = (state) => state?.account?.defaultAccountName;

export const listAccountSelector = createSelector(
  (state) => state?.account?.list || [],
  (list) =>
    list.map((item) => ({
      ...item,
      accountName: item?.name || item?.AccountName,
      privateKey: item?.PrivateKey,
      paymentAddress: item?.PaymentAddress,
      readonlyKey: item?.ReadonlyKey,
    })),
);

export const defaultAccountNameSelector = createSelector(
  (state) => state?.account?.defaultAccountName,
  (accountName) => accountName,
);

export const defaultAccountSelector = createSelector(
  listAccountSelector,
  defaultAccountNameSelector,
  walletSelector,
  (list, defaultName, wallet) => {
    try {
      if (list.length === 0 || !wallet?.Name) {
        return {};
      }
      let account =
        list?.find((account) => account?.name === defaultName) || list[0];
      return {
        ...account,
        indexAccount: wallet.getAccountIndexByName(
          defaultAccount?.accountName || '',
        ),
      };
    } catch (error) {
      console.log('ERROR WHEN GET DEFAULT ACCOUNT', error);
    }
  },
);

export const listAccount = listAccountSelector;

export const defaultAccount = defaultAccountSelector;

export const getAccountByName = createSelector(
  listAccount,
  (accounts) =>
    memoize((accountName) =>
      accounts.find(
        (account) =>
          account?.name === accountName || account?.AccountName === accountName,
      ),
    ),
);

export const getAccountByPublicKey = createSelector(
  listAccount,
  (accounts) =>
    memoize((publicKey) =>
      accounts.find((account) => account?.PublicKeyCheckEncode === publicKey),
    ),
);

export const isGettingAccountBalanceSelector = createSelector(
  isGettingBalance,
  (isGettingBalance) => isGettingBalance.length !== 0,
);

export const defaultAccountBalanceSelector = createSelector(
  defaultAccountSelector,
  (account) => account?.value || 0,
);

export const switchAccountSelector = createSelector(
  (state) => state?.account,
  (account) => !!account?.switch,
);

export const createAccountSelector = createSelector(
  (state) => state?.account,
  (account) => !!account?.create,
);

export const importAccountSelector = createSelector(
  (state) => state?.account,
  (account) => !!account?.import,
);

export const getAccountByNameSelector = createSelector(
  listAccountSelector,
  (accounts) =>
    memoize((accountName) =>
      accounts.find(
        (account) =>
          account?.accountName === accountName ||
          account?.AccountName === accountName,
      ),
    ),
);

export const signPublicKeyEncodeSelector = createSelector(
  (state) => state?.account,
  (account) => account?.signPublicKeyEncode,
);

export const burnerAddressSelector = createSelector(
  accountSelector,
  ({ burnerAddress }) => burnerAddress,
);

export const otaKeyOfDefaultAccountSelector = createSelector(
  defaultAccountSelector,
  (account) => account.OTAKey,
);

export const nftTokenDataSelector = createSelector(
  accountSelector,
  ({ nft }) => {
    const { initNFTToken, nftToken } = nft;
    let titleStr = '';
    if (!initNFTToken) {
      titleStr = 'Welcome! Tap here to mint your access ticket';
    }
    return {
      ...nft,
      invalidNFTToken: !initNFTToken || !nftToken,
      titleStr,
    };
  },
);

export const defaultAccountWalletSelector = createSelector(
  defaultAccountSelector,
  walletSelector,
  (defaultAccount, wallet) =>
    defaultAccount && wallet && getAccountWallet(defaultAccount, wallet),
);

export const getValidRealAmountNFTSelector = createSelector(
  nftTokenDataSelector,
  (nftData) => (nftId) => {
    const { list } = nftData;
    let _nftToken;
    if (nftId) {
      const nft = (list || []).find(
        ({ nftToken: _nftToken, realAmount }) =>
          nftId === _nftToken && parseInt(realAmount),
      );
      if (nft) {
        _nftToken = nft.nftToken;
      }
    }
    return _nftToken;
  },
);

export const getValidAmountNFTSelector = createSelector(
  nftTokenDataSelector,
  (nftData) => (nftId) => {
    const { list, nftToken } = nftData;
    let _nftToken = nftToken;
    if (nftId) {
      const nft = (list || []).find(
        ({ nftToken: _nftToken, amount }) =>
          nftId === _nftToken && parseInt(amount),
      );
      if (nft) {
        _nftToken = nft.nftToken;
      }
    }
    return _nftToken;
  },
);

export const isFetchingNFTSelector = createSelector(
  accountSelector,
  ({ isFetchingNFT }) => isFetchingNFT,
);

export const isToggleModalMintMoreNFTSelector = createSelector(
  accountSelector,
  ({ toggleModalMintMoreNFT }) => toggleModalMintMoreNFT,
);

export default {
  defaultAccountName,
  listAccount,
  defaultAccount,
  isGettingBalance,
  getAccountByName,
  getAccountByPublicKey,
  listAccountSelector,
  defaultAccountNameSelector,
  defaultAccountSelector,
  isGettingAccountBalanceSelector,
  defaultAccountBalanceSelector,
  switchAccountSelector,
  createAccountSelector,
  importAccountSelector,
  getAccountByNameSelector,
  signPublicKeyEncodeSelector,
  burnerAddressSelector,
  otaKeyOfDefaultAccountSelector,
  nftTokenDataSelector,
  defaultAccountWalletSelector,
  getValidRealAmountNFTSelector,
  getValidAmountNFTSelector,
  isFetchingNFTSelector,
};
