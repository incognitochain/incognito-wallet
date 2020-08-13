import _, { memoize } from 'lodash';
import { createSelector } from 'reselect';

export const isGettingBalance = createSelector(
  (state) => state?.account?.isGettingBalance || [],
);
export const defaultAccountName = (state) => state?.account?.defaultAccountName;
export const listAccount = (state) => state?.account?.list || [];
export const defaultAccount = createSelector(
  listAccount,
  defaultAccountName,
  (list, defaultName) => {
    let account = list?.find((account) => account?.name === defaultName);
    if (_.isEmpty(account?.name)) {
      console.warn(
        `Can not get account ${account?.name}, fallback to first account (default account)`,
      );
      account = list && list[0];
    }

    return account;
  },
);
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

// export const getAccountByBlsKey =  createSelector(
//   listAccount,
//   accounts => memoize(blsKey => accounts.find(account => account?.BLSPublicKey === blsKey))
// );

export const listAccountSelector = createSelector(
  (state) => state?.account?.list || [],
  (list) =>
    list.map((item) => ({
      ...item,
      accountName: item?.name || item?.AccountName,
      privateKey: item?.PrivateKey,
      paymentAddress: item?.PaymentAddress,
    })),
);

export const defaultAccountNameSelector = createSelector(
  (state) => state?.account?.defaultAccountName,
  (accountName) => accountName,
);

export const defaultAccountSelector = createSelector(
  listAccountSelector,
  defaultAccountNameSelector,
  (list, defaultName) => {
    let account = list?.find((account) => account?.name === defaultName);
    if (_.isEmpty(account?.name)) {
      console.warn(
        `Can not get account ${account?.name}, fallback to first account (default account)`,
      );
      account = list && list[0];
    }
    return account;
  },
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
  (account) => account?.switch || null,
);

export const createAccountSelector = createSelector(
  (state) => state?.account,
  (account) => account?.create || null,
);

export const importAccountSelector = createSelector(
  (state) => state?.account,
  (account) => account?.import || null,
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
};
