import React from 'react';
import accountService from '@services/wallet/accountService';
import formatUtil from '@utils/format';

const withBalance = WrappedComp => (props) => {
  const { coins: noBalanceCoins, wallet, account } = props;

  const [coins, setCoins] = React.useState(noBalanceCoins);

  const loadBalance = async () => {
    try {
      const coins = await Promise.all(noBalanceCoins.map(async coin => {
        const balance = await accountService.getBalance(account, wallet, coin.id);
        const displayBalance = formatUtil.amountFull(balance, coin.pDecimals, true) || '0';
        const displayFullBalance = formatUtil.amountFull(balance, coin.pDecimals, false) || '0';
        return {
          ...coin,
          balance,
          displayBalance,
          displayFullBalance,
        };
      }));
      setCoins(coins);
    } catch (error) {
      console.debug('CAN GET COIN BALANCE', error);
    }
  };

  React.useEffect(() => {
    loadBalance();
  }, [noBalanceCoins]);

  return (
    <WrappedComp
      {...{
        ...props,
        coins,
      }}
    />
  );
};

export default withBalance;
