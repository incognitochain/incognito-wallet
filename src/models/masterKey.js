import { Wallet, loadBackupKey, parseStorageBackup } from 'incognito-chain-web-js/build/wallet';
import { initWallet, loadWallet } from '@services/wallet/WalletService';
import storage from '@services/storage';
import { getPassphrase } from '@services/wallet/passwordService';
import toLower from 'lodash/toLower';
import isEqual from 'lodash/isEqual';
import Server from '@services/wallet/Server';
// eslint-disable-next-line import/no-cycle
import { getWalletInstanceByImportMasterKey } from '@src/redux/actions/masterKey';
import trim from 'lodash/trim';

class MasterKeyModel {
  static network = 'mainnet';

  constructor(data = {}) {
    this.name = data?.name;
    this.mnemonic = data?.passphrase;
    this.isActive = !!data?.isActive;
    this.deletedAccountIds = data?.deletedAccountIds || [];
    this.isMasterless =
      isEqual(toLower(this?.name), 'masterless') ||
      isEqual(toLower(this?.name), 'unlinked');
  }

  static getStorageName(name) {
    return `$${MasterKeyModel.network}-master-${name.toLowerCase()}`;
  }

  getStorageName() {
    return MasterKeyModel.getStorageName(this.name);
  }

  async getBackupMasterKeys() {
    const [network, passphrase] = await Promise.all([
      Server.getNetwork(),
      getPassphrase(),
    ]);
    const storageKey = loadBackupKey(network);
    const backupStr = (await storage.getItem(storageKey)) || '';
    return parseStorageBackup({ passphrase, backupStr }) || [];
  }

  /**
   * Load wallet from storage
   * @returns {Promise<Wallet>}
   */
  async loadWallet({
    callback,
    isTestReimportWallet = false
  }) {
    console.time('TIME_LOAD_WALLET_FROM_STORAGE');
    const rootName = this.name;
    const storageName = this.getStorageName();
    const rawData = await storage.getItem(storageName);
    const passphrase = await getPassphrase();
    let wallet;
    if (rawData) {
      wallet = await loadWallet(passphrase, storageName, rootName);
    }
    const backupMasterKeys = await this.getBackupMasterKeys();

    /** foundMasterKey = { name, mnemonic, isMasterless }
     * handle cant load wallet
     * load list backup in wallet and reimport again
     **/
    const foundMasterKey = backupMasterKeys.find(({ name }) => name === rootName);
    if (
      (!wallet || !!isTestReimportWallet)
      && foundMasterKey
      && !foundMasterKey.isMasterless
    ) {
      const mnemonic = 'hint protect episode topple shop fade receive pave wage ridge now face';
      wallet = (await getWalletInstanceByImportMasterKey({
        name: trim(foundMasterKey.name),
        // mnemonic: trim(foundMasterKey.mnemonic),
        mnemonic
      }))?.wallet;
      typeof callback === 'function' && callback(backupMasterKeys);
    }
    /** Cant load wallet -> create new wallet */
    if (!wallet) {
      wallet = await initWallet(storageName, rootName);
    }
    this.mnemonic = wallet.Mnemonic;
    this.wallet = wallet;
    wallet.deletedAccountIds = this.deletedAccountIds || [];
    if (toLower(this.name) === 'unlinked') {
      this.name = 'Masterless';
      wallet.Name = this.getStorageName();
      await wallet.save();
    }
    wallet.Name = this.getStorageName();
    console.time('TIME_LOAD_WALLET_FROM_STORAGE');
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
      accountInfo.MasterKeyName = this.name;
    }

    return accountInfos;
  }
}

export default MasterKeyModel;
