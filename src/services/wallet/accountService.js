/* eslint-disable import/no-cycle */
import BigNumber from 'bignumber.js';
import AccountModel from '@models/account';
import { COINS, CONSTANT_KEYS } from '@src/constants';
import tokenModel from '@src/models/token';
import storage from '@src/services/storage';
import {
  AccountWallet,
  KeyWallet,
  Wallet,
  constants,
  Validator,
} from 'incognito-chain-web-js/build/wallet';
import _ from 'lodash';
import { STACK_TRACE } from '@services/exception/customError/code/webjsCode';
import { chooseBestCoinToSpent } from 'incognito-chain-web-js/lib/tx/utils';
import bn from 'bn.js';
import Server from '@services/wallet/Server';
import { PRV, PRV_ID } from '@src/constants/common';
import {
  getAccountNameByAccount,
  getAccountWallet,
} from '@src/services/wallet/Wallet.shared';
import { PRVIDSTR } from 'incognito-chain-web-js/lib/wallet/constants';
import { CustomError, ErrorCode, ExHandler } from '../exception';
import {
  loadListAccountWithBLSPubKey,
  saveWallet,
  SuccessTx,
} from './WalletService';

const TAG = 'Account';

export default class Account {
  static NO_OF_INPUT_PER_DEFRAGMENT_TX = 10;
  static MAX_DEFRAGMENT_TXS = 3;
  static NO_OF_INPUT_PER_DEFRAGMENT =
    Account.NO_OF_INPUT_PER_DEFRAGMENT_TX * Account.MAX_DEFRAGMENT_TXS;

  static async getDefaultAccountName() {
    try {
      return await storage.getItem(CONSTANT_KEYS.DEFAULT_ACCOUNT_NAME);
    } catch (e) {
      console.error(
        'Error while getting default account index, fallback index to 0',
      );
    }
    return null;
  }

  static saveDefaultAccountToStorage(accountName) {
    return storage.setItem(CONSTANT_KEYS.DEFAULT_ACCOUNT_NAME, accountName);
  }

  static async importAccount(privakeyStr, accountName, passPhrase, wallet) {
    new Validator('privakeyStr', privakeyStr).string().required();
    new Validator('accountName', accountName).string().required();
    new Validator('passPhrase', passPhrase).string();
    new Validator('wallet', wallet).required();
    let imported = false;
    try {
      const account = await wallet.importAccount(
        privakeyStr,
        accountName,
        passPhrase,
      );
      imported = !!account.isImport;
    } catch (e) {
      throw e;
    }
    return imported;
  }

  static async removeAccount(privateKeyStr, passPhrase, wallet) {
    return wallet.removeAccount(privateKeyStr, passPhrase);
  }

