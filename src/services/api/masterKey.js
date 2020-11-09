import http from '@src/services/http';

export const getWalletAccounts = (masterAccountPublicKey) => {
  return http.get(`hd-wallet/recovery?Key=${masterAccountPublicKey}`)
    .then(res => res?.Accounts)
    .then(accounts => accounts.map(account => ({
      name: account.Name,
      id: account.AccountID,
    })))
    .catch(() => []);
};

export const updateWalletAccounts = (masterAccountPublicKey, accounts) => {
  const accountInfos = accounts.map(item => ({
    Name: item.name,
    AccountID: item.id,
  }));

  return http.put('hd-wallet/recovery', {
    Key: masterAccountPublicKey,
    Accounts: accountInfos,
  }).catch((e) => e);
};
