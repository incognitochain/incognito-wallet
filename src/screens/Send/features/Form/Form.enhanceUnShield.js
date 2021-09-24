/* eslint-disable no-unreachable */
/* eslint-disable import/no-cycle */
import React, { useState } from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { MESSAGES, CONSTANT_KEYS, CONSTANT_COMMONS } from '@src/constants';
import { ExHandler } from '@src/services/exception';
import { Toast } from '@src/components/core';
import convert from '@src/utils/convert';
import { useSelector, useDispatch } from 'react-redux';
import { feeDataSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { accountSelector, selectedPrivacySelector } from '@src/redux/selectors';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { floor, toString } from 'lodash';
import format from '@src/utils/format';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { reset, formValueSelector } from 'redux-form';
import { withdraw, updatePTokenFee } from '@src/services/api/withdraw';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { walletSelector } from '@src/redux/selectors/wallet';
import accountService from '@services/wallet/accountService';
import {
  actionAddStorageDataDecentralized,
  actionRemoveStorageDataDecentralized,
  actionRemoveStorageDataCentralized,
  actionAddStorageDataCentralized,
} from '@screens/UnShield';
import Utils from '@src/utils/Util';
import { devSelector } from '@src/screens/Dev';
import {
  ACCOUNT_CONSTANT,
  BurningPBSCRequestMeta,
  BurningRequestMeta,
  BurningPRVERC20RequestMeta,
  BurningPRVBEP20RequestMeta,
  PrivacyVersion,
  PRVIDSTR,
} from 'incognito-chain-web-js/build/wallet';
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
    isUnShield,
  } = useSelector(feeDataSelector);
  const dev = useSelector(devSelector);
  const { isUnshieldPegPRV } = props;
  const selector = formValueSelector(formName);
  const currencyTypeName = useSelector((state) => selector(state, 'currencyType'));
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const [childSelectedPrivacy, setChildSelectedPrivacy] = useState();

  React.useEffect(() => {
    if (isUnshieldPegPRV) {
      const childToken = selectedPrivacy.listChildToken.find(item => item.currencyType === currencyTypeName);
      const childSelectedPrivacy = new SelectedPrivacy(
        account,
        null,
        childToken,
        selectedPrivacy.tokenId,
      );
      setChildSelectedPrivacy(childSelectedPrivacy);
    }
  }, [isUnshieldPegPRV, currencyTypeName]);

  const signPublicKeyEncode = useSelector(
    accountSelector.signPublicKeyEncodeSelector,
  );
  const {
    tokenId,
    contractId,
    currencyType,
    isErc20Token,
    isBep20Token,
    externalSymbol,
    paymentAddress: walletAddress,
    symbol,
    pDecimals,
    isDecentralized,
    name,
  } = childSelectedPrivacy ? childSelectedPrivacy : selectedPrivacy;
  const keySave = isDecentralized
    ? CONSTANT_KEYS.UNSHIELD_DATA_DECENTRALIZED
    : CONSTANT_KEYS.UNSHIELD_DATA_CENTRALIZED;
  const [state, setState] = React.useState({
    textLoadingTx: '',
  });
  const toggleDecentralized =
    isUnShield &&
    !!isDecentralized &&
    !!dev[CONSTANT_KEYS.DEV_TEST_MODE_DECENTRALIZED] &&
    (!!global.isDEV || __DEV__);
  const toggleCentralized =
    isUnShield &&
    !isDecentralized &&
    !!dev[CONSTANT_KEYS.DEV_TEST_MODE_CENTRALIZED] &&
    (!!global.isDEV || __DEV__);
  const { textLoadingTx } = state;
  const { data: userFeesData } = userFees;
  const info = toString(userFeesData?.ID) || '';
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const account = useSelector(defaultAccountSelector);
  const wallet = useSelector(walletSelector);
  const handleBurningToken = async (payload = {}, txHashHandler) => {
    try {
      const { originalAmount, feeForBurn, paymentAddress, isBSC } = payload;
      const { FeeAddress: masterAddress } = userFeesData;

      const res = await accountService.createBurningRequest({
        wallet,
        account,
        fee: feeForBurn,
        tokenId,
        burnAmount: originalAmount,
        prvPayments: [
          {
            paymentAddress: masterAddress,
            amount: userFee,
          },
        ],
        info,
        remoteAddress: paymentAddress,
        txHashHandler,
        burningType: isBSC ? BurningPBSCRequestMeta : BurningRequestMeta,
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

  const handleBurningPegPRV = async (payload = {}, txHashHandler) => {
    try {
      const { originalAmount, feeForBurn, paymentAddress, isBSC } = payload;
      const { FeeAddress: masterAddress } = userFeesData;
      const res = await accountService.createBurningPegPRVRequest({
        wallet,
        account,
        fee: feeForBurn,
        tokenId,
        burnAmount: originalAmount,
        prvPayments: [
          {
            paymentAddress: masterAddress,
            amount: userFee,
          },
        ],
        info,
        remoteAddress: paymentAddress,
        txHashHandler,
        burningType: isBSC ? BurningPRVBEP20RequestMeta : BurningPRVERC20RequestMeta,
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
        tokenContractID:
          isETH ||
          currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BNB
            ? ''
            : contractId,
        tokenId,
        burningTxId: '',
        currencyType: currencyType,
        isErc20Token: isErc20Token,
        isBep20Token: isBep20Token,
        externalSymbol: externalSymbol,
        isUsedPRVFee,
        userFeesData,
        fast2x,
      };
      if (!userFeesData?.ID) throw new Error('Missing id withdraw session');
      let _tx;
      const txHashHandler = async ({ txId }) => {
        _tx = { ...data, burningTxId: txId };
        await dispatch(
          actionAddStorageDataDecentralized({
            keySave,
            tx: _tx,
          }),
        );
      };
      let tx;
      if (isUnshieldPegPRV) {
        tx = await handleBurningPegPRV(payload, txHashHandler);
      } else {
        tx = await handleBurningToken(payload, txHashHandler);
      }
      if (toggleDecentralized) {
        await setState({
          ...state,
          textLoadingTx: 'Tx burn saved. You have 15 seconds',
        });
        await Utils.delay(15);
      }
      await withdraw({ ..._tx, signPublicKeyEncode });
      await dispatch(
        actionRemoveStorageDataDecentralized({
          keySave,
          burningTxId: _tx.burningTxId,
        }),
      );
      return tx;
    } catch (e) {
      throw e;
    }
  };

  const handleCentralizedWithdraw = async (payload) => {
    try {
      const { isUsedPRVFee, originalFee } = payload;
      const { Address: tempAddress } = userFeesData;
      let txUpdatePTokenFee;
      const txHashHandler = async ({ txId }) => {
        txUpdatePTokenFee = {
          fee: originalFee,
          paymentAddress: tempAddress,
          userFeesData,
          isUsedPRVFee,
          fast2x,
          txId,
        };
        await dispatch(
          actionAddStorageDataCentralized({
            keySave,
            tx: txUpdatePTokenFee,
          }),
        );
      };
      const tx = await handleSendToken(
        { ...payload, tempAddress },
        txHashHandler,
      );
      if (tx) {
        if (toggleCentralized) {
          await setState({
            ...state,
            textLoadingTx: 'Tx saved. You have 15 seconds',
          });
          await Utils.delay(15);
        }
        await updatePTokenFee({ ...txUpdatePTokenFee, signPublicKeyEncode });
        await dispatch(
          actionRemoveStorageDataCentralized({
            keySave,
            txId: txUpdatePTokenFee?.txId,
          }),
        );
      }
      return tx;
    } catch (e) {
      throw e;
    }
  };

  const handleSendToken = async (payload = {}, txHashHandler) => {
    try {
      const { tempAddress, originalAmount, originalFee } = payload;
      if (!tempAddress) {
        throw Error('Can not create a temp address');
      }
      const { FeeAddress: masterAddress } = userFeesData;

      const res = await accountService.createAndSendPrivacyToken({
        wallet,
        account,
        fee: originalFee,
        tokenPayments: [
          {
            PaymentAddress: tempAddress,
            Amount: originalAmount,
          },
        ],
        prvPayments: [
          {
            PaymentAddress: masterAddress,
            Amount: userFee,
          },
          {
            PaymentAddress: tempAddress,
            Amount: originalFee,
          },
        ],
        txType: ACCOUNT_CONSTANT.TX_TYPE.SEND,
        tokenID: selectedPrivacy?.tokenId,
        txHashHandler,
        version: PrivacyVersion.ver2,
      });

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
        isBSC:
          isBep20Token ||
          currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BNB,
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
      <WrappedComp {...{ ...props, handleUnShieldCrypto, textLoadingTx }} />
    </ErrorBoundary>
  );
};
