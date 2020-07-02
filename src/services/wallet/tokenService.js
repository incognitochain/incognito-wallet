import {
  Wallet
} from 'incognito-chain-web-js/build/wallet';
import _ from 'lodash';
import tokenModel from '@src/models/token';
import storage from '@src/services/storage';
import { CONSTANT_KEYS } from '@src/constants';
import { getTokenInfo } from '@services/api/token';
import {PRIORITY_LIST} from '@screens/Dex/constants';
import { saveWallet, updateStatusHistory } from './WalletService';
import { listCustomTokens } from './RpcClientService';

export const PRV = {
  id: '0000000000000000000000000000000000000000000000000000000000000004',
  name: 'Privacy',
  displayName: 'Privacy',
  symbol: 'PRV',
  pDecimals: 9,
  hasIcon: true,
  originalSymbol: 'PRV',
  isVerified: true,
};

const BurningRequestMeta = 27;
const BurningForDepositToSCRequestMeta = 96;

export default class Token {
  // static async createSendCustomToken(param, fee, account, wallet) {
  //   await Wallet.resetProgressTx();
  //   console.log('SEND CUSTOM TOKEN!!!!!!!');

  //   // get index account by name
  //   const indexAccount = wallet.getAccountIndexByName(account.name);

  //   // prepare param for create and send token
  //   // payment info
  //   // @@ Note: it is use for receivers constant
  //   const paymentInfos = [];
  //   // for (let i = 0; i < paymentInfos.length; i++) {
  //   //   paymentInfos[i] = new PaymentInfo(/*paymentAddress, amount*/);
  //   // }

  //   // receviers token
  //   const receiverPaymentAddrStr = new Array(1);
  //   receiverPaymentAddrStr[0] = param.TokenReceivers.PaymentAddress;

  //   // token param
  //   const tokenParam = new CustomTokenParamTx();
  //   tokenParam.propertyID = param.TokenID;
  //   tokenParam.propertyName = param.TokenName;
  //   tokenParam.propertySymbol = param.TokenSymbol;
  //   tokenParam.amount = param.TokenAmount;
  //   tokenParam.tokenTxType = param.TokenTxType;
  //   tokenParam.receivers = new Array(1);
  //   tokenParam.receivers[0] = new TxTokenVout();
  //   tokenParam.receivers[0].set(
  //     KeyWallet.base58CheckDeserialize(
  //       param.TokenReceivers.PaymentAddress
  //     ).KeySet.PaymentAddress,
  //     param.TokenReceivers.Amount
  //   );

  //   console.log(tokenParam);
  //   // create and send custom token
  //   let res;
  //   try {
  //     res = await wallet.MasterAccount.child[
  //       indexAccount
  //     ].createAndSendCustomToken(
  //       paymentInfos,
  //       tokenParam,
  //       receiverPaymentAddrStr,
  //       fee
  //     );

  //     // saving KeyWallet
  //     await saveWallet(wallet);
  //   } catch (e) {
  //     throw e;
  //   }

  //   await Wallet.resetProgressTx();
  //   return res;
  // }

  static async createSendPToken(
    submitParam,
    feeNativeToken = 0,
    account,
    wallet,
    paymentInfo,
    feePToken = 0,
    info,
  ) {
    await Wallet.resetProgressTx();
    const { TokenSymbol, TokenName, TokenAmount } = submitParam;

    if (typeof TokenSymbol !== 'string' || TokenSymbol.trim() === '') throw new Error('TokenSymbol is invalid');
    if (typeof TokenName !== 'string' || TokenName.trim() === '') throw new Error('TokenName is invalid');
    if (typeof TokenAmount !== 'number' ||  TokenAmount <= 0 ) throw new Error('TokenAmount is invalid');

    // get index account by name
    const indexAccount = wallet.getAccountIndexByName(account.name || account.AccountName);

    // prepare param for create and send privacy custom token
    // payment info
    // @@ Note: it is use for receivers constant
    const paymentInfos = paymentInfo ? [paymentInfo] : [];
    // for (let i = 0; i < paymentInfos.length; i++) {
    //   paymentInfos[i] = new PaymentInfo(/*paymentAddress, amount*/);
    // }

    let response;
    const hasPrivacyForNativeToken = true;
    const hasPrivacyForPToken = true;
    const infoStr = ![undefined, null].includes(info) ? JSON.stringify(info) : undefined;

    try {
      response = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendPrivacyToken(paymentInfos, submitParam, feeNativeToken, feePToken, hasPrivacyForNativeToken, hasPrivacyForPToken, infoStr);

      await saveWallet(wallet);
    } catch (e) {
      throw e;
    }

    await Wallet.resetProgressTx();

    return response;
  }

