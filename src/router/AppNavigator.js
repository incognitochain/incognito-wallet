import AppUpdater from '@components/AppUpdater';
import { LoadingContainer } from '@components/core';
import { WithdrawHistory } from '@models/dexHistory';
import pApps from '@screens/Papps';
import WhyReceive from '@screens/WhyReceive';
import WhySend from '@screens/WhySend';
import HeaderBar from '@src/components/HeaderBar';
import { loadPin } from '@src/redux/actions/pin';
import AddPIN from '@src/screens/AddPIN';
import { THEME } from '@src/styles';
import { navigationOptionsHandler } from '@src/utils/router';
import React, { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { useDispatch, useSelector } from 'react-redux';
import { currentScreenSelector } from '@screens/Navigation';
import RefillPRVModal from '@src/screens/RefillPRV/RefillPRV.Modal';
import ROUTE_NAMES from './routeNames';
import { getRoutesNoHeader } from './routeNoHeader';

const RouteNoHeader = getRoutesNoHeader();

const AppNavigator = createStackNavigator(
  {
    [ROUTE_NAMES.AddPin]: navigationOptionsHandler(AddPIN, {
      header: () => null,
    }),
    [ROUTE_NAMES.pApps]: navigationOptionsHandler(pApps),
    [ROUTE_NAMES.WhySend]: navigationOptionsHandler(WhySend, {
      header: () => null,
    }),
    [ROUTE_NAMES.WhyReceive]: navigationOptionsHandler(WhyReceive, {
      title: 'Receive',
    }),
    ...RouteNoHeader,
  },
  {
    initialRouteName: ROUTE_NAMES.MainTabBar,
    defaultNavigationOptions: ({ navigation }) => {
      const { routeName } = navigation.state;
      // You can do whatever you like here to pick the title based on the route name
      const title = routeName;
      return {
        title,
        headerLayoutPreset: 'center',
        header: HeaderBar,
        headerTitleAlign: 'center',
        headerTitleStyle: { alignSelf: 'center', textAlign: 'center' },
        headerBackground: THEME.header.backgroundColor,
        gesturesEnabled: false,
      };
    },
  },
);


const MainNavigator = (props) => {
  const { navigation } = props;

   const pinState = useSelector((state) => state?.pin);
   const { pin, authen, loading } = pinState;
   const [mounted, setMounted] = React.useState(false);
   const dispatch = useDispatch();
   const handleLoadPin = async () => dispatch(loadPin());
   
   const currentScreen = useSelector(currentScreenSelector);

   useEffect(() => {
     if (pin && !authen && currentScreen !== ROUTE_NAMES.Setting) {
       navigation?.navigate(ROUTE_NAMES.AddPin, { action: 'login' });
     }
   }, [pin]);

   const handleAppStateChange = useCallback(
     (nextAppState) => {
       if (mounted) {
         if (nextAppState === 'background') {
           // AppUpdater.update();
           if (pin && !WithdrawHistory.withdrawing) {
             navigation?.navigate(ROUTE_NAMES.AddPin, { action: 'login' });
             AddPIN.waiting = false;
           }
           if (WithdrawHistory.withdrawing) {
             AddPIN.waiting = true;
           }
         }
       }
     },
     [pinState, mounted],
   );

   useEffect(() => {
     AppState.addEventListener('change', handleAppStateChange);
     setMounted(true);
     return () => {
       setMounted(false);
       AppState.removeEventListener('change', handleAppStateChange);
     };
   }, [pinState]);
   useEffect(() => {
     handleLoadPin();
   }, []);
   if (loading) {
     return <LoadingContainer />;
   }
  return (
    <>
      <AppNavigator navigation={navigation} />
      <RefillPRVModal />
    </>
);
};

MainNavigator.router = AppNavigator.router;
export default MainNavigator;