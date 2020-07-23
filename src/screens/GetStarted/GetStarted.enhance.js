import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import Wizard from '@screens/Wizard';
import { useSelector, useDispatch } from 'react-redux';
import { login } from '@src/services/auth';
import { CONSTANT_CONFIGS, CONSTANT_KEYS } from '@src/constants';
import { reloadWallet, reloadAccountList } from '@src/redux/actions/wallet';
import { getPTokenList, getInternalTokenList } from '@src/redux/actions/token';
import { loadPin } from '@src/redux/actions/pin';
import routeNames from '@src/router/routeNames';
import { CustomError, ErrorCode, ExHandler } from '@src/services/exception';
import { savePassword } from '@src/services/wallet/passwordService';
import serverService from '@src/services/wallet/Server';
import { initWallet } from '@src/services/wallet/WalletService';
import { DEX } from '@src/utils/dex';
import accountService from '@src/services/wallet/accountService';
import { actionInit as initNotification } from '@src/screens/Notification';
import { actionFetch as actionFetchHomeConfigs } from '@screens/Home/Home.actions';
import { useNavigation, useIsFocused } from 'react-navigation-hooks';
import { useMigrate } from '@src/components/UseEffect/useMigrate';
import storageService from '@src/services/storage';
import { LoadingContainer } from '@src/components/core';
import { actionFetch as actionFetchProfile } from '@screens/Profile';
import { wizardSelector } from './GetStarted.selector';
import { actionToggleShowWizard } from './GetStarted.actions';

const enhance = (WrappedComp) => (props) => {
  const { isFetching, isFetched } = useSelector(wizardSelector);
  const pin = useSelector((state) => state?.pin?.pin);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [state, setState] = React.useState({
    isInitialing: true,
    isCreating: false,
    errorMsg: null,
    pTokens: [],
  });
  const { errorMsg, isInitialing, isCreating, pTokens } = state;

  const getDataWillMigrate = async () => {
    try {
      if (!isFetching && isFetched) {
        return;
      }
      const isDisplayed = await storageService.getItem(
        CONSTANT_KEYS.DISPLAYED_WIZARD,
      );
      if (isDisplayed) {
        await dispatch(actionToggleShowWizard({ isFetched: !!isDisplayed }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const { isFetching: isMigrating, isFetched: isMigrated } = useMigrate({
    getDataWillMigrate,
  });

  const handleCreateNew = async () => {
    try {
      await handleCreateWallet();
      const wallet = await dispatch(reloadWallet());
      if (wallet) {
        goHome();
        return wallet;
      } else {
        throw new Error('Load new wallet failed');
      }
    } catch (e) {
      throw e;
    }
  };

  const getExistedWallet = async () => {
    try {
      const wallet = await dispatch(
        reloadWallet(CONSTANT_CONFIGS.PASSPHRASE_WALLET_DEFAULT),
      );
      if (wallet) {
        return wallet;
      }
      return null;
    } catch (e) {
      throw new CustomError(ErrorCode.wallet_can_not_load_existed_wallet, {
        rawError: e,
      });
    }
  };

  const handleCreateWallet = async () => {
    try {
      await savePassword(CONSTANT_CONFIGS.PASSPHRASE_WALLET_DEFAULT);
      await initWallet();
    } catch (e) {
      throw new CustomError(ErrorCode.wallet_can_not_create_new_wallet, {
        rawError: e,
      });
    }
  };

  const onError = (msg) => setState({ ...state, errorMsg: msg });

  const goHome = async ({ wallet }) => {
    try {
      let isCreatedNewAccount = false;
      let accounts = await wallet.listAccount();
      if (!accounts.find((item) => item.AccountName === DEX.MAIN_ACCOUNT)) {
        const firstAccount = accounts[0];
        await accountService.createAccount(
          DEX.MAIN_ACCOUNT,
          wallet,
          accountService.parseShard(firstAccount),
        );
        isCreatedNewAccount = true;
      }
      if (!accounts.find((item) => item.AccountName === DEX.WITHDRAW_ACCOUNT)) {
        accounts = await wallet.listAccount();
        const dexMainAccount = accounts.find(
          (item) => item.AccountName === DEX.MAIN_ACCOUNT,
        );
        await accountService.createAccount(
          DEX.WITHDRAW_ACCOUNT,
          wallet,
          accountService.parseShard(dexMainAccount),
        );
        isCreatedNewAccount = true;
      }
      dispatch(initNotification());
      isCreatedNewAccount ? dispatch(reloadAccountList()) : false;
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

  const initApp = async () => {
    try {
      await setState({ ...state, isInitialing: true });
      dispatch(actionFetchHomeConfigs());
      dispatch(getInternalTokenList());
      await login();
      const [servers] = await new Promise.all([
        serverService.get(),
        dispatch(getPTokenList()),
        dispatch(loadPin()),
        dispatch(actionFetchProfile()),
      ]);
      if (!servers || servers?.length === 0) {
        await serverService.setDefaultList();
      }
      await setState({ ...state, pTokens });
      let wallet = await getExistedWallet();
      if (!wallet) {
        await setState({ ...state, isCreating: true });
        wallet = await handleCreateNew();
      }
      await goHome({ wallet });
    } catch (e) {
      onError(
        new ExHandler(
          e,
          'Sorry, something went wrong while opening the wallet. Please check your connection or re-install the application and try again.',
        )?.writeLog()?.message,
      );
    } finally {
      await setState({ ...state, isInitialing: false, isCreating: false });
    }
  };

  const onRetry = () => {
    initApp();
    setState({ ...state, errorMsg: null, isInitialing: true });
  };

  React.useEffect(() => {
    requestAnimationFrame(() => {
      return initApp();
    });
  }, []);

  React.useEffect(() => {
    if (
      !isInitialing &&
      isMigrated &&
      !isMigrating &&
      !isFetching &&
      isFetched &&
      isFocused
    ) {
      if (pin) {
        navigation.navigate(routeNames.AddPin, {
          action: 'login',
          redirectRoute: routeNames.Home,
        });
      } else {
        navigation.navigate(routeNames.Home);
      }
    }
  }, [
    isFetched,
    isFetching,
    isInitialing,
    isCreating,
    isFocused,
    isMigrating,
    isMigrated,
  ]);
  if (isMigrating) {
    return <LoadingContainer size="large" />;
  }
  if (isFetching) {
    return <Wizard />;
  }
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{ ...props, errorMsg, isInitialing, isCreating, onRetry }}
      />
    </ErrorBoundary>
  );
};

export default enhance;
