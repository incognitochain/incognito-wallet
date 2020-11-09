import { createStackNavigator } from 'react-navigation-stack';
import GetStarted from '@src/screens/GetStarted';
import CreateMasterKey from '@screens/BackUpPassphrase/subscreens/Create';
import Passphrase from '@screens/BackUpPassphrase/subscreens/Passphrase';
import VerifyPassPhase from '@screens/BackUpPassphrase/subscreens/Verify';
import HeaderBar from '@components/HeaderBar/index';
import { THEME } from '@src/styles';
import ROUTE_NAMES from './routeNames';

const SplashNavigator = createStackNavigator({
  [ROUTE_NAMES.GetStarted]: GetStarted,
  [ROUTE_NAMES.InitMasterKey]: CreateMasterKey,
  [ROUTE_NAMES.InitMasterKeyPhrase]: Passphrase,
  [ROUTE_NAMES.InitVerifyPassphrase]: VerifyPassPhase,
}, {
  initialRouteName: ROUTE_NAMES.GetStarted,
  headerMode: 'none',
  defaultNavigationOptions: () => ({
    gesturesEnabled: false,
  })
});

export default SplashNavigator;
