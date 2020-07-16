import 'react-native-console-time-polyfill';
import codePush from 'react-native-code-push';
import AppScreen from '@src/components/AppScreen';
import { StatusBar, Toast } from '@src/components/core';
import DeviceLog from '@src/components/DeviceLog';
import QrScanner from '@src/components/QrCodeScanner';
import configureStore from '@src/redux/store';
import AppContainer from '@src/router';
import ROUTE_NAMES from '@src/router/routeNames';
import { notificationInitialize } from '@src/services/notification';
import NavigationService from '@src/services/NavigationService';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import AppUpdater from '@components/AppUpdater/index';
import { PersistGate } from 'redux-persist/integration/react';
import NetInfo from '@react-native-community/netinfo';
import { Linking, Text } from 'react-native';
import { MAIN_WEBSITE } from './constants/config';
import LocalDatabase from './utils/LocalDatabase';
import ModalConnection from './components/Modal/ModalConnection';

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

const App = () => {
  const [currentScreen, setCurrentScreen] = useState(ROUTE_NAMES.Wizard);
  const [currentNetworkConnectedState, setCurrentNetworkConnectedState] = useState(true);

  useEffect(() => {
    // Init recursive main website
    resetMainCommunity();
    // Notification
    initNotification();
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
    NetInfo.addEventListener(state => {
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

  const initNotification = () => {
    notificationInitialize();
  };

  const openSettingApp = () => {
    let messageErr = 'Can\'t handle settings url, please go to Setting manually';
    Linking.canOpenURL('app-settings:')
      .then(supported => {
        if (!supported) {
          alert(messageErr);
        } else {
          return Linking.openURL('app-settings:');
        }
      })
      .catch(err => alert(messageErr));
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar currentScreen={currentScreen} />
        <AppScreen>
          <AppContainer
            ref={navigatorRef => NavigationService.setTopLevelNavigator(navigatorRef)}
            onNavigationStateChange={(prevState, currentState) => {
              const currentScreen = getActiveRouteName(currentState);
              setCurrentScreen(currentScreen);
              console.debug('CurrentScreen', currentScreen);
            }}
          />
          {isShowDeviceLog && <DeviceLog />}
          <AppUpdater />
          <QrScanner />
          <Toast />
          <ModalConnection
            isVisible={false}
            onPressSetting={() => { openSettingApp(); }}
            onPressOk={() => listenNetworkChanges()}
          />
        </AppScreen>
        {/*<Timer />*/}
      </PersistGate>
    </Provider>
  );
};

export default codePush(codePushOptions)(App);
