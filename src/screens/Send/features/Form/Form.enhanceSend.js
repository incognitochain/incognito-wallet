/* eslint-disable import/no-cycle */
import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useSelector, useDispatch } from 'react-redux';
import convert from '@src/utils/convert';
import { floor } from 'lodash';
import { feeDataSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import format from '@src/utils/format';
import { reset } from 'redux-form';
import { Toast } from '@src/components/core';
import { MESSAGES, CONSTANT_KEYS, CONSTANT_COMMONS } from '@src/constants';
import { ExHandler } from '@src/services/exception';
import { walletSelector } from '@src/redux/selectors/wallet';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import accountService from '@services/wallet/accountService';
import tokenService from '@services/wallet/tokenService';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { formName } from './Form.enhance';

export const enhanceSend = (WrappedComp) => (props) => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const feeData = useSelector(feeDataSelector);
  const wallet = useSelector(walletSelector);
  const account = useSelector(defaultAccountSelector);

  const handleSendMainCrypto = async (payload) => {
    const { toAddress, message, originalFee, originalAmount } = payload;
    const paymentInfos = [
      {
        paymentAddressStr: toAddress,
        amount: originalAmount,
      },
    ];
    try {
      const res = await accountService.createAndSendNativeToken(
        paymentInfos,
        originalFee,
        true,
        account,
        wallet,
        message,
      );
      if (res.txId) {
        return res;
      } else {
        throw new Error('Sent tx, but doesnt have txID, please check it');
      }
    } catch (e) {
      throw e;
    }
  };

  const handleSendToken = async (payload) => {
    try {
      const {
        toAddress,
        message,
        isUseTokenFee,
        originalFee,
        originalAmount,
      } = payload;
      const type = CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND;
      const tokenObject = {
        Privacy: true,
        TokenID: selectedPrivacy?.tokenId,
        TokenName: selectedPrivacy?.name,
        TokenSymbol: selectedPrivacy?.symbol,
        TokenTxType: type,
        TokenAmount: originalAmount,
        TokenReceivers: [
          {
            PaymentAddress: toAddress,
            Amount: originalAmount,
          },
        ],
      };
      if (!isUseTokenFee) {
        const prvBalance = await accountService.getBalance(account, wallet);
        if (prvBalance < originalFee) {
          throw new Error(MESSAGES.NOT_ENOUGH_NETWORK_FEE);
        }
      }
      const res = await tokenService.createSendPToken(
        tokenObject,
        isUseTokenFee ? 0 : originalFee,
        account,
        wallet,
        null,
        isUseTokenFee ? originalFee : 0,
        message,
      );
      if (res.txId) {
        return res;
      } else {
        throw new Error('Sent tx, but doesnt have txID, please check it');
      }
    } catch (e) {
      throw e;
    }
  };

  const handleSendAnonymously = async (values) => {
    try {
      const { toAddress, amount } = values;
      const { fee, feeUnit, feePDecimals } = feeData;
      const amountToNumber = convert.toNumber(amount, true);
      const originalAmount = convert.toOriginalAmount(
        amountToNumber,
        selectedPrivacy?.pDecimals,
        false,
      );
      const _originalAmount = floor(originalAmount);
      const originalFee = floor(fee);
      const _fee = format.amountFull(originalFee, feePDecimals);
      const payload = {
        ...feeData,
        ...values,
        originalFee,
        originalAmount: _originalAmount,
      };
      let res;
      if (selectedPrivacy?.isToken) {
        res = await handleSendToken(payload);
      }
      if (selectedPrivacy?.isMainCrypto) {
        res = await handleSendMainCrypto(payload);
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
          tokenSymbol:
            selectedPrivacy?.externalSymbol ||
            selectedPrivacy?.symbol ||
            res?.tokenSymbol,
          keySaveAddressBook: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK,
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
          'Something went wrong. Just tap the Send button again.',
        ).showErrorToast(true);
      }
    }
  };
  
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, handleSendAnonymously }} />
    </ErrorBoundary>
  );
};
