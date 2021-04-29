import storage from '@services/storage';

export const getAccountWallet = (account, wallet) => {
  try {
    if (!wallet) {
      throw new Error('Missing wallet');
    }
    if (!account) {
      throw new Error('Missing account');
    }
    const indexAccount = wallet.getAccountIndexByName(
      this.getAccountName(account),
    );
    let account = wallet.MasterAccount.child[indexAccount];
    account.setStorageServices(storage);
    return account;
  } catch (error) {
    throw error;
  }
};
