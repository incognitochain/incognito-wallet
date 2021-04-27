import React from 'react';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { provide } from '@services/api/pool';
import LocalDatabase from '@utils/LocalDatabase';
import { accountSeleclor } from '@src/redux/selectors';
import { useSelector } from 'react-redux';
import ConfirmGoogleCaptcha from 'react-native-google-recaptcha-v2';

const CAPTCHA_KEY = '6LdQUuQZAAAAAK_gLJ5GCvddkPHDObjpEH53VsiL';

const withConfirm = WrappedComp => (props) => {
  const [error, setError] = React.useState('');
  const [providing, setProviding] = React.useState(false);
  const {
    value,
    coin,
    fee,
    onSuccess,
    wallet,
    account,
    isPrv,
    originProvide,
  } = props;

  const signPublicKeyEncode = useSelector(accountSeleclor.signPublicKeyEncodeSelector);

  const confirm = async () => {
    if (providing) {
      return;
    }
  const captchaForm = React.useRef(null);

  const confirm = async (verifyCode) => {
    if (!verifyCode) return;
    setProviding(true);

    try {
      let provideValue = isPrv ? originProvide : value;
      let providerFee  = fee;

      const txs = await LocalDatabase.getProvideTxs();

      const txHandler = async (txHash) => {
        txs.push({
          paymentAddress: account.PaymentAddress,
          txId: txHash,
          signPublicKeyEncode,
          provideValue,
          value: provideValue,
          time: new Date().getTime(),
        });
        await LocalDatabase.saveProvideTxs(txs);
      };

      const result = await accountService.createAndSendToken(
        account,
        wallet,
        coin.masterAddress,
        provideValue,
        coin.id,
        providerFee,
        0,
        0,
        '',
        txHandler,
      );
      if (!global.isDEV && result && result.txId) {
        await provide(account.PaymentAddress, result.txId, signPublicKeyEncode, provideValue, verifyCode);
        txs.splice(txs.length - 1, 1);
        await LocalDatabase.saveProvideTxs(txs);
        onSuccess(true);
      }
    } catch (error) {
      setError(new ExHandler(error).getMessage());
    } finally {
      setProviding(false);
    }
  };

  const onMessage = event => {
    if (event && event.nativeEvent.data) {
      if (['cancel', 'error', 'expired'].includes(event.nativeEvent.data)) {
        return captchaForm.hide();
      } else {
        const verifyCode = event.nativeEvent.data;
        console.log('Verified code from Google', event.nativeEvent.data);
        setTimeout(() => {
          if (captchaForm.current) {
            captchaForm.current.hide();
          }
        }, 1500);
        setTimeout(() => {
          confirm(verifyCode).then();
        }, 2500);
      }
    }
  };

  const onConfirmPress = () => {
    if (providing || !captchaForm.current) return;
    captchaForm.current.show();
  };

  return (
    <>
      <WrappedComp
        {...{
          ...props,
          providing,
          onConfirm: onConfirmPress,
          error,
        }}
      />
      <ConfirmGoogleCaptcha
        ref={captchaForm}
        siteKey={CAPTCHA_KEY}
        baseUrl="https://incognito.org"
        languageCode='en'
        onMessage={onMessage}
        ca
      />
    </>
  );
};

export default withConfirm;
