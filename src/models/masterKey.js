import { createDefaultAccounts, initWallet, loadWallet } from '@services/wallet/WalletService';
import { CONSTANT_CONFIGS } from '@src/constants';
import storage from '@services/storage';
import { getPassphrase } from '@services/wallet/passwordService';

class MasterKeyModel {
  static network = 'mainnet';

  constructor(data = {}) {
    this.name = data?.name;
    this.mnemonic = data?.passphrase;
    this.isActive = !!data?.isActive;
    this.deletedAccountIds = data?.deletedAccountIds || [];
  }

  static getStorageName(name) {
    return `$${MasterKeyModel.network}-master-${name.toLowerCase()}`;
  }

  getStorageName() {
    return MasterKeyModel.getStorageName(this.name);
  }

  /**
   * Load wallet from storage
   * @returns {Promise<Wallet>}
   */
  async loadWallet() {
    const storageName = this.getStorageName();
    const rawData = await storage.getItem(storageName);
    const passphrase = await getPassphrase();

    let wallet;

    if (rawData) {
      wallet = await loadWallet(passphrase, storageName);
    }

    if (!wallet) {
      wallet = await this.initWallet();
    }

    this.mnemonic = wallet.Mnemonic;
    this.wallet = wallet;

    wallet.Name = this.getStorageName();
    return wallet;
  }

  async initWallet() {
    const storageName = this.getStorageName();

    const wallet = await initWallet(storageName);

    return wallet;
  }

  get noOfKeychains() {
    return this.wallet?.MasterAccount?.child.length || 0;
  }

  async getAccounts(deserialize = true) {
    if (!deserialize) {
      return this.wallet.MasterAccount.child;
    }

    const accountInfos = [];

    for (const account of this.wallet.MasterAccount.child) {
      const accountInfo = await account.getDeserializeInformation();
      accountInfo.Wallet = this.wallet;
      accountInfo.MasterKey = this;
      accountInfo.FullName = `${this.name}-${accountInfo.AccountName}`;
      accountInfos.push(accountInfo);
    }

    return accountInfos;
  }
}

export default MasterKeyModel;
