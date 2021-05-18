import React, { useState } from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { debounce } from 'lodash';
import accountService from '@services/wallet/accountService';
import { useSelector } from 'react-redux';
import { accountSelector } from '@src/redux/selectors';
import { BottomBar } from '@components/core';
import { useFocusEffect, useNavigation } from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';

const enhance = WrappedComp => (props) => {
  const navigation = useNavigation();
  const account = useSelector(accountSelector.defaultAccountSelector);
  const wallet = useSelector((state) => state?.wallet);
  const [showBottom, setShowBottom] = useState(false);

  const detectUTXOSV1 = debounce(async () => {
    const { unspentCoins } = await accountService.getUnspentCoinsV1(account, wallet, true);
    const hasUnspentCoins = unspentCoins.some(coin => coin.balance > 0);
    setShowBottom(hasUnspentCoins);
  }, 500);

  const navigateConvert = () => {
    navigation.navigate(routeNames.Convert);
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!account || !wallet) return;
      detectUTXOSV1();
    }, [account, wallet]),
  );

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
        }}
      />
      {showBottom && (
        <BottomBar
          onPress={navigateConvert}
          text="Have unspent coins version 1"
        />
      )}
    </ErrorBoundary>
  );
};

export default enhance;
