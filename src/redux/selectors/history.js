import orderBy from 'lodash/orderBy';
import {
  Validator,
  ACCOUNT_CONSTANT,
  PRVIDSTR
} from 'incognito-chain-web-js/build/wallet';
import { createSelector } from 'reselect';
import formatUtil from '@src/utils/format';
import { decimalDigitsSelector } from '@src/screens/Setting';
import LinkingService from '@src/services/linking';
import {
  getStatusColorShield,
  getStatusColorUnshield,
  TX_STATUS_COLOR,
  getPortalStatusColor,
  getPortalStatusDetail,
} from '@src/redux/utils/history';
import { PRV } from '@src/constants/common';
import { CONSTANT_CONFIGS, CONSTANT_COMMONS } from '@src/constants';
import { selectedPrivacy } from './selectedPrivacy';
import { burnerAddressSelector } from './account';

const renderAmount = (params) => {
  const { amount, pDecimals, decimalDigits } = params;
  let amountStr = '';
  if (!amount) {
    return amountStr;
  }
  try {
    new Validator('pDecimals', pDecimals).number();
    new Validator('decimalDigits', decimalDigits).boolean();
    amountStr = formatUtil.amount(amount, pDecimals, true, decimalDigits);
  } catch (error) {
    amountStr = '';
  }
  return amountStr;
};

export const historySelector = createSelector(
  (state) => state.history,
  (history) => history,
);

// txs transactor

export const mappingTxTransactorSelector = createSelector(
  selectedPrivacy,
  decimalDigitsSelector,
  (selectedPrivacy, decimalDigits) => (txt) => {
    new Validator('txt', txt).required().object();
    const { pDecimals, symbol } = selectedPrivacy;
    let { time, amount, fee, status } = txt;
    const timeStr = formatUtil.formatDateTime(time);
    const amountStr = renderAmount({
      amount,
      pDecimals,
      decimalDigits,
    });
    const result = {
      ...txt,
      feeStr: renderAmount({
        amount: fee,
        pDecimals: PRV.pDecimals,
        decimalDigits: false,
      }),
      amountStr,
      timeStr,
      statusColor: TX_STATUS_COLOR[status],
      symbol,
    };
    return result;
  },
);

export const historyTransactorSelector = createSelector(
  historySelector,
  mappingTxTransactorSelector,
  ({ txsTransactor }, mappingTxt) =>
    txsTransactor.map((txt) => mappingTxt(txt)),
);

// txs receiver

export const mappingTxReceiverSelector = createSelector(
  selectedPrivacy,
  decimalDigitsSelector,
  ({ pDecimals }, decimalDigits) => (txr) => {
    const result = {
      ...txr,
      timeStr: formatUtil.formatDateTime(txr?.time),
      amountStr: renderAmount({
        amount: txr?.amount,
        pDecimals,
        decimalDigits,
      }),
      statusColor: TX_STATUS_COLOR[(txr?.status)],
    };
    return result;
  },
);

export const historyReceiverSelector = createSelector(
  historySelector,
  mappingTxReceiverSelector,
  ({ txsReceiver }, mappingTxr) => txsReceiver.map((txr) => mappingTxr(txr)),
);

// txs ptoken

