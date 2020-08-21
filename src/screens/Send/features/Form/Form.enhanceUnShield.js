/* eslint-disable no-unreachable */
/* eslint-disable import/no-cycle */
import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { MESSAGES, CONSTANT_KEYS, CONSTANT_COMMONS } from '@src/constants';
import { ExHandler } from '@src/services/exception';
import { Toast } from '@src/components/core';
import convert from '@src/utils/convert';
import { useSelector, useDispatch } from 'react-redux';
import { feeDataSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { floor } from 'lodash';
import format from '@src/utils/format';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { reset } from 'redux-form';
import { KEY_SAVE } from '@src/utils/LocalDatabase';
import { withdraw, updatePTokenFee } from '@src/services/api/withdraw';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { walletSelector } from '@src/redux/selectors/wallet';
import tokenService from '@services/wallet/tokenService';
import accountService from '@services/wallet/accountService';
import {
  actionAddStorageData,
  actionRemoveStorageData,
} from '@screens/UnShield';
import { formName } from './Form.enhance';

export const enhanceUnshield = (WrappedComp) => (props) => {
  const {
    isETH,
    fee,
    isUsedPRVFee,
    rate,
    feePDecimals,
    feeUnit,
    userFees,
    userFee,
    fast2x,
    totalFeeText,
  } = useSelector(feeDataSelector);
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const {
    tokenId,
    contractId,
    currencyType,
    isErc20Token,
    externalSymbol,
    paymentAddress: walletAddress,
    symbol,
    pDecimals,
    isDecentralized,
    name,
  } = selectedPrivacy;
  const { data: userFeesData } = userFees;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const account = useSelector(defaultAccountSelector);
  const wallet = useSelector(walletSelector);
  const handleBurningToken = async (payload = {}) => {
    try {
      const {
        originalAmount,
        originalFee,
        isUsedPRVFee,
        paymentAddress,
        feeForBurn,
      } = payload;
      const { FeeAddress: masterAddress } = userFeesData;
      //Token Object Decentralized
      const tokenObject = {
        Privacy: true,
        TokenID: tokenId,
        TokenName: name,
        TokenSymbol: symbol,
        TokenTxType: CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND,
        TokenAmount: originalAmount + (isUsedPRVFee ? 0 : feeForBurn),
        TokenReceivers: isUsedPRVFee
          ? []
          : [
            {
              paymentAddress: masterAddress,
              amount: userFee,
            },
          ],
      };
      const paymentInfos = isUsedPRVFee
        ? [
          {
            paymentAddressStr: masterAddress,
            amount: userFee,
          },
        ]
        : [];

      const res = await tokenService.createBurningRequest(
        tokenObject,
        isUsedPRVFee ? originalFee : 0,
        isUsedPRVFee ? 0 : originalFee,
        paymentAddress,
        account,
        wallet,
        paymentInfos,
      );
      if (res.txId) {
        return { ...res, burningTxId: res?.txId };
      } else {
        throw new Error('Burned token, but doesnt have txID, please check it');
      }
    } catch (e) {
      throw e;
    }
  };

  const handleDecentralizedWithdraw = async (payload) => {
    try {
      const { amount, originalAmount, paymentAddress } = payload;
      const amountToNumber = convert.toNumber(amount, true);
      const requestedAmount = format.toFixed(amountToNumber, pDecimals);
      let data = {
        requestedAmount,
        originalAmount,
        paymentAddress,
        walletAddress,
        tokenContractID: isETH ? '' : contractId,
        tokenId,
        burningTxId: '',
        currencyType: currencyType,
        isErc20Token: isErc20Token,
        externalSymbol: externalSymbol,
        isUsedPRVFee,
        userFeesData,
        fast2x,
      };
      if (!userFeesData?.ID) throw new Error('Missing id withdraw session');
      const tx = await handleBurningToken(payload);
      await dispatch(
        actionAddStorageData({
          keySave: KEY_SAVE.WITHDRAWAL_DATA_DECENTRALIZED,
          tx,
        }),
      );
      await withdraw({ ...data, burningTxId: tx?.txId });
      await dispatch(
        actionRemoveStorageData({
          keySave: KEY_SAVE.WITHDRAWAL_DATA_DECENTRALIZED,
          burningTxId: tx?.txId,
        }),
      );
      return tx;
    } catch (e) {
      throw e;
    }
  };

  const handleCentralizedWithdraw = async (payload) => {
    try {
      const { isUsedPRVFee, originalAmount, originalFee } = payload;
      const { Address: tempAddress } = userFeesData;
      const prvFee = isUsedPRVFee ? originalFee : 0;
      const tokenFee = isUsedPRVFee ? 0 : originalFee;
      let spendingPRV;
      let spendingCoin;
      if (prvFee) {
        spendingPRV = await accountService.hasSpendingCoins(
          account,
          wallet,
          prvFee,
        );
      }
      spendingCoin = await accountService.hasSpendingCoins(
        account,
        wallet,
        originalAmount + tokenFee,
        tokenId,
      );
      if (spendingCoin || spendingPRV) {
        return Toast.showError(MESSAGES.PENDING_TRANSACTIONS);
      }

      const tx = await handleSendToken({ ...payload, tempAddress });

      if (tx) {
        await updatePTokenFee({
          fee: originalFee,
          paymentAddress: tempAddress,
          userFeesData,
          isUsedPRVFee,
          fast2x,
          txId: tx?.txId,
        });
      }
      return tx;
    } catch (e) {
      throw e;
    }
  };

  const handleSendToken = async (payload = {}) => {
    try {
      const {
        tempAddress,
        originalAmount,
        originalFee,
        isUsedPRVFee,
        feeForBurn,
        memo,
      } = payload;
      if (!tempAddress) {
        throw Error('Can not create a temp address');
      }
      const { FeeAddress: masterAddress } = userFeesData;
      const type = CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND;
      const tokenObject = {
        Privacy: true,
        TokenID: tokenId,
        TokenName: name,
        TokenSymbol: symbol,
        TokenTxType: type,
        TokenAmount: originalAmount + (isUsedPRVFee ? 0 : feeForBurn),
        TokenReceivers: isUsedPRVFee
          ? [
            {
              PaymentAddress: tempAddress,
              Amount: originalAmount,
            },
          ]
          : [
            {
              PaymentAddress: tempAddress,
              Amount: originalAmount + feeForBurn,
            },
            {
              PaymentAddress: masterAddress,
              Amount: userFee,
            },
          ],
      };
      const paymentInfos = isUsedPRVFee
        ? [
          {
            paymentAddressStr: tempAddress,
            amount: feeForBurn,
          },
          {
            paymentAddressStr: masterAddress,
            amount: userFee,
          },
        ]
        : [];

      const res = await tokenService.createSendPToken(
        tokenObject,
        isUsedPRVFee ? originalFee : 0,
        account,
        wallet,
        isUsedPRVFee ? paymentInfos : null,
        isUsedPRVFee ? 0 : originalFee,
        memo,
      );

      if (res.txId) {
        return res;
      } else {
        throw new Error('Sent tx, but doesn\'t have txID, please check it');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUnShieldCrypto = async (values) => {
    try {
      const { amount, toAddress, memo } = values;
      const amountToNumber = convert.toNumber(amount, true);
      const originalAmount = convert.toOriginalAmount(
        amountToNumber,
        pDecimals,
        false,
      );
      const _originalAmount = floor(originalAmount);
      const originalFee = floor(fee / rate);
      const _fee = format.amountFull(originalFee * rate, feePDecimals);
      const feeForBurn = originalFee;
      const payload = {
        amount,
        originalAmount: _originalAmount,
        paymentAddress: toAddress,
        isUsedPRVFee,
        originalFee,
        memo,
        feeForBurn,
        feeForBurnText: _fee,
        fee: _fee,
      };
      let res;
      if (isDecentralized) {
        res = await handleDecentralizedWithdraw(payload);
      } else {
        res = await handleCentralizedWithdraw(payload);
      }
      if (res) {
        const params = {
          ...res,
          originalAmount: _originalAmount,
          fee: totalFeeText,
          feeUnit,
          title: 'Sent.',
          toAddress,
          pDecimals: pDecimals,
          tokenSymbol: externalSymbol || res?.tokenSymbol,
          keySaveAddressBook: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_OUT_NETWORK,
        };
        navigation.navigate(routeNames.Receipt, { params });
        await dispatch(reset(formName));
      }
    } catch (e) {
      if (e.message === MESSAGES.NOT_ENOUGH_NETWORK_FEE) {
        Toast.showError(e.message);
      } else {
        new ExHandler(
          e,
          'Something went wrong. Please try again.',
        ).showErrorToast(true);
      }
    }
  };
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, handleUnShieldCrypto }} />
    </ErrorBoundary>
  );
};
