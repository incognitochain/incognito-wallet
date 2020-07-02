import React from 'react';
import { ExHandler } from '@services/exception';
import { withdrawReward } from '@services/api/pool';
import { signPoolWithdraw } from '@services/gomobile';

const withConfirm = WrappedComp => (props) => {
  const [error, setError] = React.useState('');
  const [withdrawing, setWithdrawing] = React.useState(false);
  const { account, onSuccess } = props;

  const confirm = async () => {
    if (withdrawing) {
      return;
    }

    setWithdrawing(true);
    setError('');

    try {
      const signEncode = await signPoolWithdraw(account.PrivateKey, account.PaymentAddress, 0);
      await withdrawReward(account.PaymentAddress, signEncode);
      onSuccess(true);
    } catch (error) {
      setError(new ExHandler(error).getMessage());
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <WrappedComp
      {...{
        ...props,
        withdrawing,
        onConfirm: confirm,
        error,
      }}
    />
  );
};

export default withConfirm;