  // remoteAddress (string) is an ETH/BTC address which users want to receive ETH/BTC (without 0x)
  static async createBurningRequest(
    submitParam,
    feeNativeToken,
    feePToken,
    remoteAddress,
    account,
    wallet
  ) {
    await Wallet.resetProgressTx();
    // get index account by name
    let indexAccount = wallet.getAccountIndexByName(account.name || account.AccountName);
    // prepare param for create and send privacy custom token
    // payment info
    // @@ Note: it is use for receivers constant
    let paymentInfos = [];
    //   paymentInfos[0] = {
    //     paymentAddressStr: submitParam.TokenReceivers.PaymentAddress,
    //     amount: 100
    //   };
    let response;
    try {
      response = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendBurningRequestTx(
        paymentInfos,
        submitParam,
        feeNativeToken,
        feePToken,
        remoteAddress
      );
      await saveWallet(wallet);
    } catch (e) {
      throw e;
    }
    await Wallet.resetProgressTx();
    return response;
  }

  // Deposit to smart contract
  static async depositToSmartContract(
    submitParam,
    feeNativeToken,
    feePToken,
    remoteAddress,
    account,
    wallet
  ) {
    await Wallet.resetProgressTx();
    let indexAccount = wallet.getAccountIndexByName(account.name || account.AccountName);
    let paymentInfos = [];
    let response;
    try {
      response = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendBurningRequestTx(
        paymentInfos,
        submitParam,
        feeNativeToken,
        feePToken,
        remoteAddress,
        BurningForDepositToSCRequestMeta,
      );
      await saveWallet(wallet);
    } catch (e) {
      throw e;
    }
    await Wallet.resetProgressTx();
    return response;
  }

  static getPrivacyTokens() {
    return getTokenInfo();
  }

  static getFollowingTokens({ account, wallet }) {
    try {
      const accountWallet = wallet.getAccountByName(account.name);
      const followingTokens = accountWallet.listFollowingTokens();

      return followingTokens;
    } catch (e) {
      throw e;
    }
  }

  static getFollowingPrivacyTokens({ account, wallet }) {
    try {
      const followingTokens = Token.getFollowingTokens({ account, wallet });

      return followingTokens.filter(
        token => token?.IsPrivacy
      );
    } catch (e) {
      throw e;
    }
  }

  static getFollowingNormalTokens({ account, wallet }) {
    try {
      const followingTokens = Token.getFollowingTokens({ account, wallet });

      return followingTokens.filter(
        token => !token?.IsPrivacy
      );
    } catch (e) {
      throw e;
    }
  }

  static async getTokenHistory({ account, wallet, token }) {
    try {
      if (!token?.id) {
        throw new Error('Token is required');
      }

      await updateStatusHistory(wallet).catch(() => console.warn('History statuses were not updated'));

      const accountWallet = wallet.getAccountByName(account.name);
      let histories = [];
      histories = await accountWallet.getPrivacyTokenTxHistoryByTokenID(token?.id);
      // if (token?.isPrivacy) {
      //   histories = await accountWallet.getPrivacyTokenTxHistoryByTokenID(token?.id);
      // } else {
      //   histories = await accountWallet.getCustomTokenTxByTokenID(token?.id);
      // }

      return histories;
    } catch (e) {
      throw e;
    }
  }

  static mergeTokens(chainTokens, pTokens) {
    return [PRV, ..._([...chainTokens, ...pTokens])
      .uniqBy(item => item.tokenId || item.id)
      .map(item => {
        const pToken = pTokens.find(token => token.tokenId === (item.tokenId || item.id ));
        return {
          ...item,
          id: item.tokenId || item.id,
          pDecimals: Math.min(pToken?.pDecimals || 0, 9),
          decimals: pToken?.decimals,
          hasIcon: !!pToken,
          symbol: pToken?.symbol || item.symbol,
          displayName: pToken ? `Privacy ${pToken.symbol}` : `Incognito ${item.name}`,
          name: pToken ? pToken.name : item.name,
          isVerified: item.verified || pToken?.verified,
        };
      })
      .orderBy([
        'hasIcon',
        item => PRIORITY_LIST.indexOf(item?.id) > -1 ? PRIORITY_LIST.indexOf(item?.id) : 100,
        item => _.isString(item.symbol) && item.symbol.toLowerCase(),
      ], ['desc', 'asc'])
      .value()];
  }

  static flatTokens(tokens) {
    const tokenDict = {};
    tokens.forEach(item => tokenDict[item.id] = item);
    return tokenDict;
  }
}

export async function getUserUnfollowTokenIDs() {
  const listRaw = await storage.getItem(CONSTANT_KEYS.USER_UNFOLLOWING_TOKEN_ID_LIST);
  return JSON.parse(listRaw) || [];
}

export async function setUserUnfollowTokenIDs(newList = []) {
  return await storage.setItem(CONSTANT_KEYS.USER_UNFOLLOWING_TOKEN_ID_LIST, JSON.stringify(newList));
}
