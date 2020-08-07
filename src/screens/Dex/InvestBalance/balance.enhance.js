import React from 'react';
import accountService from '@services/wallet/accountService';
import _ from 'lodash';
import formatUtil from '@utils/format';

const withBalance = WrappedComp => (props) => {
  const [followingCoins, setFollowingCoins] = React.useState([]);

  const {
    followingCoins: noBalanceCoins,
    account,
    wallet,
  } = props;

  const loadBalance = async (noBalanceCoins, account) => {
    try {
      setFollowingCoins([...noBalanceCoins]);
      const newCoins = [...noBalanceCoins];

      const currentAccountName = accountService.getAccountName(account);
      console.debug('ACCOUNT NAME', currentAccountName);
      console.debug('LOAD COIN');
      for (let index = 0; index < newCoins.length; index += 1) {
        const coin = newCoins[index];
        coin.balance = undefined;
        coin.displayClipBalance = '';
        coin.displayBalance = '';
        newCoins[index] = coin;
        setFollowingCoins([...newCoins]);

        console.debug('LOAD BALANCE', currentAccountName, index, coin.symbol);
        // TODO: For unknown reason, when we pass account, account will be changed to pDEX. We need to find a solution to fix it
        const balance = await accountService.getBalance({ name: currentAccountName }, wallet, coin.id);
        console.debug('LOAD BALANCE COMPLETE', currentAccountName, index, coin.symbol);
        coin.displayBalance = formatUtil.amountFull(balance, coin.pDecimals) || '0';
        coin.displayClipBalance = formatUtil.amountFull(balance, coin.pDecimals, true) || '0';
        coin.balance = balance;

        if (coin.symbol === 'PRV') {
          console.debug('COIN', coin.balance, coin.displayBalance, coin.displayClipBalance, account.name, account.accountName);
        }

        if (accountService.getAccountName(account) === currentAccountName) {
          newCoins[index] = coin;
          setFollowingCoins([...newCoins]);
        }
      }

      console.debug('LOAD ACCOUNT NAME', currentAccountName);
    } catch (error) {
      console.debug('CAN GET COIN BALANCE', error);
    }
  };

  const debouncedLoadBalance = React.useCallback(_.debounce(loadBalance, 1000), []);

  React.useEffect(() => {
    if (account) {
      const newCoins = [...noBalanceCoins];
      for (let index = 0; index < newCoins.length; index += 1) {
        const coin = newCoins[index];
        coin.balance = undefined;
        coin.displayClipBalance = '';
        coin.displayBalance = '';
        newCoins[index] = coin;
      }
      setFollowingCoins([...newCoins]);
      debouncedLoadBalance(noBalanceCoins, account);
    }
  }, [noBalanceCoins, account]);

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
