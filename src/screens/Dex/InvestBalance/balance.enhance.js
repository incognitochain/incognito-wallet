import React from 'react';
import accountService from '@services/wallet/accountService';
import formatUtil from '@utils/format';

const withBalance = WrappedComp => (props) => {
  const [followingCoins, setFollowingCoins] = React.useState([]);

  const {
    followingCoins: noBalanceCoins,
    account,
    wallet,
  } = props;

  const loadBalance = async () => {
    try {
      setFollowingCoins(noBalanceCoins);
      const newCoins = [...noBalanceCoins];
      const currentAccount = account.name;
      for (let index = 0; index < newCoins.length; index += 1) {
        const coin = newCoins[index];
        const balance = await accountService.getBalance(account, wallet, coin.id);
        coin.displayBalance = formatUtil.amountFull(balance, coin.pDecimals) || '0';
        coin.balance = balance;
        newCoins[index] = coin;
        setFollowingCoins([...newCoins]);
      }
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
        followingCoins,
      }}
    />
  );
};

export default withBalance;
