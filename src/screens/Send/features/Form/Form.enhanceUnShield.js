/* eslint-disable no-unreachable */
/* eslint-disable import/no-cycle */
import {
  actionAddStorageDataCentralized, actionAddStorageDataDecentralized, actionRemoveStorageDataCentralized, actionRemoveStorageDataDecentralized
} from '@screens/UnShield';
import accountService from '@services/wallet/accountService';
import { Toast } from '@src/components/core';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { feeDataSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { CONSTANT_COMMONS, CONSTANT_KEYS, MESSAGES } from '@src/constants';
import {
  accountSelector, childSelectedPrivacySelector, selectedPrivacySelector
} from '@src/redux/selectors';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { walletSelector } from '@src/redux/selectors/wallet';
import routeNames from '@src/router/routeNames';
import { devSelector } from '@src/screens/Dev';
import { updatePTokenFee, withdraw } from '@src/services/api/withdraw';
import { ExHandler } from '@src/services/exception';
import convert from '@src/utils/convert';
import format from '@src/utils/format';
import Utils from '@src/utils/Util';
import {
  ACCOUNT_CONSTANT, BurningFantomRequestMeta, BurningAvaxRequestMeta, BurningPBSCRequestMeta, BurningPLGRequestMeta, BurningPRVBEP20RequestMeta, BurningPRVERC20RequestMeta, BurningRequestMeta, PrivacyVersion
} from 'incognito-chain-web-js/build/wallet';
import { floor, toString } from 'lodash';
import React from 'react';
import { useNavigation } from 'react-navigation-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { reset } from 'redux-form';
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
    isUseTokenFee,
  } = useSelector(feeDataSelector);
  const dev = useSelector(devSelector);
  const { isUnshieldPegPRV, isUnshieldPUnifiedToken } = props;
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const childSelectedPrivacy = useSelector(
    childSelectedPrivacySelector.childSelectedPrivacy,
  );

  const signPublicKeyEncode = useSelector(
    accountSelector.signPublicKeyEncodeSelector,
  );
  const {
    tokenId,
    contractId,
    currencyType,
    isErc20Token,
    isBep20Token,
    isPolygonErc20Token,
    isFantomErc20Token,
    isAvaxErc20Token,
    externalSymbol,
    paymentAddress: walletAddress,
    isDecentralized,
  } = childSelectedPrivacy && childSelectedPrivacy?.networkId !== 'INCOGNITO'
    ? childSelectedPrivacy
    : selectedPrivacy;
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
      const {
        originalAmount,
        feeForBurn,
        paymentAddress,
        isBSC,
        isPolygon,
        isFantom,
        isAvax,
      } = payload;
      const { FeeAddress: masterAddress } = userFeesData;

      // set default BurningRequestMeta
      let burningRequestMeta = BurningRequestMeta;

      if (isBSC) burningRequestMeta = BurningPBSCRequestMeta;
      if (isPolygon) burningRequestMeta = BurningPLGRequestMeta;
      if (isFantom) burningRequestMeta = BurningFantomRequestMeta;
      if (isAvax) burningRequestMeta = BurningAvaxRequestMeta;


      /**--> Get payment info <--*/
      const paymentInfo = [{
        paymentAddress: masterAddress,
        amount: userFee,
      }];
      let prvPayments = [];
      let tokenPayments = [];
      if (isUseTokenFee) {
        tokenPayments = paymentInfo;
      } else {
        prvPayments = paymentInfo;
      }
      /**---------------------------*/

      const res = await accountService.createBurningRequest({
        wallet,
        account,
        fee: feeForBurn,
        tokenId,
        burnAmount: String(originalAmount),
        prvPayments,
        tokenPayments,
        info,
        remoteAddress: paymentAddress,
        txHashHandler,
        burningType: burningRequestMeta,
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
            amount: String(userFee),
          },
        ],
        info,
        remoteAddress: paymentAddress,
        txHashHandler,
        burningType: isBSC
          ? BurningPRVBEP20RequestMeta
          : BurningPRVERC20RequestMeta,
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

  const handleBurningUnifiedToken = async (payload = {}, txHashHandler) => {
    try {
      const { feeForBurn, paymentAddress } = payload;
      const { FeeAddress: masterAddress } = userFeesData;

      const burningAmount = userFeesData?.EstimateReceivedAmount?.BurntAmount;
      const expectedAmount =
        userFeesData?.EstimateReceivedAmount?.ExpectedAmount;

      if (!userFeesData?.EstimateReceivedAmount || !burningAmount) {
        throw new Error('Please try again');
      }

      const burningInfos = [
        {
          incTokenID: childSelectedPrivacy?.tokenId,
          burningAmount: burningAmount,
          expectedAmount: expectedAmount,
          remoteAddress: paymentAddress,
        },
      ];

      /**--> Get payment info <--*/
      const paymentInfo = [
        {
          paymentAddress: masterAddress,
          amount: userFee,
        },
      ];
      let tokenPayments = [];
      let prvPayments = [];
      if (isUseTokenFee) {
        tokenPayments = paymentInfo;
      } else {
        prvPayments = paymentInfo;
      }
      /**---------------------------*/

      const res = await accountService.createBurningRequestForUnifiedToken({
        wallet,
        account,
        fee: feeForBurn,
        tokenId: selectedPrivacy?.tokenId,
        prvPayments,
        tokenPayments,
        info,
        txHashHandler,
        burningInfos,
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
      const requestedAmount = format.toFixed(amountToNumber, selectedPrivacy?.pDecimals);
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
        isPolygonErc20Token: isPolygonErc20Token,
        isFantomErc20Token: isFantomErc20Token,
        isAvaxErc20Token: isAvaxErc20Token,
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
      } else if (isUnshieldPUnifiedToken) {
        tx = await handleBurningUnifiedToken(payload, txHashHandler);
      } else {
        tx = await handleBurningToken(payload, txHashHandler);
      }
      if (toggleDecentralized) {
        await setState({
          ...state,
          textLoadingTx: 'Tx burn saved. You have 15 seconds',
        });
        await Utils.delay(15);
      } else {
        await withdraw({ ..._tx, signPublicKeyEncode });
        await dispatch(
          actionRemoveStorageDataDecentralized({
            keySave,
            burningTxId: _tx.burningTxId,
          }),
        );
      }
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
        } else {
          await updatePTokenFee({ ...txUpdatePTokenFee, signPublicKeyEncode });
          await dispatch(
            actionRemoveStorageDataCentralized({
              keySave,
              txId: txUpdatePTokenFee?.txId,
            }),
          );
        }
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

      /**--> Get payment info <--*/
      const paymentInfo = [
        {
          PaymentAddress: masterAddress,
          Amount: String(userFee),
        }
      ];

      let prvPayments = [
        {
          PaymentAddress: tempAddress,
          Amount: String(originalFee),
        },
      ];

      let tokenPayments = [
        {
          PaymentAddress: tempAddress,
          Amount: String(originalAmount),
        },
      ];

      if (isUseTokenFee) {
        tokenPayments = [
          ...tokenPayments,
          ...paymentInfo
        ];
      } else {
        prvPayments = [
          ...prvPayments,
          ...paymentInfo
        ];
      }
      /**---------------------------*/
      const res = await accountService.createAndSendPrivacyToken({
        wallet,
        account,
        fee: originalFee,
        tokenPayments,
        prvPayments,
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
        selectedPrivacy?.pDecimals,
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
        isPolygon:
          isPolygonErc20Token ||
          currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.MATIC,
        isFantom:
          isFantomErc20Token ||
          currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.FTM,
        isAvax:
          isAvaxErc20Token ||
          currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.AVAX,
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
          pDecimals: selectedPrivacy?.pDecimals,
          tokenSymbol: externalSymbol || res?.tokenSymbol,
          keySaveAddressBook: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_OUT_NETWORK,
        };
        setTimeout(() => {
          navigation.navigate(routeNames.Receipt, { params });
        }, 1000);
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
