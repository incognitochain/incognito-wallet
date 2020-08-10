import React from 'react';
import { DEX } from '@utils/dex';

const withShareAccount = WrappedComp => (props) => {
  const [account, setAccount] = React.useState(null);
  const {
    accounts,
    pair,
  } = props;

  React.useEffect(() => {
    const account = accounts.find(item => pair.shareKey.includes(item.PaymentAddress));
    setAccount(account);
  }, [accounts, pair]);

  return (
    <WrappedComp
      {...{
        ...props,
        account,
      }}
    />
  );
};

export default withShareAccount;
