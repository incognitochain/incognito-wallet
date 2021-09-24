import { CONSTANT_COMMONS } from '@src/constants';
import tokenService from '@src/services/wallet/tokenService';
import { getpTokenHistory } from '@src/services/api/history';
import { accountSelector, selectedPrivacySelector } from '@src/redux/selectors';
import { loadHistoryByAccount } from '@src/services/wallet/WalletService';
import { getFeeFromTxHistory } from '@src/screens/Wallet/features/TxHistoryDetail/TxHistoryDetail.utils';
import { endsWith, isEmpty, uniqBy } from 'lodash';
import { DECENTRALIZED_RECEIVE_TYPES } from '@models/history';

export const normalizeHistoriesFromApi = ({
  historiesFromApi = [],
  externalSymbol,
  symbol,
  decimals,
  pDecimals,
}) =>
  (historiesFromApi &&
    historiesFromApi.map((h) => {
      const history = {
        ...h,
        time: h?.createdAt,
        type: h?.addressType,
        toAddress: h?.userPaymentAddress,
        fromAddress: h?.userPaymentAddress,
        amount: h?.incognitoAmount,
        symbol: externalSymbol || symbol,
        decimals,
        pDecimals,
        status: h?.statusText,
        statusCode: h?.status,
        depositAddress: h?.depositTmpAddress,
        fromApi: true,
        decentralized: h?.decentralized,
      };
      return history;
    })) ||
  [];

const isDecentralizedTx = (history) => {
  let isDecentralized = false;
  if (
    !!history?.metaDataType &&
    DECENTRALIZED_RECEIVE_TYPES.includes(history?.metaDataType)
  ) {
    isDecentralized = true;
  }
  return isDecentralized;
};

const normalizedHistories = ({
  histories = [],
  historiesNormalizedFromApi = [],
  externalSymbol,
  symbol,
  pDecimals,
  decimals,
}) => {
  let _histories = [];
  let _historiesFromApi = [...historiesNormalizedFromApi];
  histories &&
    histories.map((h) => {
      if (h?.isHistoryReceived) {
        const metaData = h?.metaData;
        const typeOf = metaData?.Type;
        switch (typeOf) {
        case 25:
        case 251:
        case 271:
        case 273:
        case 81: {
          const requestTxId = metaData?.RequestedTxID;
          const index = _historiesFromApi.findIndex(
            (history) => history?.incognitoTx === requestTxId,
          );
          const txFromApi = _historiesFromApi[index];
          if (txFromApi) {
            // if (!txFromApi?.isShieldTx) {
            //   //Trade tx
            //   _historiesFromApi[index].typeOf = 'Trade';
            // }
            return;
          }
          break;
        }
        default:
          break;
        }
        return _histories.push(h);
      }
      let history = {
        id: h?.txID,
        incognitoTxID: h?.txID,
        time: h?.time,
        type: h?.isIn
          ? CONSTANT_COMMONS.HISTORY.TYPE.RECEIVE
          : CONSTANT_COMMONS.HISTORY.TYPE.SEND,
        toAddress: h?.receivers?.length && h?.receivers[0],
        amount: h?.amountPToken,
        symbol: externalSymbol || symbol || h?.tokenSymbol,
        decimals,
        pDecimals,
        status: h?.status,
        fee: Number(h?.feeNativeToken),
        feePToken: Number(h?.feePToken),
        isIncognitoTx: true,
        metaDataType: h?.metaData?.Type,
        memo: h?.info || h?.memo,
      };
      const { indexTx, historyFromApi } = normalizedHistory(
        _historiesFromApi,
        history,
      );
      if (indexTx > -1 && !!historyFromApi) {
        _historiesFromApi[indexTx] = {
          ...historyFromApi,
          isUnshieldTx: true,
        };
        return null;
      }
      _histories.push(history);
      return history;
    });
  const mergeHistories = [..._historiesFromApi, ..._histories];
  return mergeHistories;
};

const normalizedHistory = (histories = [], history = {}) => {
  const isDecentralized = isDecentralizedTx(history);
  let indexTx = histories.findIndex(
    (item) => item?.incognitoTxID === history?.incognitoTxID,
  );
  const { fee, isUseTokenFee } = getFeeFromTxHistory(history);
  let historyFromApi;
  if (indexTx === -1) {
    return {
      indexTx,
      historyFromApi,
    };
  }
  if (!isDecentralized) {
    historyFromApi = histories[indexTx];
    let amount;
    if (
      !historyFromApi?.amount ||
      history?.status === CONSTANT_COMMONS.HISTORY.STATUS_CODE.PENDING
    ) {
      amount = isUseTokenFee
        ? history?.amount - fee - historyFromApi?.tokenFee
        : history?.amount;
    } else {
      amount = isUseTokenFee
        ? historyFromApi?.amount - fee
        : historyFromApi?.amount;
    }
    historyFromApi = {
      ...historyFromApi,
      amount: Math.max(amount, 0),
    };
  } else {
    historyFromApi = histories[indexTx];
    historyFromApi = {
      ...historyFromApi,
      burnTokenFee: isUseTokenFee ? fee : 0,
      burnPrivacyFee: isUseTokenFee ? 0 : fee,
    };
  }
  return {
    indexTx,
    historyFromApi,
  };
};

