import React from 'react';
import { useSelector } from 'react-redux';
import { accountSelector } from '@src/redux/selectors';
import { isLoadingAllMasterKeyAccountSelector } from '@src/redux/selectors/masterKey';
import { Header, LoadingContainer } from '@src/components';

const withAccount = WrappedComp => (props) => {
  const wallet = useSelector(state => state.wallet);
  const account = useSelector(accountSelector.defaultAccount);
  const accounts = useSelector(accountSelector.listAccountSelector);
  const loading = useSelector(isLoadingAllMasterKeyAccountSelector);
  if (loading) {
    return (
      <>
        <Header title="Node" style={{ marginHorizontal: 25 }} />
        <LoadingContainer />
      </>
    );
  }

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
