import { createStackNavigator } from 'react-navigation-stack';
import GetStarted from '@src/screens/GetStarted';
import ROUTE_NAMES from './routeNames';

const SplashNavigator = createStackNavigator({
  [ROUTE_NAMES.GetStarted]: GetStarted
}, {
  initialRouteName: ROUTE_NAMES.GetStarted,
  headerMode: 'none'
});

export default SplashNavigator;
