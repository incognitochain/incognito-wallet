import 'react-native-console-time-polyfill';
import codePush from 'react-native-code-push';
import AppScreen from '@src/components/AppScreen';
import { StatusBar, Toast } from '@src/components/core';
import DeviceLog from '@src/components/DeviceLog';
import QrScanner from '@src/components/QrCodeScanner';
import configureStore from '@src/redux/store';
import AppContainer from '@src/router';
import ROUTE_NAMES from '@src/router/routeNames';
import NavigationService from '@src/services/NavigationService';
import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import NetInfo from '@react-native-community/netinfo';
import { Linking, Text } from 'react-native';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import Performance from '@screens/Performance';
import { devSelector } from '@screens/Dev';
import { CONSTANT_KEYS } from '@src/constants';
import { MAIN_WEBSITE } from './constants/config';
import LocalDatabase from './utils/LocalDatabase';
import ModalConnection from './components/Modal/ModalConnection';
import {
  actionSetCurrentScreen,
  actionSetPrevScreen,
} from './screens/Navigation';

const isShowDeviceLog = false;
const { store, persistor } = configureStore();
const codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL };

// gets the current screen from navigation state
function getActiveRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return getActiveRouteName(route);
  }
  return route.routeName;
}

const App = (props) => {
  const { setCurrentScreen } = props;
  const dispatch = useDispatch();
  const dev = useSelector(devSelector);
  const logApp = dev[CONSTANT_KEYS.DEV_TEST_TOGGLE_LOG_APP];
  return (
    <>
      <AppContainer
        ref={(navigatorRef) =>
          NavigationService.setTopLevelNavigator(navigatorRef)
        }
        onNavigationStateChange={(prevState, currentState) => {
          const prevScreen = getActiveRouteName(prevState);
          const currentScreen = getActiveRouteName(currentState);
          setCurrentScreen(currentScreen);
          dispatch(actionSetCurrentScreen(currentScreen));
          if (currentScreen !== prevScreen) {
            dispatch(actionSetPrevScreen(prevScreen));
            console.debug('CurrentScreen', currentScreen);
          }
        }}
      />
      {logApp && <Performance />}
    </>
  );
};

export const AppWrapper = (props) => () => {
  const [currentScreen, setCurrentScreen] = useState(ROUTE_NAMES.Wizard);
  const [
    currentNetworkConnectedState,
    setCurrentNetworkConnectedState,
  ] = useState(true);

  useEffect(() => {
    // Init recursive main website
    resetMainCommunity();
    // Notification
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.allowFontScaling = false;
    // Network state change
    listenNetworkChanges();
  }, []);

  const resetMainCommunity = async () => {
    // Init default website in community
    await LocalDatabase.setUriWebviewCommunity(MAIN_WEBSITE);
  };

  const listenNetworkChanges = () => {
    // Add event listener for network state changes
    NetInfo.addEventListener((state) => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);

      // I want to do this here because of
      // the state change from none => yes => It will check again and show overlay 1 time before set it to only first time veryly
      if (currentNetworkConnectedState === state?.isConnected) {
        setCurrentNetworkConnectedState(currentNetworkConnectedState);
      } else {
        setCurrentNetworkConnectedState(state?.isConnected);
      }
    });
  };

  const openSettingApp = () => {
    let messageErr = 'Can\'t handle settings url, please go to Setting manually';
    Linking.canOpenURL('app-settings:')
      .then((supported) => {
        if (!supported) {
          alert(messageErr);
        } else {
          return Linking.openURL('app-settings:');
        }
      })
      .catch((err) => alert(messageErr));
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar currentScreen={currentScreen} />
        <AppScreen>
          <App {...{ ...props, currentScreen, setCurrentScreen }} />
          {isShowDeviceLog && <DeviceLog />}
          <QrScanner />
          <Toast />
          <ModalConnection
            isVisible={false}
            onPressSetting={() => {
              openSettingApp();
            }}
            onPressOk={() => listenNetworkChanges()}
          />
        </AppScreen>
      </PersistGate>
    </Provider>
  );
};

App.propTypes = {
  setCurrentScreen: PropTypes.func.isRequired,
};

export default compose(
  codePush(codePushOptions),
  AppWrapper,
)(App);
