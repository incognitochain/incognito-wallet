import { Validator } from 'incognito-chain-web-js/build/wallet';

export const getAccountNameByAccount = (account) => {
  new Validator('account', account).object().required();
  if (account) {
    return account.AccountName || account.name || account.accountName;
  }
  return '';
};

export const getAccountWallet = (account, wallet) => {
  try {
    new Validator('getAccountWallet-account', account).object().required();
    new Validator('getAccountWallet-wallet', wallet).object().required();
    const accountName = getAccountNameByAccount(account);
    if (!accountName) {
      return {};
    }
    const indexAccount = wallet.getAccountIndexByName(accountName);
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
    new Validator('wallet.PortalService', wallet.PortalService).string();
    accountWallet.setRPCClient(wallet.RpcClient);
    accountWallet.setStorageServices(wallet.Storage);
    accountWallet.setRPCCoinServices(wallet.RpcCoinService);
    accountWallet.setRPCTxServices(wallet.PubsubService);
    accountWallet.setRPCRequestServices(wallet.RpcRequestService);
    accountWallet.setAuthToken(wallet.AuthToken);
    accountWallet.setRPCApiServices(wallet.RpcApiService, wallet.AuthToken);
    // accountWallet.setUseLegacyEncoding(wallet.UseLegacyEncoding);
    accountWallet.setRPCPortalServices(wallet.PortalService);
    accountWallet.setWebAppService(wallet.WebAppService);
    return accountWallet;
  } catch (error) {
    console.log('getAccountWallet error', error);
    throw error;
  }
};
