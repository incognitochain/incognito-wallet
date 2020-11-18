import React from 'react';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { provide } from '@services/api/pool';
import { getSignPublicKey } from '@services/gomobile';
import LocalDatabase from '@utils/LocalDatabase';

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

  const confirm = async () => {
    if (providing) {
      return;
    }

    setProviding(true);
    setError('');

    try {
      let provideValue = isPrv ? originProvide : value;
      let providerFee  = fee;

      const signPublicKeyEncode = await getSignPublicKey(account.PrivateKey);
      const txs = await LocalDatabase.getProvideTxs();
      const result = await accountService.createAndSendToken(
        account,
        wallet,
        coin.masterAddress,
        provideValue,
        coin.id,
        providerFee,
        0,
      );
      if (result && result.txId) {
        txs.push({
          paymentAddress: account.PaymentAddress,
          txId: result.txId,
          signPublicKeyEncode,
          provideValue
        });
        await LocalDatabase.saveProvideTxs(txs);
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
