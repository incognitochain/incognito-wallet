import React from 'react';
import { useSelector } from 'react-redux';
import { accountSelector } from '@src/redux/selectors';

const withAccount = WrappedComp => (props) => {
  const wallet = useSelector(state => state.wallet);
  const account = useSelector(accountSelector.defaultAccount);
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

export default withAccount;
