import React from 'react';
import { compose } from 'recompose';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { batch, useDispatch } from 'react-redux';
import { login } from '@src/services/auth';
import routeNames from '@src/router/routeNames';
import { ExHandler } from '@src/services/exception';
import serverService from '@src/services/wallet/Server';
import { useFocusEffect, useNavigation } from 'react-navigation-hooks';
import { actionFetch as actionFetchProfile } from '@screens/Profile';
import KeepAwake from 'react-native-keep-awake';
import {
  actionLoadDefaultWallet,
  loadAllMasterKeyAccounts,
} from '@src/redux/actions/masterKey';
import { actionFetchListPools } from '@screens/PDexV3/features/Pools';
import { requestUpdateMetrics } from '@src/redux/actions/app';
import { ANALYTICS } from '@src/constants';
import {actionFetch as actionFetchHomeConfigs} from '@screens/Home/Home.actions';
import {actionCheckUnreadNews} from '@screens/News';
import { actionFetchPairs } from '@screens/PDexV3/features/Swap';
import { setTokenHeader } from '@services/http';
import SplashScreen from 'react-native-splash-screen';
import withDetectStatusNetwork from './GetStarted.enhanceNetwork';
import withWizard from './GetStarted.enhanceWizard';
import withWelcome from './GetStarted.enhanceWelcome';

const enhance = (WrappedComp) => (props) => {
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setError] = React.useState('');
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const getErrorMsg = (error) => {
    const errorMessage = new ExHandler(
      error,
      'Something\'s not quite right. Please make sure you\'re connected to the internet.\n' +
        '\n' +
        'If your connection is strong but the app still won\'t load, please contact us at go@incognito.org.\n',
    )?.writeLog()?.message;
    return errorMessage;
  };

  const getHomeConfiguration = async () => {
    try {
      await new Promise.all([
        dispatch(actionFetchHomeConfigs()),
        dispatch(actionCheckUnreadNews()),
      ]);
    } catch (error) {
      console.log('Fetching configuration for home failed.', error);
    }
  };

  const configsApp = async () => {
    console.time('CONFIGS_APP');
    let hasError;
    let token;
    await setLoading(true);
    try {
      try {
        if (typeof global.login === 'function') {
          token = await global.login();
          setTokenHeader(token);
        }
      } catch (error) {
        console.log('CANT LOAD NEW ACCESS TOKEN');
        hasError = true;
      } finally {
        if (!token || hasError) {
          setError('Hey, you there? Your internet connection is unstable. Please check your network settings and launch the app again.');
        }
      }
      login();
      batch(() => {
        dispatch(actionFetchProfile());
        // dispatch(getInternalTokenList());
        dispatch(requestUpdateMetrics(ANALYTICS.ANALYTIC_DATA_TYPE.OPEN_APP));
        dispatch(actionFetchListPools());
        dispatch(actionFetchPairs(true));
      });
      const servers = await serverService.get();
      if (!servers || servers?.length === 0) {
        await serverService.setDefaultList();
      }
      await dispatch(actionLoadDefaultWallet());
      dispatch(loadAllMasterKeyAccounts());
    } catch (error) {
      hasError = !!error;
      await setError(getErrorMsg(error));
      throw error;
    }
    console.timeEnd('CONFIGS_APP');
    if (!hasError) {
      setTimeout(() => {
        setLoading(false);
        navigation.navigate(routeNames.MainTabBar);
      }, 2000);
    } else {
      setLoading(false);
    }
  };

  const onRetry = async () => {
    try {
      await configsApp();
    } catch {
      //
    }
  };

  React.useEffect(() => {
    onRetry();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getHomeConfiguration();
    }, []),
  );

  React.useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, errorMsg, loading, onRetry }} />
      <KeepAwake />
    </ErrorBoundary>
  );
};

export default compose(
  withDetectStatusNetwork,
  withWizard,
  withWelcome,
  enhance,
);
