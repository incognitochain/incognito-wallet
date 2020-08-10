import { CONSTANT_COMMONS } from '@src/constants';
import tokenService from '@src/services/wallet/tokenService';
import { getpTokenHistory } from '@src/services/api/history';
import { accountSeleclor, selectedPrivacySeleclor } from '@src/redux/selectors';
import { loadHistoryByAccount } from '@src/services/wallet/WalletService';

export const combineHistory = (
  histories,
  historiesFromApi,
  symbol,
  externalSymbol,
  decimals,
  pDecimals,
) => {
  const data = [];

  historiesFromApi &&
    historiesFromApi.forEach(h => {
      data.push({
        id: h?.id,
        inchainTx: h?.inchainTx,
        outchainTx: h?.outchainTx,
        time: h?.updatedAt,
        type: h?.addressType,
        toAddress: h?.userPaymentAddress,
        fromAddress: h?.userPaymentAddress,
        amount: h?.incognitoAmount,
        requestedAmount: h?.requestedAmount,
        symbol: externalSymbol,
        decimals,
        pDecimals,
        status: h?.statusText,
        statusCode: h?.status,
        cancelable: h?.cancelable,
        currencyType: h?.currencyType,
        decentralized: h?.decentralized,
        walletAddress: h?.walletAddress,
        privacyTokenAddress: h?.privacyTokenAddress,
        erc20TokenAddress: h?.erc20TokenAddress,
        userPaymentAddress: h?.userPaymentAddress,
        canRetryExpiredDeposit: h?.canRetryExpiredDeposit,
        expiredAt: h?.expiredAt,
        depositAddress: h?.depositTmpAddress,
      });
    });

  histories &&
    histories.forEach(h => {
      data.push({
        id: h?.txID,
        incognitoTxID: h?.txID,
        time: h?.time,
        type: h?.isIn
          ? CONSTANT_COMMONS.HISTORY.TYPE.RECEIVE
          : CONSTANT_COMMONS.HISTORY.TYPE.SEND,
        toAddress: h?.receivers?.length && h?.receivers[0],
        amount: h?.amountPToken,
        symbol: h?.tokenSymbol,
        decimals,
        pDecimals,
        status: h?.status,
        fee: h?.feeNativeToken,
        feePToken: h?.feePToken,
      });
    });

  return data.sort((a, b) =>
    new Date(a.time).getTime() < new Date(b.time).getTime() ? 1 : -1,
  );
};

export const normalizeData = (histories, decimals, pDecimals) =>
  histories &&
  histories.map(h => ({
    id: h?.txID,
    incognitoTxID: h?.txID,
    time: h?.time,
    type: h?.isIn
      ? CONSTANT_COMMONS.HISTORY.TYPE.RECEIVE
      : CONSTANT_COMMONS.HISTORY.TYPE.SEND,
    toAddress: h?.receivers?.length && h?.receivers[0],
    amount: h?.amountNativeToken,
    symbol: CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV,
    status: h?.status,
    fee: h?.feeNativeToken,
    decimals,
    pDecimals,
    metaDataType: h?.metaData?.Type,
  }));

export const loadTokenHistory = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const wallet = state?.wallet;
    const account = accountSeleclor.defaultAccount(state);
    const token = selectedPrivacySeleclor.selectedPrivacyByFollowedSelector(
      state,
    );
    if (!wallet) {
      throw new Error('Wallet is not exist to load history');
    }
    if (!account) {
      throw new Error('Account is not exist to load history');
    }
    const histories = await tokenService.getTokenHistory({
      wallet,
      account,
      token,
    });
    return histories;
  } catch (e) {
    throw e;
  }
};

export const getHistoryFromApi = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const selectedPrivacy = selectedPrivacySeleclor.selectedPrivacy(state);
    const { isDeposable, isWithdrawable, paymentAddress } = selectedPrivacy;
    if (!isWithdrawable || !isDeposable) {
      return;
    }
    return await getpTokenHistory({
      paymentAddress,
      tokenId: selectedPrivacy?.tokenId,
    });
  } catch (e) {
    throw e;
  }
};

export const loadAccountHistory = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const wallet = state?.wallet;
    const accountName = accountSeleclor.defaultAccountNameSelector(state);
    if (!wallet) {
      throw new Error('Wallet is not exist to load history');
    }
    if (!accountName) {
      throw new Error('Account is not exist to load history');
    }
    const histories = await loadHistoryByAccount(wallet, accountName);
    return histories;
  } catch (e) {
    throw e;
  }
};
