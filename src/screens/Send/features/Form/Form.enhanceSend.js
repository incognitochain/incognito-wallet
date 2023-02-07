/* eslint-disable no-unreachable */
/* eslint-disable import/no-cycle */
import React from 'react';
import {
  ACCOUNT_CONSTANT,
  PrivacyVersion,
} from 'incognito-chain-web-js/build/wallet';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useSelector, useDispatch } from 'react-redux';
import convert from '@src/utils/convert';
import { floor } from 'lodash';
import { feeDataSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import format from '@src/utils/format';
import { reset } from 'redux-form';
import { Toast } from '@src/components/core';
import { MESSAGES, CONSTANT_KEYS } from '@src/constants';
import { ExHandler } from '@src/services/exception';
import { walletSelector } from '@src/redux/selectors/wallet';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import accountService from '@services/wallet/accountService';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { selectedPrivacySelector } from '@src/redux/selectors';
import { formName } from './Form.enhance';

export const enhanceSend = (WrappedComp) => (props) => {
  const { setErrorMessage } = props;
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const feeData = useSelector(feeDataSelector);
  const wallet = useSelector(walletSelector);
  const account = useSelector(defaultAccountSelector);

  const handleSendMainCrypto = async (payload) => {
    const { toAddress, message, originalFee, originalAmount } = payload;
    try {
      const res = await accountService.createAndSendNativeToken({
        wallet,
        account,
        fee: originalFee,
        info: message,
        prvPayments: [
          {
            PaymentAddress: toAddress,
            Amount: String(originalAmount),
            Message: message,
          },
        ],
        txType: ACCOUNT_CONSTANT.TX_TYPE.SEND,
        version: PrivacyVersion.ver2,
      });
      return res;
    } catch (e) {
      throw e;
    }
  };

  const handleSendToken = async (payload) => {
    try {
      const { toAddress, message, originalFee, originalAmount } = payload;
      const res = await accountService.createAndSendPrivacyToken({
        wallet,
        account,
        fee: originalFee,
        info: message,
        tokenPayments: [
          {
            PaymentAddress: toAddress,
            Amount: String(originalAmount),
            Message: message,
          },
        ],
        txType: ACCOUNT_CONSTANT.TX_TYPE.SEND,
        tokenID: selectedPrivacy?.tokenId,
        version: PrivacyVersion.ver2,
      });
      return res;
    } catch (e) {
      throw e;
    }
  };

  const handleSendAnonymously = async (values) => {
    let params;
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
        params = {
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
        setTimeout(() => {
          navigation.navigate(routeNames.Receipt, { params });
        }, 1000);
        await dispatch(reset(formName));
      }
    } catch (e) {
      // console.log('EEEE ', { e });
      if (e.message === MESSAGES.NOT_ENOUGH_NETWORK_FEE) {
        Toast.showError(e.message);
      } else {
        // new ExHandler(
        //   e,
        //   'Something went wrong. Just tap the Send button again.',
        // ).showErrorToast(true);

        if (typeof e === 'string') {
          setErrorMessage(e);
        }
        if (typeof e === 'object') {
          const jsonObj = JSON.stringify(e);
          const info = e.code || e.name;
          const message = e.detail || e.message;
          const errorMessage = `[${info}]: ${message}`;
          // console.log(jsonObj);
          if (jsonObj.includes('-3001') || jsonObj.includes('UTXO')) {
            setErrorMessage(MESSAGES.MAXIMUM_UTXO_ERROR);
          } else {
            setErrorMessage(errorMessage);
          }
        }

      }
    }
  };

  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, handleSendAnonymously }} />
    </ErrorBoundary>
  );
};
