import React from 'react';
import { ExHandler } from '@services/exception';
import { withdrawProvision } from '@services/api/pool';
import { signPoolWithdraw } from '@services/gomobile';

const withConfirm = WrappedComp => (props) => {
  const [error, setError] = React.useState('');
  const [withdrawing, setWithdrawing] = React.useState(false);
  const { account, onSuccess, inputValue, coin } = props;

  const confirm = async () => {
    if (withdrawing) {
      return;
    }

    setWithdrawing(true);
    setError('');

    try {
      const signEncode = await signPoolWithdraw(account.PrivateKey, account.PaymentAddress, inputValue);
      await withdrawProvision(account.PaymentAddress, signEncode, inputValue, coin.id);
      onSuccess(true);
    } catch (error) {
      setError(new ExHandler(error).getMessage());
    } finally {
      setWithdrawing(false);
    }
  };

  React.useEffect(() => {
    setError(props.error);
  }, [props.error]);

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
