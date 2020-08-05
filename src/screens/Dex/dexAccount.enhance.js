import React from 'react';
import { DEX } from '@utils/dex';

const withDexAccounts = WrappedComp => (props) => {
  const [dexMainAccount, setDexMainAccount] = React.useState(null);
  const [dexWithdrawAccount, setDexWithdrawAccount] = React.useState(null);
  const {
    accounts,
  } = props;

  React.useEffect(() => {
    const dexMainAccount = accounts.find(item => item.name === DEX.MAIN_ACCOUNT);
    const dexWithdrawAccount = accounts.find(item => item.name === DEX.WITHDRAW_ACCOUNT);

    setDexMainAccount(dexMainAccount);
    setDexWithdrawAccount(dexWithdrawAccount);
  }, [accounts]);

  return (
    <WrappedComp
      {...{
        ...props,
        account: dexMainAccount,
        dexMainAccount,
        dexWithdrawAccount,
      }}
    />
  );
};

export default withDexAccounts;
