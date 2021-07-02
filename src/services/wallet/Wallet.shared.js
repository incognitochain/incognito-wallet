import { Validator, PrivacyVersion } from 'incognito-chain-web-js/build/wallet';

export const getAccountNameByAccount = (account) => {
  new Validator('account', account).object().required();
  if (account) {
    return account.name || account.AccountName || account.accountName;
  }
  return '';
};

export const getAccountWallet = (account, wallet) => {
  try {
    new Validator('account', account).object().required();
    new Validator('wallet', wallet).object().required();
    const indexAccount = wallet.getAccountIndexByName(
      getAccountNameByAccount(account),
    );
    let accountWallet = wallet.MasterAccount.child[indexAccount];
    if (!accountWallet) {
      return {};
    }
    new Validator('accountWallet', accountWallet).object();
    new Validator('wallet.RpcClient', wallet.RpcClient).string();
    new Validator('wallet.Storage', wallet.Storage).object();
    new Validator('wallet.RpcCoinService', wallet.RpcCoinService).string();
    new Validator('wallet.PrivacyVersion', wallet.PrivacyVersion).number();
    new Validator('wallet.PubsubService', wallet.PubsubService).string();
    new Validator('wallet.AuthToken', wallet.AuthToken).string();
    new Validator('wallet.RpcApiService', wallet.RpcApiService).string();
    accountWallet.setRPCClient(wallet.RpcClient);
    accountWallet.setStorageServices(wallet.Storage);
    accountWallet.setRPCCoinServices(wallet.RpcCoinService);
    accountWallet.setRPCTxServices(wallet.PubsubService);
    accountWallet.setRPCRequestServices(wallet.RpcRequestService);
    accountWallet.setAuthToken(wallet.AuthToken);
    accountWallet.setRPCApiServices(wallet.RpcApiService, wallet.AuthToken);
    accountWallet.setRPCCoinServices2('http://51.161.119.66:9080');
    // accountWallet.setUseLegacyEncoding(wallet.UseLegacyEncoding);
    //todo: update url for portal backend
    accountWallet.setRPCPortalServices('http://0.0.0.0:8091'); //(local)
    return accountWallet;
  } catch (error) {
    throw error;
  }
};
