import React from 'react';
import { useSelector } from 'react-redux';
import { accountSelector } from '@src/redux/selectors';
import { walletSelector } from '@src/redux/selectors/wallet';

const withDefaultAccount = (WrappedComp) => (props) => {
  const wallet = useSelector(walletSelector);
  const account = useSelector(accountSelector.defaultAccountSelector);
  const accounts = useSelector(accountSelector.listAccountSelector);
  return (
    <WrappedComp
      {...{
        ...props,
        account,
        accounts,
        wallet,
      }}
    />
  );
};

export default withDefaultAccount;
