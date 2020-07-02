import React from 'react';
import { useSelector } from 'react-redux';
import { accountSeleclor } from '@src/redux/selectors';

const withDefaultAccount = WrappedComp => (props) => {
  const wallet = useSelector(state => state.wallet);
  const account = useSelector(accountSeleclor.defaultAccount);
  const accounts = useSelector(accountSeleclor.listAccountSelector);

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
