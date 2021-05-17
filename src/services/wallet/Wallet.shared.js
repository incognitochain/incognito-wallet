import { Validator } from 'incognito-chain-web-js/build/wallet';

export const getAccountNameByAccount = (account) => {
  new Validator('account', account).required();
  if (account) {
    return account.name || account.AccountName || account.accountName;
  }
  return '';
};

export const getAccountWallet = (account, wallet) => {
  try {
    new Validator('account', account).required();
    new Validator('wallet', wallet).required();
    const indexAccount = wallet.getAccountIndexByName(
      getAccountNameByAccount(account),
    );
    let accountWallet = wallet.MasterAccount.child[indexAccount];
    new Validator('accountWallet', accountWallet).required();
    accountWallet.setRPCClient(wallet.RpcClient);
    accountWallet.setStorageServices(wallet.Storage);
    accountWallet.setRPCCoinServices(wallet.RpcCoinService);
    accountWallet.setPrivacyVersion(wallet.PrivacyVersion);
    // accountWallet.setUseLegacyEncoding(wallet.UseLegacyEncoding);
    return accountWallet;
  } catch (error) {
    throw error;
  }
};
