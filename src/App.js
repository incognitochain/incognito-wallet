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
import 'react-native-console-time-polyfill';
import { Provider } from 'react-redux';
import AppUpdater from '@components/AppUpdater/index';
import { PersistGate } from 'redux-persist/integration/react';

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

  useEffect(() => {
    initNotification();
  }, []);

  const initNotification = () => {
    notificationInitialize();
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
        </AppScreen>
      </PersistGate>
    </Provider>
  );
};

export default codePush(codePushOptions)(App);

// If we want to wrap whole app into deeplink handler, we need
// const App = withDeepLinking(AppComponent);
// After that, export and wrap the least codePush.