export const combineHistory = (payload) => {
  let mergedHistories = [];
  try {
    const historiesNormalizedFromApi = normalizeHistoriesFromApi(payload);
    mergedHistories = normalizedHistories({
      ...payload,
      historiesNormalizedFromApi,
    }).sort((a, b) =>
      new Date(a.time).getTime() < new Date(b.time).getTime() ? 1 : -1,
    );
  } catch (error) {
    console.debug(error);
  }
  return mergedHistories;
};

export const normalizeData = (histories = [], decimals, pDecimals) =>
  histories &&
  histories.map((h) =>
    h?.isHistoryReceived
      ? {
        ...h,
      }
      : {
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
        fee: Number(h?.feeNativeToken),
        decimals,
        pDecimals,
        metaDataType: h?.metaData?.Type,
        isIncognitoTx: true,
        memo: h?.info,
      },
  );

export const loadTokenHistory = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const wallet = state?.wallet;
    const account = accountSelector.defaultAccount(state);
    const token = selectedPrivacySelector.selectedPrivacyByFollowedSelector(
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

export const loadTokenHistoryWithToken = (token) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const wallet = state?.wallet;
    const account = accountSelector.defaultAccount(state);

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
    return [];
  }
};

export const getHistoryFromApi = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const selectedPrivacy = selectedPrivacySelector.selectedPrivacy(state);
    const signPublicKeyEncode = accountSelector.signPublicKeyEncodeSelector(
      state,
    );
    const { isDeposable, isWithdrawable, paymentAddress } = selectedPrivacy;
    if (!isWithdrawable || !isDeposable) {
      return;
    }
    return await getpTokenHistory({
      paymentAddress,
      tokenId: selectedPrivacy?.tokenId,
      signPublicKeyEncode,
    });
  } catch (e) {
    throw e;
  }
};

export const loadAccountHistory = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const wallet = state?.wallet;
    const accountName = accountSelector.defaultAccountNameSelector(state);
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

export const getTypeHistoryReceive = ({ spentCoins, serialNumbers }) => {
  let type = CONSTANT_COMMONS.HISTORY.TYPE.RECEIVE;
  if (!serialNumbers) {
    return type;
  }
  if (serialNumbers && spentCoins) {
    try {
      let indexType = spentCoins.findIndex((item) => {
        return serialNumbers?.includes(item?.SerialNumber);
      });
      if (indexType > -1) {
        type = CONSTANT_COMMONS.HISTORY.TYPE.SEND;
      }
    } catch (error) {
      throw error;
    }
  }
  return type;
};

export const handleFilterHistoryReceiveByTokenId = ({ tokenId, histories }) => {
  let result = histories;
  try {
    result = result
      .filter((history) => {
        const receivedAmounts = history?.ReceivedAmounts;
        const isTokenExisted = Object.keys(receivedAmounts)?.includes(tokenId);
        return isTokenExisted;
      })
      .map((history) => {
        const receivedAmounts = history?.ReceivedAmounts;
        const serialNumbers = history?.InputSerialNumbers[tokenId] || [];
        const metaData = history?.Metadata
          ? JSON.parse(history?.Metadata)
          : null;
        let amount = 0;
        let hasOutputs = false;
        let hasInputs = !isEmpty(serialNumbers);

        try {
          for (let id in receivedAmounts) {
            if (id === tokenId) {
              const item = receivedAmounts[id][0];
              amount = item?.CoinDetails?.Value;
              id !== CONSTANT_COMMONS.PRV.id ? (hasOutputs = true) : false;
              break;
            }
          }
        } catch (error) {
          console.debug('ERROR', error);
        }
        const isMintedToken = !hasInputs && !!hasOutputs;
        const payload = {
          txID: history?.Hash,
          time: endsWith(history?.LockTime, 'Z')
            ? history?.LockTime
            : `${history?.LockTime}Z`,
          isPrivacy: history?.IsPrivacy,
          amount,
          tokenId,
          serialNumbers,
          metaData,
          privacyCustomTokenProofDetail: history?.PrivacyCustomTokenProofDetail,
          isMintedToken,
        };
        return payload;
      });
  } catch (error) {
    throw error;
  }
  return uniqBy(result, (item) => item?.txID);
};

export const mergeReceiveAndLocalHistory = ({
  localHistory = [],
  receiveHistory = [],
}) => {
  let allHistory = [...localHistory, ...receiveHistory];
  let _localHistory = [...localHistory];
  try {
    allHistory.map((history) => {
      if (history?.isHistoryReceived) {
        const metaData = history?.metaData;
        const typeOf = metaData?.Type;
        let txId;
        switch (typeOf) {
        case 45: //Node withdraw
          txId = metaData?.TxRequest;
          break;
        case 94: //Remove liquidity
          txId = metaData?.RequestedTxID;
          break;
        default:
          break;
        }
        if (!typeOf && history?.isMintedToken) {
          txId = history?.txID;
        }
        if (txId) {
          _localHistory = _localHistory.filter((item) => item?.txID !== txId);
        }
      }
      return history;
    });
  } catch (error) {
    console.debug('MERGE_RECEIVE_AND_LOCAL_HISTORY', error);
  }
  return [..._localHistory, ...receiveHistory];
};
