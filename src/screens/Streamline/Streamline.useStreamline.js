import accountServices from '@src/services/wallet/accountService';
import { walletSelector } from '@src/redux/selectors/wallet';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from 'react-navigation-hooks';
import { CONSTANT_COMMONS } from '@src/constants';
import routeNames from '@src/router/routeNames';
import { ExHandler } from '@src/services/exception';
import { accountSeleclor } from '@src/redux/selectors';
import format from '@src/utils/format';
import { MAX_FEE_PER_TX } from '@src/components/EstimateFee/EstimateFee.utils';
import React from 'react';
import { actionFetch } from './Streamline.actions';

export const useStreamLine = () => {
  const isDev = !!global.isDEV || __DEV__;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const wallet = useSelector(walletSelector);
  const account = useSelector(defaultAccountSelector);
  const accountBalance = useSelector(
    accountSeleclor.defaultAccountBalanceSelector,
  );
  const onNavigateStreamLine = () => navigation.navigate(routeNames.Streamline);
  const handleNavigateWhyStreamline = () =>
    navigation.navigate(routeNames.WhyStreamline);
  const hasExceededMaxInputPRV = true;
  const [state, setState] = React.useState({
    shouldDisabledForm: false,
  });
  const { shouldDisabledForm } = state;
  const UTXONativeCoin = accountServices.getUTXOs(
    wallet,
    account,
    CONSTANT_COMMONS.PRV.id,
  );
  // const hasExceededMaxInputPRV = accountServices.hasExceededMaxInput(
  //   wallet,
  //   account,
  //   CONSTANT_COMMONS.PRV.id,
  // );
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
      desc: `${format.amount(
        MAX_FEE_PER_TX,
        CONSTANT_COMMONS.PRV.pDecimals,
        true,
      )} ${CONSTANT_COMMONS.PRV.symbol}`,
    },
    {
      title: 'UTXOs',
      desc: UTXONativeCoin,
      disabled: !isDev,
    },
  ];
  const handleDefragmentNativeCoin = async () => {
    try {
      if (
        shouldDisabledForm
        // || !hasExceededMaxInputPRV
      ) {
        return;
      }
      dispatch(actionFetch());
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

  React.useEffect(() => {
    setState({ ...state, shouldDisabledForm: accountBalance < MAX_FEE_PER_TX });
  }, [accountBalance]);

  useFocusEffect(React.useCallback(() => {}, []));

  return {
    hasExceededMaxInputPRV,
    onNavigateStreamLine,
    handleNavigateWhyStreamline,
    handleDefragmentNativeCoin,
    UTXONativeCoin,
    accountBalance,
    hookFactories,
    shouldDisabledForm,
  };
};