export const mappingTxPTokenSelector = createSelector(
  selectedPrivacy,
  decimalDigitsSelector,
  ({ pDecimals, symbol, decimals, tokenId }, decimalDigits) => (txp) => {
    const {
      status,
      currencyType,
      time,
      incognitoAmount,
      statusMessage,
      isShieldTx,
      decentralized,
      expiredAt,
      statusDetail,
      isExpiredShieldCentralized,
      isShielding,
      inchainFee,
      outchainFee,
      receivedAmount,
      tokenFee,
    } = txp;
    const shouldRenderQrShieldingAddress =
      isShieldTx &&
      (isShielding ||
        isExpiredShieldCentralized ||
        (status === 17 && currencyType !== 1 && currencyType !== 3));
    const expiredAtStr = decentralized
      ? ''
      : formatUtil.formatDateTime(expiredAt);
    const statusColor = isShieldTx
      ? getStatusColorShield(txp)
      : getStatusColorUnshield(txp);
    const showDetail = !!statusDetail;
    let receivedFundsStr =
      isShieldTx && receivedAmount
        ? renderAmount({
          amount: receivedAmount,
          pDecimals: decimals,
          decimalDigits,
        })
        : '';
    const shieldingFeeStr =
      isShieldTx && tokenFee
        ? renderAmount({
          amount: tokenFee,
          pDecimals: decimals,
          decimalDigits,
        })
        : '';
    const network = tokenId === PRVIDSTR && currencyType && currencyType !== 0 
      ? CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_NAME[currencyType]
      : '';
    const result = {
      ...txp,
      timeStr: formatUtil.formatDateTime(time),
      amountStr: renderAmount({
        amount: incognitoAmount,
        pDecimals,
        decimalDigits,
      }),
      statusStr: statusMessage,
      symbol,
      shouldRenderQrShieldingAddress,
      isShielding,
      expiredAtStr,
      statusColor,
      showDetail,
      inchainFeeStr: renderAmount({
        amount: inchainFee,
        pDecimals: PRV.pDecimals,
        decimalDigits,
      }),
      outchainFeeStr: renderAmount({
        amount: outchainFee,
        pDecimals: PRV.pDecimals,
        decimalDigits,
      }),
      receivedFundsStr,
      shieldingFeeStr,
      network,
    };
    return result;
  },
);

export const historyPTokenSelector = createSelector(
  historySelector,
  mappingTxPTokenSelector,
  (history, mappingTxPToken) =>
    history.txsPToken.map((txp) => mappingTxPToken(txp)),
);

export const mappingTxPortalSelector = createSelector(
  selectedPrivacy,
  decimalDigitsSelector,
  ({ pDecimals, symbol }, decimalDigits) => (txp) => {
    const {
      amount,
      fee,
      time,
      txType,
      externalFee,
      txId,
      reqTxID,
      externalTxID,
    } = txp;

    const isShieldTx = txType === ACCOUNT_CONSTANT.TX_TYPE.SHIELDPORTAL;
    const statusColor = getPortalStatusColor(txp);
    const statusDetail = getPortalStatusDetail(txp);
    let inchainTxId = isShieldTx ? reqTxID : txId;
    let result = {
      ...txp,
      timeStr: formatUtil.formatDateTime(time),
      amountStr: renderAmount({
        amount,
        pDecimals,
        decimalDigits,
      }),
      symbol,
      statusColor,
      statusDetail,
      inchainTx: inchainTxId ? `${CONSTANT_CONFIGS.EXPLORER_CONSTANT_CHAIN_URL}/tx/${inchainTxId}` : '',
      outchainTx: externalTxID ? `${CONSTANT_CONFIGS.BTC_EXPLORER_URL}/tx/${externalTxID}` : '', 
    };

    if (!isShieldTx) {
      result = {
        ...result,
        inchainFeeStr: renderAmount({
          amount: fee,
          pDecimals: PRV.pDecimals,
          decimalDigits,
        }),
        outchainFeeStr: renderAmount({
          amount: externalFee,
          pDecimals,
          decimalDigits,
        }),
      };
    }
    return result;
  },
);

export const historyPortalSelector = createSelector(
  historySelector,
  mappingTxPortalSelector,
  (history, mappingTxPortal) =>
    history.txsPortal.map((txp) => mappingTxPortal(txp)),
);

export const historyTxsSelector = createSelector(
  historySelector,
  historyTransactorSelector,
  historyReceiverSelector,
  historyPTokenSelector,
  historyPortalSelector,
  (history, txsTransactor, txsReceiver, txsPToken, txsPortal) => {
    const { isFetching, isFetched } = history;
    const histories = [...txsTransactor, ...txsReceiver, ...txsPToken, ...txsPortal] || [];
    const sort = orderBy(histories, 'time', 'desc');
    return {
      ...history,
      isEmpty: histories.length === 0 && !isFetching && isFetched,
      refreshing: isFetching && isFetched,
      oversize: true,
      histories: [...sort],
      loading: isFetching && !isFetched,
    };
  },
);

