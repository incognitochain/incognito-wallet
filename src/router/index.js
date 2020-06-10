import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import AppNavigator from './AppNavigator';
import ROUTE_NAMES from './routeNames';
import SplashNavigator from './SplashNavigator';
import MinerNavigator from './MinerNavigator';

export default createAppContainer(
  createSwitchNavigator(
    {
      [ROUTE_NAMES.RootApp]: AppNavigator,
      [ROUTE_NAMES.RootSplash]: SplashNavigator,
      // [ROUTE_NAMES.RootMiner]: MinerNavigator,
    },
    {
      initialRouteName: ROUTE_NAMES.RootSplash,
    },
  ),
);
