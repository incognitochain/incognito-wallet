import React from 'react';
import { MESSAGES } from '@screens/Dex/constants';
import { PRV } from '@services/wallet/tokenService';
import { COINS } from '@src/constants';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { provide } from '@services/api/pool';
import { getSignPublicKey } from '@services/gomobile';

const withConfirm = WrappedComp => (props) => {
  const [error, setError] = React.useState('');
  const [providing, setProviding] = React.useState(false);
  const {
    value,
    coin,
    fee,
    feeToken,
    onSuccess,
    wallet,
    account,
    prvBalance,
  } = props;

  const confirm = async () => {
    let prvFee = 0;
    let tokenFee = 0;
    if (providing) {
      return;
    }

    setProviding(true);
    setError('');

    try {
      if (coin?.id === PRV.id) {
        prvFee = fee;
        tokenFee = fee;
      } else {
        prvFee = feeToken.id === COINS.PRV_ID ? fee : 0;
        tokenFee = prvFee > 0 ? 0 : fee;
      }

      if (coin.balance < value + tokenFee) {
        return setError(MESSAGES.NOT_ENOUGH_BALANCE(coin.symbol));
      }

      if (prvBalance < prvFee) {
        return setError(MESSAGES.NOT_ENOUGH_PRV_NETWORK_FEE);
      }

      const signPublicKeyEncode = await getSignPublicKey(account.PrivateKey);
      const result = await accountService.createAndSendToken(
        account,
        wallet,
        coin.masterAddress,
        value,
        coin.id,
        prvFee,
        tokenFee,
      );

      if (result && result.txId) {
        await provide(account.PaymentAddress, result.txId, signPublicKeyEncode, value);
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
