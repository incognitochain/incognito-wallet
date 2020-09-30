import { THEME } from '@src/styles';
import { createStackNavigator } from 'react-navigation-stack';
import WhySend from '@screens/WhySend';
import WhyReceive from '@screens/WhyReceive';
import pApps from '@screens/Papps';
import HeaderBar from '@src/components/HeaderBar';
import AddPIN from '@src/screens/AddPIN';
import PriceChartCrypto from '@src/screens/PriceChartCrypto';
import DexHistory from '@screens/DexHistory';
import DexHistoryDetail from '@screens/DexHistoryDetail';
import Dex from '@screens/Dex';
import { navigationOptionsHandler } from '@src/utils/router';
import { getRoutesNoHeader } from './routeNoHeader';
import ROUTE_NAMES from './routeNames';

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
    [ROUTE_NAMES.PriceChartCrypto]: navigationOptionsHandler(PriceChartCrypto, {
      title: 'Price chart',
    }),
    [ROUTE_NAMES.DexHistory]: navigationOptionsHandler(DexHistory, { header: () => null }),
    [ROUTE_NAMES.DexHistoryDetail]: navigationOptionsHandler(DexHistoryDetail, { header: () => null }),
    [ROUTE_NAMES.Dex]: navigationOptionsHandler(Dex, { title: 'pDex', header: () => null }),
    ...RouteNoHeader,
  },
  {
    initialRouteName: ROUTE_NAMES.Home,
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

export default AppNavigator;
