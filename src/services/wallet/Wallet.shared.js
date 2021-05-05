import storage from '@services/storage';

export const getAccountNameByAccount = (account) => {
  if (!account) {
    throw new Error('Missing account');
  }
  if (account) {
    return account.name || account.AccountName || account.accountName;
  }
  return '';
};

export const getAccountWallet = (account, wallet) => {
  try {
    if (!wallet) {
      throw new Error('Missing wallet');
    }
    if (!account) {
      throw new Error('Missing account');
    }
    const indexAccount = wallet.getAccountIndexByName(
      getAccountNameByAccount(account),
    );
    let accountWallet = wallet.MasterAccount.child[indexAccount];
    return accountWallet;
  } catch (error) {
    throw error;
  }
};
