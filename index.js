import 'react-native-gesture-handler';
import '@src/services/polyfill';
import _ from 'lodash';
import { AppRegistry } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { name as appName } from './app.json';

global.isMainnet = true;
console.disableYellowBox = true;

global.isDebug = () => {
  return __DEV__ || global.isDEV;
};

if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

AppRegistry.registerRunnable(appName, async initParams => {
  const {default: serverService} = await import('@src/services/wallet/Server');
  const homeConfig = await AsyncStorage.getItem('home-config');
  const serverDefault =
    (await serverService.getDefaultIfNullGettingDefaulList()) ?? {};

  global.homeConfig = homeConfig;
  global.isMainnet =
    (_.isEmpty(serverDefault)
      ? global.isMainnet
      : serverService.isMainnet(serverDefault)) ?? true;
  const {default: App} = await import('@src/App');

  console.debug('GLOBAL', global.isMainnet, global.homeConfig);
  AppRegistry.registerComponent(appName, () => App);
  AppRegistry.runApplication(appName, initParams);
});
