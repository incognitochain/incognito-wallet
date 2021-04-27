import React from 'react';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { provide } from '@services/api/pool';
import LocalDatabase from '@utils/LocalDatabase';
import { accountSeleclor } from '@src/redux/selectors';
import { useSelector } from 'react-redux';

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

    setProviding(true);
    setError('');

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
        await provide(account.PaymentAddress, result.txId, signPublicKeyEncode, provideValue);
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

  return (
    <WrappedComp
      {...{
        ...props,
        providing,
        onConfirm: confirm,
        error,
      }}
    />
  );
};

export default withConfirm;
