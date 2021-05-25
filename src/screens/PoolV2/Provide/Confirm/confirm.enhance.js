import React from 'react';
import { ACCOUNT_CONSTANT } from 'incognito-chain-web-js/build/wallet';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { submitProvideRawTx, checkPreviousProvision } from '@services/api/pool';
import { useSelector } from 'react-redux';
import { accountSelector } from '@src/redux/selectors';
import ReCaptchaV3 from '@haskkor/react-native-recaptchav3';
import appConstant from '@src/constants/app';
import { isEmpty } from 'lodash';
import { PRV_ID } from '@screens/Dex/constants';

const withConfirm = (WrappedComp) => (props) => {
  const signPublicKeyEncode = useSelector(
    accountSelector.signPublicKeyEncodeSelector,
  );
  const [error, setError] = React.useState('');
  const [providing, setProviding] = React.useState(false);
  const [provideTx, setProvideTx] = React.useState(null);
  const [disable, setDisable] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const captchaRef = React.useRef(null);
  const {
    coins,
    value,
    coin,
    fee,
    onSuccess,
    wallet,
    account,
    isPrv,
    originProvide,
  } = props;

  const handleProvideApi = async (captchaCode) => {
    try {
      setDisable(false);
      if (!provideTx) return;
      const { txId, rawData } = provideTx;
      let provideValue = isPrv ? originProvide : value;
      if (isEmpty(txId)) return;
      await submitProvideRawTx({
        paymentAddress: account.PaymentAddress,
        signPublicKeyEncode,
        tx: txId,
        rawData,
        amount: provideValue,
        captchaCode,
        tokenId: coin.id
      });
      onSuccess(true);
    } catch (e) {
      setProvideTx(null);
      setError(new ExHandler(e).getMessage());
    } finally {
      setProviding(false);
    }
  };

  const submitProvideRawData = async (params) => {
    if (!params || captchaRef.current) {
      const { txId, rawTx: rawData } = params;
      setProvideTx({ txId, rawData });
      setTimeout(() => {
        captchaRef.current?.refreshToken();
      }, 1000);
    }
    return true;
  };

  const handleSendTransaction = async () => {
    try {
      if (provideTx) return;
      let provideValue = isPrv ? originProvide : value;
      if (coin.id === PRV_ID) {
        await accountService.createAndSendNativeToken({
          wallet,
          account,
          fee,
          prvPayments: [
            {
              PaymentAddress: coin.masterAddress,
              Amount: provideValue,
              Message: '',
            },
          ],
          txType: ACCOUNT_CONSTANT.TX_TYPE.PROVIDE,
          txHandler: submitProvideRawData
        });
      } else {
        await accountService.createAndSendPrivacyToken({
          wallet,
          account,
          fee,
          tokenPayments: [
            {
              PaymentAddress: coin.masterAddress,
              Amount: provideValue,
              Message: '',
            },
          ],
          txType: ACCOUNT_CONSTANT.TX_TYPE.PROVIDE,
          tokenID: coin.id,
          txHandler: submitProvideRawData
        });
      }
    } catch (e) {
      setProvideTx(null);
      setProviding(false);
      setError(new ExHandler(e).getMessage());
    }
  };

  const onConfirmPress = async () => {
    try {
      if (providing || !captchaRef.current) return;
      setProviding(true);
      const hasPrevious = await checkPreviousProvision({
        tokenId: coin.id,
        paymentAddress: account.PaymentAddress
      });
      if (hasPrevious) {
        setProviding(false);
        setError('Please wait for the previous provision to be completed.');
        return;
      }
      handleSendTransaction().then();
    } catch (error) {
      console.log('SANG TEST: ', error);
      handleSendTransaction().then();
    }
  };

  const onRefresh = () => {
    if (disable) return;
    setRefreshing(true);
    setError('');
    setProviding(false);
    setProvideTx(null);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  return (
    <>
      <ReCaptchaV3
        ref={captchaRef}
        captchaDomain={appConstant.CAPTCHA_DOMAIN}
        siteKey={appConstant.CAPTCHA_KEY}
        onReceiveToken={handleProvideApi}
      />
      <WrappedComp
        {...{
          ...props,
          providing,
          error,
          disable,
          refreshing,

          onRefresh,
          onConfirm: onConfirmPress,
        }}
      />
    </>
  );
};

export default withConfirm;