export const historyDetailSelector = createSelector(
  historySelector,
  ({ detail }) => detail,
);

export const historyDetailFactoriesSelector = createSelector(
  historyDetailSelector,
  selectedPrivacy,
  burnerAddressSelector,
  ({ tx }, selectedPrivacy, burnerAddress) => {
    const { txType } = tx;
    try {
      switch (txType) {
      case ACCOUNT_CONSTANT.TX_TYPE.RECEIVE: {
        const {
          txId,
          statusColor,
          amount,
          time,
          timeStr,
          status,
          statusStr,
          txTypeStr,
          memo,
        } = tx;
        return [
          {
            label: 'TxID',
            value: `#${txId}`,
            copyable: true,
            openUrl: !!txId,
            handleOpenUrl: () =>
              LinkingService.openUrl(
                `${CONSTANT_CONFIGS.EXPLORER_CONSTANT_CHAIN_URL}/tx/${txId}`,
              ),
            disabled: !txId,
          },
          {
            label: 'Receive',
            value: `${tx?.amountStr} ${selectedPrivacy.symbol}`,
            disabled: !amount,
          },
          {
            label: 'Status',
            value: statusStr,
            valueTextStyle: { color: statusColor },
            disabled: !status,
          },
          {
            label: 'Time',
            value: timeStr,
            disabled: !time,
          },
          {
            label: 'Type',
            value: txTypeStr,
            disabled: !txTypeStr,
          },
          {
            label: 'Memo',
            value: memo,
            disabled: !memo,
            copyable: true,
            fullText: true,
          },
        ];
      }
      case ACCOUNT_CONSTANT.TX_TYPE.SHIELD: {
        const {
          id,
          statusStr,
          timeStr,
          amountStr,
          symbol,
          inChainTx,
          expiredAtStr,
          userPaymentAddress,
          statusColor,
          isShielding,
          statusDetail,
          showDetail,
          erc20TokenAddress,
          canResumeExpiredShield,
          outChainTx,
          receivedFundsStr,
          shieldingFeeStr,
          txReceive,
          canRetryInvalidAmountShield,
          network
        } = tx;
        return [
          {
            label: 'ID',
            value: `#${id}`,
            copyable: true,
            disabled: !id,
          },
          {
            label: 'Shield',
            value: `${amountStr} ${symbol}`,
            disabled: !amountStr,
          },
          {
            label: 'Received funds',
            value: `${receivedFundsStr} ${symbol}`,
            disabled: !receivedFundsStr,
          },
          {
            label: 'Shielding fee',
            value: `${shieldingFeeStr} ${symbol}`,
            disabled: !shieldingFeeStr,
          },
          {
            label: 'Received tx',
            value: `${txReceive}`,
            disabled: !txReceive,
            openUrl: !!txReceive,
            handleOpenUrl: () => LinkingService.openUrl(txReceive),
          },
          {
            label: 'Status',
            value: statusStr,
            disabled: !statusStr,
            valueTextStyle: { color: statusColor },
            detail: statusDetail,
            showDetail,
            canResumeExpiredShield,
            canRetryInvalidAmountShield,
          },
          {
            label: 'Time',
            value: timeStr,
            disabled: !timeStr,
          },
          {
            label: 'Expired at',
            value: expiredAtStr,
            disabled: !expiredAtStr || !isShielding,
          },
          {
            label: 'To address',
            value: userPaymentAddress,
            disabled: !userPaymentAddress,
            copyable: true,
          },
          {
            label: 'Inchain TxID',
            value: inChainTx,
            disabled: !inChainTx,
            openUrl: !!inChainTx,
            handleOpenUrl: () => LinkingService.openUrl(inChainTx),
          },
          {
            label: 'Outchain TxID',
            value: outChainTx,
            disabled: !outChainTx,
            openUrl: !!outChainTx,
            handleOpenUrl: () => LinkingService.openUrl(outChainTx),
          },
          {
            label: 'Contract',
            value: erc20TokenAddress,
            copyable: true,
            disabled: !erc20TokenAddress,
          },
          {
            label: 'Coin',
            value: symbol,
            disabled: !symbol,
          },
          {
            label: 'Network',
            value: network,
            disabled: !network,
          },
        ];
      }
      case ACCOUNT_CONSTANT.TX_TYPE.UNSHIELD: {
        const {
          id,
          statusStr,
          timeStr,
          amountStr,
          symbol,
          inChainTx,
          expiredAtStr,
          userPaymentAddress,
          statusColor,
          statusDetail,
          showDetail,
          erc20TokenAddress,
          outChainTx,
          inchainFee,
          outchainFee,
          inchainFeeStr,
          outchainFeeStr,
          memo,
          network,
        } = tx;
        
        return [
          {
            label: 'ID',
            value: `#${id}`,
            copyable: true,
            disabled: !id,
          },
          {
            label: 'Unshield',
            value: `${amountStr} ${symbol}`,
            disabled: !amountStr,
          },
          {
            label: 'Inchain fee',
            value: `${inchainFeeStr} ${PRV.symbol}`,
            disabled: !inchainFee || !inchainFeeStr,
          },
          {
            label: 'Outchain fee',
            value: `${outchainFeeStr} ${PRV.symbol}`,
            disabled: !outchainFee,
          },
          {
            label: 'Status',
            value: statusStr,
            disabled: !statusStr,
            valueTextStyle: { color: statusColor },
            detail: statusDetail,
            showDetail,
          },
          {
            label: 'Time',
            value: timeStr,
            disabled: !timeStr,
          },
          {
            label: 'Expired at',
            value: expiredAtStr,
            disabled: !expiredAtStr,
          },
          {
            label: 'To address',
            value: userPaymentAddress,
            disabled: !userPaymentAddress,
            copyable: true,
          },
          {
            label: 'Inchain TxID',
            value: inChainTx,
            disabled: !inChainTx,
            openUrl: !!inChainTx,
            handleOpenUrl: () => LinkingService.openUrl(inChainTx),
          },
          {
            label: 'Outchain TxID',
            value: outChainTx,
            disabled: !outChainTx,
            openUrl: !!outChainTx,
            handleOpenUrl: () => LinkingService.openUrl(outChainTx),
          },
          {
            label: 'Contract',
            value: erc20TokenAddress,
            copyable: true,
            disabled: !erc20TokenAddress,
          },
          {
            label: 'Memo',
            value: memo,
            copyable: true,
            disabled: !memo,
          },
          {
            label: 'Coin',
            value: symbol,
            disabled: !symbol,
          },
          {
            label: 'Network',
            value: network,
            disabled: !network,
          },
        ];
      }
      case ACCOUNT_CONSTANT.TX_TYPE.SHIELDPORTAL: {
        const {
          statusStr,
          timeStr,
          amountStr,
          symbol,
          statusColor,
          inchainTx,
          outchainTx,
          incognitoAddress,
          statusDetail
        } = tx;
        return [
          {
            label: 'Shield',
            value: `${amountStr} ${symbol}`,
            disabled: !amountStr,
          },
          {
            label: 'Status',
            value: statusStr,
            disabled: !statusStr,
            valueTextStyle: { color: statusColor },
            detail: statusDetail,
            showDetail: !!statusDetail,
          },
          {
            label: 'Time',
            value: timeStr,
            disabled: !timeStr,
          },
          {
            label: 'To address',
            value: incognitoAddress,
            disabled: !incognitoAddress,
            copyable: true,
          },
          {
            label: 'Inchain TxID',
            value: inchainTx,
            disabled: !inchainTx,
            openUrl: !!inchainTx,
            handleOpenUrl: () => LinkingService.openUrl(inchainTx),
          },
          {
            label: 'Outchain TxID',
            value: outchainTx,
            disabled: !outchainTx,
            openUrl: !!outchainTx,
            handleOpenUrl: () => LinkingService.openUrl(outchainTx),
          },
          {
            label: 'Coin',
            value: symbol,
            disabled: !symbol,
          },
        ];
      }
      case ACCOUNT_CONSTANT.TX_TYPE.UNSHIELDPORTAL: {
        const {
          statusStr,
          timeStr,
          amountStr,
          symbol,
          statusColor,
          inchainFeeStr,
          outchainFeeStr,
          inchainTx,
          outchainTx,
          externalAddress,
          incognitoAddress,
          statusDetail,
          txId,
        } = tx;
      
        return [
          {
            label: 'Unshield',
            value: `${amountStr} ${symbol}`,
            disabled: !amountStr,
          },
          {
            label: 'Inchain fee',
            value: `${inchainFeeStr} ${PRV.symbol}`,
            disabled: !inchainFeeStr,
          },
          {
            label: 'Outchain fee',
            value: `${outchainFeeStr} ${symbol}`,
            disabled: !outchainFeeStr,
          },
          {
            label: 'Status',
            value: statusStr,
            disabled: !statusStr,
            valueTextStyle: { color: statusColor },
            // detail: statusDetail,
            // showDetail: !!statusDetail,
          },
          {
            label: 'Time',
            value: timeStr,
            disabled: !timeStr,
          },
          {
            label: 'From address',
            value: incognitoAddress,
            disabled: !incognitoAddress,
            copyable: true,
          },
          {
            label: 'To address',
            value: externalAddress,
            disabled: !externalAddress,
            copyable: true,
          },
          inchainTx ? 
            {
              label: 'Inchain TxID',
              value: inchainTx,
              disabled: !inchainTx,
              openUrl: !!inchainTx,
              handleOpenUrl: () => LinkingService.openUrl(inchainTx),
            } :
            {
              label: 'TxID',
              value: txId,
              disabled: !txId,
              copyable: true,
            },
          {
            label: 'Outchain TxID',
            value: outchainTx,
            disabled: !outchainTx,
            openUrl: !!outchainTx,
            handleOpenUrl: () => LinkingService.openUrl(outchainTx),
          },
          {
            label: 'Coin',
            value: symbol,
            disabled: !symbol,
          },
        ];
      }
      default: {
        const {
          fee,
          receiverAddress,
          memo,
          txTypeStr,
          txId,
          statusColor,
          amount,
          time,
          timeStr,
          status,
          statusStr,
          senderSeal,
        } = tx;
        let factories = [
          {
            label: 'TxID',
            value: `#${txId}`,
            copyable: true,
            openUrl: !!txId,
            handleOpenUrl: () =>
              LinkingService.openUrl(
                `${CONSTANT_CONFIGS.EXPLORER_CONSTANT_CHAIN_URL}/tx/${txId}`,
              ),
            disabled: !txId,
          },
          {
            label: 'Send',
            value: `${tx?.amountStr} ${selectedPrivacy.symbol}`,
            disabled: !amount,
          },
          {
            label: 'Fee',
            value: `${tx?.feeStr} ${PRV.symbol}`,
            disabled: !fee,
          },
          {
            label: 'Status',
            value: statusStr,
            valueTextStyle: { color: statusColor },
            disabled: !status,
          },
          {
            label: 'Time',
            value: timeStr,
            disabled: !time,
          },
          {
            label: 'To address',
            value: receiverAddress,
            disabled: !receiverAddress,
            copyable: true,
          },
          {
            label: 'Memo',
            value: memo,
            disabled: !memo,
            copyable: true,
            fullText: true,
          },
          {
            label: 'Type',
            value: txTypeStr,
            disabled: !txTypeStr,
          },
          {
            label: 'Sender seal',
            value: senderSeal,
            disabled: !senderSeal,
            copyable: true,
          },
        ];
        try {
          if (receiverAddress === burnerAddress) {
            let foundIndex = factories.findIndex(
              (item) => item.value === receiverAddress,
            );
            if (foundIndex > -1) {
              factories[foundIndex].label = 'Burn address';
            }
          }
        } catch {
          //
        }
        return factories;
      }
      }
    } catch (error) {
      console.log(error);
    }
    return [];
  },
);
