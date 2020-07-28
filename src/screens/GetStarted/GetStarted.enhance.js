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
import { useNavigation, useFocusEffect } from 'react-navigation-hooks';
import { useMigrate } from '@src/components/UseEffect/useMigrate';
import storageService from '@src/services/storage';
import { LoadingContainer } from '@src/components/core';
import { actionFetch as actionFetchProfile } from '@screens/Profile';
import { actionFetchNews } from '@screens/News';
import { KEYS } from '@src/constants/keys';
import {
  wizardSelector,
  isFollowedDefaultPTokensSelector,
} from './GetStarted.selector';
import {
  actionToggleShowWizard,
  actionToggleFollowDefaultPTokens,
} from './GetStarted.actions';

const enhance = (WrappedComp) => (props) => {
  const { isFetching, isFetched } = useSelector(wizardSelector);
  const pin = useSelector((state) => state?.pin?.pin);
  const isFollowedDefaultPTokensMainnet = useSelector(
    isFollowedDefaultPTokensSelector,
  );
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const initialState = {
    isInitialing: true,
    isCreating: false,
    errorMsg: null,
  };
  const [state, setState] = React.useState({
    ...initialState,
  });
  const { errorMsg, isInitialing, isCreating } = state;

  const handleMigrateWizard = async () => {
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
      console.debug(error);
    }
  };

  const handleMigrateFollowToken = async () => {
    try {
      if (isFollowedDefaultPTokensMainnet) {
        await dispatch(
          actionToggleFollowDefaultPTokens({
            keySave: KEYS.IS_FOLLOW_DEFAULT_PTOKENS,
          }),
        );
      }
    } catch (error) {
      console.debug(error);
    }
  };

  const getDataWillMigrate = async () => {
    try {
      await new Promise.all([
        handleMigrateWizard(),
        handleMigrateFollowToken(),
      ]);
    } catch (error) {
      console.debug(error);
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
    let errorMessage = null;
    try {
      await setState({ ...initialState, isInitialing: true });
      await login();
      dispatch(actionFetchHomeConfigs());
      dispatch(getInternalTokenList());
      const [servers] = await new Promise.all([
        serverService.get(),
        dispatch(getPTokenList()),
        dispatch(loadPin()),
        dispatch(actionFetchProfile()),
        dispatch(actionFetchNews()),
      ]);
      if (!servers || servers?.length === 0) {
        await serverService.setDefaultList();
      }
      let wallet = await getExistedWallet();
      if (!wallet) {
        await setState({ ...state, isCreating: true });
        wallet = await handleCreateNew();
      }
      await goHome({ wallet });
    } catch (e) {
      errorMessage = new ExHandler(
        e,
        'Sorry, something went wrong while\nopening the wallet.\nPlease check your connection or re-install the application and try again.\n',
      )?.writeLog()?.message;
    } finally {
      await setState({
        ...state,
        isInitialing: false,
        isCreating: false,
        errorMsg: errorMessage,
      });
    }
  };

  React.useEffect(() => {
    requestAnimationFrame(() => {
      return initApp();
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (
        !isInitialing && //init app success
        !isCreating && //created wallet
        isMigrated && //migrate old data success
        isFetched && //finish splash screen
        !errorMsg //no error
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
    }, [isInitialing, isCreating, isMigrated, isFetched, errorMsg]),
  );

  if (isMigrating) {
    return <LoadingContainer size="large" />;
  }
  if (isFetching) {
    return <Wizard />;
  }
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{ ...props, errorMsg, isInitialing, isCreating, onRetry: initApp }}
      />
    </ErrorBoundary>
  );
};

export default enhance;