  static async createAndSendNativeToken({
    wallet,
    account,
    prvPayments,
    info,
    fee,
    metadata,
    isEncryptMessage = true,
    txType,
  } = {}) {
    try {
      new Validator('wallet', wallet).required();
      new Validator('account', account).required();
      new Validator('prvPayments', prvPayments).required().paymentInfoList();
      new Validator('fee', fee).required().amount();
      new Validator('info', info).string();
      new Validator('isEncryptMessage', isEncryptMessage).boolean();
      new Validator('metadata', metadata).object();
      new Validator('txType', txType).required().number();
      const accountWallet = this.getAccount(account, wallet);
      await accountWallet.resetProgressTx();
      const infoStr = typeof info !== 'string' ? JSON.stringify(info) : info;
      const result = await accountWallet.createAndSendNativeToken({
        transfer: {
          info: infoStr,
          prvPayments,
          fee,
        },
        extra: { metadata, isEncryptMessage, txType },
      });
      console.log('result', result);
      // save wallet
      await saveWallet(wallet);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async createAndSendPrivacyToken({
    wallet,
    account,
    prvPayments,
    tokenPayments,
    info,
    fee,
    tokenID,
    metadata,
    isEncryptMessage = true,
    isEncryptMessageToken = true,
    txType,
  } = {}) {
    new Validator('wallet', wallet).required();
    new Validator('account', account).required();
    new Validator('prvPayments', prvPayments).paymentInfoList();
    new Validator('tokenPayments', tokenPayments).required().paymentInfoList();
    new Validator('fee', fee).required().amount();
    new Validator('info', info).string();
    new Validator('tokenID', tokenID).string().required();
    new Validator('metadata', metadata).object();
    new Validator('isEncryptMessage', isEncryptMessage).boolean();
    new Validator('isEncryptMessageToken', isEncryptMessageToken).boolean();
    new Validator('txType', txType).required().number();
    let result;
    const accountWallet = this.getAccount(account, wallet);
    await accountWallet.resetProgressTx();
    const infoStr = typeof info !== 'string' ? JSON.stringify(info) : info;
    result = await accountWallet.createAndSendPrivacyToken({
      transfer: {
        info: infoStr,
        prvPayments,
        tokenPayments,
        fee,
        tokenID,
      },
      extra: { metadata, isEncryptMessage, isEncryptMessageToken, txType },
    });
    console.log('result', result);
    await saveWallet(wallet);
    return result;
  }

  static async createAndSendTradeRequestTx({
    account,
    wallet,
    fee,
    tokenIDToBuy = PRVIDSTR,
    tokenIDToSell = PRVIDSTR,
    sellAmount,
    minAcceptableAmount,
    tradingFee,
  } = {}) {
    new Validator('wallet', wallet).required();
    new Validator('account', account).required();
    new Validator('tokenIDToBuy', tokenIDToBuy).required().string();
    new Validator('tokenIDToSell', tokenIDToSell).required().string();
    new Validator('sellAmount', sellAmount).required().amount();
    new Validator('minAcceptableAmount', minAcceptableAmount)
      .required()
      .amount();
    new Validator('tradingFee', tradingFee).required().amount();
    new Validator('fee', fee).required().amount();
    let result;
    const accountWallet = this.getAccount(account, wallet);
    await accountWallet.resetProgressTx();
    result = await accountWallet.createAndSendTradeRequestTx({
      transfer: {
        fee,
      },
      extra: {
        tokenIDToBuy,
        tokenIDToSell,
        sellAmount,
        minAcceptableAmount,
        tradingFee,
      },
    });
    console.log('result', result);
    await saveWallet(wallet);
    return result;
  }

  static async createAndSendStopAutoStakingTx(
    wallet,
    account,
    feeNativeToken,
    candidatePaymentAddress,
    candidateMiningSeedKey,
  ) {
    let result;
    const accountWallet = this.getAccount(account, wallet);
    result = await accountWallet.createAndSendStopAutoStakingTx(
      feeNativeToken,
      candidatePaymentAddress,
      candidateMiningSeedKey,
    );
    await saveWallet(wallet);
    await Wallet.resetProgressTx();
    return result;
  }

  static async staking(
    param,
    feeNativeToken,
    candidatePaymentAddress,
    account,
    wallet,
    rewardReceiverPaymentAddress,
    autoReStaking = false,
  ) {
    if (!param || typeof param?.type !== 'number')
      throw new Error('Invalid staking param');
    if (!candidatePaymentAddress)
      throw new Error('Missing candidatePaymentAddress');
    if (!account) throw new Error('Missing account');
    if (!wallet) throw new Error('Missing wallet');
    // param: payment address string, amount in Number (miliconstant)
    await Wallet.resetProgressTx();
    const accountWallet = this.getAccount(account, wallet);
    const candidateMiningSeedKey = account.ValidatorKey;
    // create and send constant
    let result;
    try {
      result = await accountWallet.createAndSendStakingTx(
        param,
        feeNativeToken,
        candidatePaymentAddress,
        candidateMiningSeedKey,
        rewardReceiverPaymentAddress,
        autoReStaking,
      );

      // save wallet
      await saveWallet(wallet);
    } catch (e) {
      throw e;
    }
    await Wallet.resetProgressTx();
    return result;
  }

  static async createAccount(accountName, wallet, initShardID) {
    const server = await Server.getDefault();
    if (server.id === 'testnode') {
      let lastByte = null;
      let newAccount;
      while (lastByte !== 0) {
        newAccount = await wallet.createAccount(
          accountName,
          0,
          wallet.deletedAccountIds || [],
        );
        const childKey = newAccount.key;
        lastByte =
          childKey.KeySet.PaymentAddress.Pk[
            childKey.KeySet.PaymentAddress.Pk.length - 1
          ];
      }
      wallet.MasterAccount.child.push(newAccount);
      await saveWallet(wallet);
      return newAccount;
    }
    let shardID = _.isNumber(initShardID) ? initShardID : undefined;
    if (shardID && parseInt(shardID) < 0) {
      shardID = 0;
    }
    return await wallet.createNewAccount(
      accountName,
      shardID,
      wallet.deletedAccountIds || [],
    );
  }

  static async getProgressTx(defaultAccount, wallet) {
    new Validator('defaultAccount', defaultAccount).required();
    new Validator('wallet', wallet).required();
    const account = this.getAccount(defaultAccount, wallet);
    return account.getProgressTx();
  }

  static async getDebugMessage(defaultAccount, wallet) {
    new Validator('defaultAccount', defaultAccount).required();
    new Validator('wallet', wallet).required();
    const account = this.getAccount(defaultAccount, wallet);
    return account.getDebugMessage();
  }

  static checkPaymentAddress(paymentAddrStr) {
    try {
      const key = KeyWallet.base58CheckDeserialize(paymentAddrStr);
      const paymentAddressObj = key?.KeySet?.PaymentAddress || {};
      if (
        paymentAddressObj.Pk?.length === 32 &&
        paymentAddressObj.Tk?.length === 32
      ) {
        return true;
      }
    } catch (e) {
      return false;
    }

    return false;
  }

  static validatePrivateKey(privateKey) {
    try {
      const keyWallet = KeyWallet.base58CheckDeserialize(privateKey);
      return !!keyWallet;
    } catch (e) {
      return false;
    }
  }

  /**
   *
   * @param {object} account
   * @param {object} wallet
   * @param {string} tokenId
   *
   * If `tokenId` is not passed, this method will return native token (PRV) balance, else custom token balance (from `tokenId`)
   */
  static async getBalance(account, wallet, tokenId = PRVIDSTR) {
    new Validator('account', account).required();
    new Validator('wallet', wallet).required();
    const accountWallet = this.getAccount(account, wallet);
    let balance = 0;
    try {
      balance = await accountWallet.getBalance(tokenId);
      return new BigNumber(balance).toNumber();
    } catch (error) {
      throw error;
    }
  }

  static parseShard(account) {
    const bytes = account.PublicKeyBytes;
    const arr = bytes.split(',');
    const lastByte = arr[arr.length - 1];
    return lastByte % 8;
  }

  static getFollowingTokens(account, wallet) {
    new Validator('account', account).required();
    new Validator('wallet', wallet).required();
    const accountWallet = this.getAccount(account, wallet);
    const followedTokens = accountWallet
      .listFollowingTokens()
      ?.map(tokenModel.fromJson);
    if (followedTokens && followedTokens.find((item) => item?.id === PRV_ID)) {
      this.removeFollowingToken(PRV_ID, account, wallet);
      return followedTokens.filter((item) => item?.id !== PRV_ID);
    }
    return followedTokens;
  }

  static async addFollowingTokens(tokens, account, wallet) {
    new Validator('account', account).required();
    new Validator('wallet', wallet).required();
    new Validator('tokens', tokens).required();
    const accountWallet = this.getAccount(account, wallet);
    await accountWallet.addFollowingToken(...tokens);
    await saveWallet(wallet);
    return wallet;
  }

  static async removeFollowingToken(tokenId, account, wallet) {
    new Validator('account', account).required();
    new Validator('wallet', wallet).required();
    new Validator('tokenId', tokenId).required().string();
    const accountWallet = this.getAccount(account, wallet);
    await accountWallet.removeFollowingToken(tokenId);
    await saveWallet(wallet);
    return wallet;
  }

  /**
   *
   * @param {string} tokenID
   * @param paymentAddrStr
   * @param {bool} isGetAll
   * @returns {object}
   */
  static async getRewardAmount(tokenID, paymentAddrStr, isGetAll = false) {
    if (_.isEmpty(paymentAddrStr))
      throw new CustomError(ErrorCode.payment_address_empty, {
        name: 'payment address is empty',
      });
    return await AccountWallet?.getRewardAmount(
      paymentAddrStr,
      isGetAll,
      tokenID,
    );
  }

  /**
   *
   * @param {string} tokenID
   * @param {object} account
   * @param {object} wallet
   */
  static async createAndSendWithdrawRewardTx(tokenID, account, wallet) {
    const accountWallet = this.getAccount(account, wallet);
    return accountWallet.createAndSendWithdrawRewardTx(tokenID);
  }

  /**
   *
   * @param {object} accountWallet
   */
  static toSerializedAccountObj(accountWallet) {
    return accountWallet.toSerializedAccountObj();
  }

  /**
   *
   * @param {object} account
   * @param {object} wallet
   */
  // stakerStatus returns -1 if account haven't staked,
  // returns 0 if account is a candidator and
  // returns 1 if account is a validator
  static stakerStatus(account, wallet) {
    const accountWallet = wallet.getAccountByName(account?.name);
    return accountWallet.stakerStatus();
  }

  /**
   *
   * @param {string} blsKey
   * @param {object} wallet
   * @returns :AccountModel: template
   */
  static async getAccountWithBLSPubKey(blsKey, wallet) {
    try {
      let accountWallet = null;
      if (!_.isEmpty(blsKey)) {
        console.log(TAG, 'getAccountWithBLSPubKey begin');
        const listAccounts = (await loadListAccountWithBLSPubKey(wallet)) || [];
        console.log(TAG, 'getAccountWithBLSPubKey listAccount ', listAccounts);
        let account = listAccounts.find((item) =>
          _.isEqual(item.BLSPublicKey, blsKey),
        );

        account = account
          ? await wallet.getAccountByName(account.AccountName)
          : null;
        console.log(TAG, 'getAccountWithBLSPubKey end ---- ', account);
        // accountWallet = account? new AccountModel(account):null;
        accountWallet = account;
      }
      return accountWallet;
    } catch (e) {
      console.warn(TAG, 'getAccountWithBLSPubKey error =', e);
    }
    return null;
  }

  /**
   *
   * @param {string} blsKey
   * @param {object} wallet
   * @returns :AccountModel: template
   */
  static async getFullDataOfAccount(accountName, wallet) {
    try {
      let accountWallet = null;
      if (!_.isEmpty(accountName)) {
        console.log(TAG, 'getFullDataOfAccount begin');
        const listAccounts = (await loadListAccountWithBLSPubKey(wallet)) || [];
        console.log(TAG, 'getFullDataOfAccount listAccount ', listAccounts);
        let account: JSON = listAccounts.find((item) =>
          _.isEqual(item.AccountName, accountName),
        );

        let accountTemp = account
          ? await wallet.getAccountByName(account.AccountName)
          : null;
        console.log(TAG, 'getFullDataOfAccount end ---- ', account);
        // accountWallet = account? new AccountModel(account):null;
        accountWallet = accountTemp
          ? new AccountModel({ ...accountTemp, ...account })
          : null;
      }
      return accountWallet;
    } catch (e) {
      console.warn(TAG, 'getFullDataOfAccount error =', e);
    }
    return null;
  }

  static async createAndSendTxWithNativeTokenContribution(
    wallet,
    account,
    fee,
    pdeContributionPairID,
    contributedAmount,
    info = '',
  ) {
    let result;
    const accountWallet = this.getAccount(account, wallet);
    try {
      result = await accountWallet.createAndSendTxWithNativeTokenContribution(
        fee,
        pdeContributionPairID,
        contributedAmount,
        info,
      );
    } catch (e) {
      throw e;
    }
    return result;
  }

  static async createAndSendPTokenContributionTx(
    wallet,
    account,
    tokenParam,
    feeNativeToken,
    feePToken,
    pdeContributionPairID,
    contributedAmount,
  ) {
    let result;
    const accountWallet = this.getAccount(account, wallet);
    try {
      result = await accountWallet.createAndSendPTokenContributionTx(
        tokenParam,
        feeNativeToken,
        feePToken,
        pdeContributionPairID,
        contributedAmount,
      );
    } catch (e) {
      throw e;
    }
    return result;
  }

  static async createAndSendWithdrawDexTx(
    wallet,
    account,
    fee,
    withdrawalToken1IDStr,
    withdrawalToken2IDStr,
    withdrawalShareAmt,
    info = '',
  ) {
    let result;
    const accountWallet = this.getAccount(account, wallet);
    try {
      result = await accountWallet.createAndSendWithdrawDexTx(
        fee,
        withdrawalToken1IDStr,
        withdrawalToken2IDStr,
        withdrawalShareAmt,
        info,
      );
    } catch (e) {
      throw e;
    }
    return result;
  }

  static isNotEnoughCoinErrorCode(error) {
    return error.code === 'WEB_JS_ERROR(-5)';
  }

  static isPendingTx(error) {
    return error.stackTrace.includes(STACK_TRACE.REPLACEMENT);
  }

  static getAccountName(account) {
    return getAccountNameByAccount(account);
  }

  static getPaymentAddress(account) {
    if (account) {
      return account.PaymentAddress || account.paymentAddress;
    }

    return '';
  }

  static async getUTXOs(wallet, account, coinId) {
    if (!wallet || !account) {
      return 0;
    }
    const accountWallet = this.getAccount(account, wallet);
    return (
      (accountWallet?.coinUTXOs &&
        accountWallet?.coinUTXOs[coinId || COINS.PRV_ID]) ||
      0
    );
  }

  static getMaxInputPerTx() {
    return constants.MAX_INPUT_PER_TX;
  }

  static hasExceededMaxInput(wallet, account, coinId) {
    const noOfUTXOs = this.getUTXOs(wallet, account, coinId);
    return noOfUTXOs > this.getMaxInputPerTx();
  }

  /**
   * Create multiple tx to defragment all utxo in account
   * @param {number} fee
   * @param {boolean} isPrivacy
   * @param {object} account
   * @param {object} wallet
   * @param {number} noOfTxs
   * @returns {Promise<*>}
   */
  static async defragmentNativeCoin(
    fee,
    isPrivacy,
    account,
    wallet,
    noOfTxs = this.MAX_DEFRAGMENT_TXS,
  ) {
    if (!wallet) {
      throw new Error('Missing wallet');
    }
    if (!account) {
      throw new Error('Missing account');
    }
    const accountWallet = this.getAccount(account, wallet);
    const result = await accountWallet.defragmentNativeCoin(
      fee,
      isPrivacy,
      this.NO_OF_INPUT_PER_DEFRAGMENT_TX,
      noOfTxs,
    );
    // save wallet
    await saveWallet(wallet);
    await Wallet.resetProgressTx();
    return result;
  }

  static getAccount(defaultAccount, wallet) {
    try {
      new Validator('defaultAccount', defaultAccount).required();
      new Validator('wallet', wallet).required();
      return getAccountWallet(defaultAccount, wallet);
    } catch (error) {
      throw error;
    }
  }

  static async getStorageAccountByTokenId(defaultAccount, wallet, tokenID) {
    try {
      if (!wallet) {
        throw new Error('Missing wallet');
      }
      if (!defaultAccount) {
        throw new Error('Missing account');
      }
      let tokenId = tokenID || PRV_ID;
      const account = this.getAccount(defaultAccount, wallet);
      let unspentCoins = await account.getListUnspentCoinsStorage(tokenId);
      unspentCoins = unspentCoins.map(
        ({ Value, SerialNumber, SNDerivator }) => ({
          Value,
          SerialNumber,
          SNDerivator,
        }),
      );
      const spentCoins = await this.getListAccountSpentCoins(
        defaultAccount,
        wallet,
      );
      return {
        unspentCoins,
        totalCoins: await account.getTotalCoinsStorage(tokenId),
        spendingCoins: await account.getSpendingCoinsStorageByTokenId(tokenId),
        coinsStorage: await account.getCoinsStorage(tokenId),
        spentCoins,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getListAccountSpentCoins(defaultAccount, wallet, tokenID) {
    try {
      if (!wallet) {
        throw new Error('Missing wallet');
      }
      if (!defaultAccount) {
        throw new Error('Missing account');
      }
      let tokenId = tokenID || PRV_ID;
      const account = this.getAccount(defaultAccount, wallet);
      const spentCoins = await account.getListSpentCoinsStorage(tokenId);
      return spentCoins || [];
    } catch (error) {
      throw error;
    }
  }

  static async removeCacheBalance(defaultAccount, wallet) {
    try {
      if (!wallet) {
        throw new Error('Missing wallet');
      }
      if (!defaultAccount) {
        throw new Error('Missing account');
      }
      const account = this.getAccount(defaultAccount, wallet);
      account.setStorageServices(storage);
      const followTokens = account
        .listFollowingTokens()
        .map((token) => token?.ID);
      const allTokens = [...followTokens, PRV.id];
      let task = allTokens.map(async (tokenId) => {
        const totalCoinsKey = account.getKeyTotalCoinsStorageByTokenId(tokenId);
        const unspentCoinsKey = account.getKeyListUnspentCoinsByTokenId(
          tokenId,
        );
        const spendingCoinsKey = account.getKeySpendingCoinsStorageByTokenId(
          tokenId,
        );
        const storageCoins = account.getKeyCoinsStorageByTokenId(tokenId);
        const spentCoinsKey = account.getKeyListSpentCoinsByTokenId(tokenId);
        return [
          account.clearAccountStorage(totalCoinsKey),
          account.clearAccountStorage(unspentCoinsKey),
          account.clearAccountStorage(spendingCoinsKey),
          account.clearAccountStorage(storageCoins),
          account.clearAccountStorage(spentCoinsKey),
          account.clearAccountStorage(account.getOTAKey()),
        ];
      });
      await Promise.all(task);
    } catch (error) {
      throw error;
    }
  }
}
