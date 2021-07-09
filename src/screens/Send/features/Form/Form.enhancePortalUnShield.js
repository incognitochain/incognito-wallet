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
import { selectedPrivacySelector } from '@src/redux/selectors';
import { floor } from 'lodash';
import format from '@src/utils/format';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { reset } from 'redux-form';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { walletSelector } from '@src/redux/selectors/wallet';
import accountService from '@services/wallet/accountService';
import {
  actionRemoveStorageDataCentralized,
  actionAddStorageDataCentralized,
} from '@screens/UnShield';
import Utils from '@src/utils/Util';
import { devSelector } from '@src/screens/Dev';
import {
  PortalV4UnshieldRequestMeta,
  PrivacyVersion,
} from 'incognito-chain-web-js/build/wallet';
import { formName } from './Form.enhance';

export const enhancePortalUnshield = (WrappedComp) => (props) => {
  const { portalData } = props;
  const { incNetworkFee } = portalData;
  const dev = useSelector(devSelector);
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  
  const {
    tokenId,
    currencyType,
    externalSymbol,
    paymentAddress: walletAddress,
    pDecimals,
  } = selectedPrivacy;
  const keySave = CONSTANT_KEYS.UNSHIELD_DATA_PORTAL;
  const [state, setState] = React.useState({
    textLoadingTx: '',
  });

  const togglePortal =
    !!dev[CONSTANT_KEYS.DEV_TEST_MODE_PORTAL] &&
    (!!global.isDEV || __DEV__);
  const { textLoadingTx } = state;
  const info = '';
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const account = useSelector(defaultAccountSelector);
  const wallet = useSelector(walletSelector);

  const handleCreateUnshieldTx = async (payload = {}, txHashHandler) => {
    try {
      const {
        originalUnshieldAmount,
        toAddress,
        originalNetworkFee,
      } = payload;

      const params = {
        wallet,
        account,
        fee: originalNetworkFee,
        tokenId,
        unshieldAmount: originalUnshieldAmount,
        prvPayments: [],
        info,
        remoteAddress: toAddress,
        txHashHandler,
        burningType: PortalV4UnshieldRequestMeta,
        version: PrivacyVersion.ver2,
      };

      console.log('Param handleCreateUnshieldTx: ', params);

      const res = await accountService.createPortalUnshieldRequest({
        wallet,
        account,
        fee: originalNetworkFee,
        tokenId,
        unshieldAmount: originalUnshieldAmount,
        prvPayments: [],
        info,
        remoteAddress: toAddress,
        txHashHandler,
        burningType: PortalV4UnshieldRequestMeta,
        version: PrivacyVersion.ver2,
      });
      if (res.txId) {
        return { ...res, burningTxId: res?.txId };
      } else {
        throw new Error('Burned token, but doesnt have txID, please check it');
      }
    } catch (e) {
      throw e;
    }
  };

  const handleUnshield = async (payload) => {
    try {
      const {
        amount,
        originalUnshieldAmount,
        toAddress,
      } = payload;
      
      const amountToNumber = convert.toNumber(amount, true);
      const requestedAmount = format.toFixed(amountToNumber, pDecimals);
      let data = {
        requestedAmount,
        originalAmount: originalUnshieldAmount,
        toAddress,
        walletAddress,
        tokenId,
        burningTxId: '',
        currencyType,
        externalSymbol,
      };
      let _tx;
      const txHashHandler = async ({ txId }) => {
        _tx = { ...data, burningTxId: txId };
        await dispatch(
          actionAddStorageDataCentralized({
            keySave,
            tx: _tx,
          }),
        );
      };
      const tx = await handleCreateUnshieldTx(payload, txHashHandler);
      if (togglePortal) {
        await setState({
          ...state,
          textLoadingTx: 'Tx burn saved. You have 15 seconds',
        });
        await Utils.delay(15);
      }
      await dispatch(
        actionRemoveStorageDataCentralized({
          keySave,
          burningTxId: _tx.burningTxId,
        }),
      );
      return tx;
    } catch (e) {
      throw e;
    }
  };

  const handleUnshieldPortal = async (values) => {
    try {
      const { amount, toAddress } = values;
      console.log('handleUnshieldPortal values', values);
      const amountToNumber = convert.toNumber(amount, true);
      const originalUnshieldAmount = floor(convert.toOriginalAmount(
        amountToNumber,
        pDecimals,
        false,
      ));
      const networkFee = convert.toHumanAmount(incNetworkFee, CONSTANT_COMMONS.DECIMALS['PRV']);
    
      const payload = {
        amount,
        originalUnshieldAmount,
        toAddress: toAddress,
        isUsedPRVFee: true,
        originalNetworkFee: incNetworkFee,
      };
      const res = await handleUnshield(payload);

      if (res) {
        const params = {
          ...res,
          originalAmount: originalUnshieldAmount,
          fee: networkFee,
          title: 'Unshield.',
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
      <WrappedComp {...{ ...props, handleUnshieldPortal }} />
    </ErrorBoundary>
  );
};