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
import {
  withdraw,
  updatePTokenFee,
  genCentralizedWithdrawAddress,
} from '@src/services/api/withdraw';
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
  const { fee, isUsedPRVFee, rate, feePDecimals, feeUnit } = useSelector(
    feeDataSelector,
  );
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const account = useSelector(defaultAccountSelector);
  const wallet = useSelector(walletSelector);

  const handleBurningToken = async (payload = {}) => {
    try {
      const type = CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND;
      const {
        originalAmount,
        originalFee,
        isUsedPRVFee,
        remoteAddress,
        feeForBurn,
      } = payload;
      const tokenObject = {
        Privacy: true,
        TokenID: selectedPrivacy?.tokenId,
        TokenName: selectedPrivacy?.name,
        TokenSymbol: selectedPrivacy?.symbol,
        TokenTxType: type,
        TokenAmount: originalAmount + (isUsedPRVFee ? 0 : feeForBurn),
        TokenReceivers: {
          PaymentAddress: '',
          Amount: originalAmount + (isUsedPRVFee ? 0 : feeForBurn),
        },
      };
      const res = await tokenService.createBurningRequest(
        tokenObject,
        isUsedPRVFee ? originalFee : 0,
        isUsedPRVFee ? 0 : originalFee,
        remoteAddress,
        account,
        wallet,
      );
      if (res.txId) {
        return res;
      } else {
        throw new Error('Burned token, but doesnt have txID, please check it');
      }
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
      const type = CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND;
      const tokenObject = {
        Privacy: true,
        TokenID: selectedPrivacy?.tokenId,
        TokenName: selectedPrivacy?.name,
        TokenSymbol: selectedPrivacy?.symbol,
        TokenTxType: type,
        TokenAmount: originalAmount + (isUsedPRVFee ? 0 : feeForBurn),
        TokenReceivers: [
          {
            PaymentAddress: tempAddress,
            Amount: originalAmount + (isUsedPRVFee ? 0 : feeForBurn),
          },
        ],
      };
      const paymentInfo = {
        paymentAddressStr: tempAddress,
        amount: feeForBurn,
      };
      const res = await tokenService.createSendPToken(
        tokenObject,
        isUsedPRVFee ? originalFee : 0,
        account,
        wallet,
        isUsedPRVFee ? paymentInfo : null,
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

  const handleDecentralizedWithdraw = async (payload) => {
    try {
      const { amount, originalAmount, remoteAddress } = payload;
      const tx = await handleBurningToken(payload);
      const data = {
        amount: convert.toNumber(amount, true),
        originalAmount,
        paymentAddress: remoteAddress,
        walletAddress: selectedPrivacy?.paymentAddress,
        tokenContractID: selectedPrivacy?.contractId,
        tokenId: selectedPrivacy?.tokenId,
        burningTxId: tx?.txId,
        currencyType: selectedPrivacy?.currencyType,
        isErc20Token: selectedPrivacy?.isErc20Token,
        externalSymbol: selectedPrivacy?.externalSymbol,
      };
      await dispatch(
        actionAddStorageData({
          keySave: KEY_SAVE.WITHDRAWAL_DATA_DECENTRALIZED,
          tx: data,
        }),
      );
      await withdraw(data);
      await dispatch(
        actionRemoveStorageData({
          keySave: KEY_SAVE.WITHDRAWAL_DATA_DECENTRALIZED,
          burningTxId: data?.burningTxId,
        }),
      );
      return tx;
    } catch (e) {
      throw e;
    }
  };

  const handleCentralizedWithdraw = async (payload) => {
    try {
      const {
        amount,
        isUsedPRVFee,
        remoteAddress,
        memo,
        originalAmount,
        originalFee,
      } = payload;

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
        selectedPrivacy.tokenId,
      );

      if (spendingCoin || spendingPRV) {
        return Toast.showError(MESSAGES.PENDING_TRANSACTIONS);
      }

      const walletAddress = selectedPrivacy?.paymentAddress;

      const tempAddress = await genCentralizedWithdrawAddress({
        amount,
        paymentAddress: remoteAddress,
        walletAddress,
        tokenId: selectedPrivacy?.tokenId,
        currencyType: selectedPrivacy?.currencyType,
        memo,
      });

      if (!tempAddress) {
        throw Error('Can not create a temp address');
      }
      const tx = await handleSendToken({ ...payload, tempAddress });
      if (tx && !isUsedPRVFee) {
        await updatePTokenFee({
          fee: originalFee,
          paymentAddress: tempAddress,
        });
      }
      return tx;
    } catch (e) {
      throw e;
    }
  };

  const handleUnShieldCrypto = async (values) => {
    try {
      const { amount, toAddress, memo } = values;
      const amountToNumber = convert.toNumber(amount, true);
      const originalAmount = convert.toOriginalAmount(
        amountToNumber,
        selectedPrivacy?.pDecimals,
        false,
      );
      const _originalAmount = floor(originalAmount);
      const originalFee = floor(fee / rate);
      const _fee = format.amountFull(originalFee * rate, feePDecimals);
      const feeForBurn = originalFee;
      const remoteAddress = toAddress;
      const payload = {
        amount,
        originalAmount: _originalAmount,
        remoteAddress,
        isUsedPRVFee,
        originalFee,
        memo,
        feeForBurn,
        feeForBurnText: _fee,
        fee: _fee,
      };
      let res;
      if (selectedPrivacy?.isDecentralized) {
        res = await handleDecentralizedWithdraw(payload);
      } else {
        res = await handleCentralizedWithdraw(payload);
      }
      if (res) {
        const params = {
          ...res,
          originalAmount: _originalAmount,
          fee: _fee,
          feeUnit,
          title: 'Sent.',
          toAddress,
          pDecimals: selectedPrivacy?.pDecimals,
          tokenSymbol: selectedPrivacy?.externalSymbol || res?.tokenSymbol,
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
