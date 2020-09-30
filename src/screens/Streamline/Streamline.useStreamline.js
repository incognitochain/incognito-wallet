import accountServices from '@src/services/wallet/accountService';
import { walletSelector } from '@src/redux/selectors/wallet';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import { CONSTANT_COMMONS, CONSTANT_KEYS } from '@src/constants';
import routeNames from '@src/router/routeNames';
import { accountSeleclor } from '@src/redux/selectors';
import format from '@src/utils/format';
import { MAX_FEE_PER_TX } from '@src/components/EstimateFee/EstimateFee.utils';
import React from 'react';
import { devSelector } from '@screens/Dev';
import { actionFetch } from './Streamline.actions';
import {
  streamlineStorageSelector,
  streamlineDataSelector,
  streamlineSelector,
} from './Streamline.selector';

export const useStreamLine = () => {
  const keySave = CONSTANT_KEYS.UTXOS_DATA;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const wallet = useSelector(walletSelector);
  const account = useSelector(defaultAccountSelector);
  const accountBalance = useSelector(
    accountSeleclor.defaultAccountBalanceSelector,
  );
  const dev = useSelector(devSelector);
  const isAutoUTXOs = dev[CONSTANT_KEYS.DEV_TEST_TOGGLE_UTXOS];
  const streamline = useSelector(streamlineSelector);
  const { isFetching, isFetched, isPending } = streamline;
  const streamlineStorage = useSelector(streamlineStorageSelector);
  const { data } = streamlineStorage[keySave];
  const { totalFee, UTXONativeCoin, times, consolidated } = useSelector(
    streamlineDataSelector,
  );
  const onNavigateStreamLine = () => navigation.navigate(routeNames.Streamline);
  const handleNavigateWhyStreamline = () =>
    navigation.navigate(routeNames.WhyStreamline);
  const [state, setState] = React.useState({
    shouldDisabledForm: false,
  });
  const { shouldDisabledForm } = state;
  const hasExceededMaxInputPRV = isAutoUTXOs
    ? true
    : accountServices.hasExceededMaxInput(
      wallet,
      account,
      CONSTANT_COMMONS.PRV.id,
    );
  const hookFactories = [
    {
      title: 'Balance',
      desc: `${format.amount(
        accountBalance,
        CONSTANT_COMMONS.PRV.pDecimals,
        true,
      )} ${CONSTANT_COMMONS.PRV.symbol}`,
    },
    {
      title: 'Network fee',
      desc: `${format.amount(totalFee, CONSTANT_COMMONS.PRV.pDecimals, true)} ${
        CONSTANT_COMMONS.PRV.symbol
      }`,
    },
    {
      title: 'UTXO count',
      desc: UTXONativeCoin,
    },
  ];
  const handleDefragmentNativeCoin = async () => {
    if (shouldDisabledForm || !hasExceededMaxInputPRV) {
      return;
    }
    await dispatch(actionFetch());
  };

  const maxUTXOPerDefragment = Math.min(accountServices.NO_OF_INPUT_PER_DEFRAGMENT, UTXONativeCoin);

  React.useEffect(() => {
    setState({ ...state, shouldDisabledForm: accountBalance < MAX_FEE_PER_TX });
  }, [accountBalance]);

  return {
    hasExceededMaxInputPRV,
    onNavigateStreamLine,
    handleNavigateWhyStreamline,
    handleDefragmentNativeCoin,
    UTXONativeCoin,
    accountBalance,
    hookFactories,
    shouldDisabledForm,
    isFetched,
    isFetching,
    data,
    times,
    isPending,
    totalTimes: times,
    currentTime: consolidated,
    maxUTXOPerDefragment,
  };
};
