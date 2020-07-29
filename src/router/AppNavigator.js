import { THEME } from '@src/styles';
import { createStackNavigator } from 'react-navigation-stack';
import WhySend from '@screens/WhySend';
import WhyReceive from '@screens/WhyReceive';
import pApps from '@screens/Papps';
import DexHistory from '@screens/DexHistory';
import DexHistoryDetail from '@screens/DexHistoryDetail';
import HeaderBar from '@src/components/HeaderBar';
import AddPIN from '@src/screens/AddPIN';
import PriceChartCrypto from '@src/screens/PriceChartCrypto';
import { navigationOptionsHandler } from '@src/utils/router';
import Dex from '@screens/Dex';
import NodeHelp from '@screens/NodeHelp';
import BuyNodeScreen from '@screens/BuyNodeScreen';
import PaymentBuyNodeScreen from '@src/screens/PaymentBuyNodeScreen';
import Node from '@screens/Node';
import AddNode from '@screens/AddNode';
import LinkDevice from '@screens/LinkDevice';
import AddStake from '@screens/AddStake';
import Unstake from '@screens/Unstake';
import AddSelfNode from '@screens/AddSelfNode';
import GetStartedAddNode from '@screens/GetStartedAddNode';
import RepairingSetupNode from '@screens/GetStartedAddNode/continueSetup/RepairingSetupNode';
import { getRoutesNoHeader } from './routeNoHeader';
import ROUTE_NAMES from './routeNames';

const RouteNoHeader = getRoutesNoHeader();

const AppNavigator = createStackNavigator(
  {
    [ROUTE_NAMES.DexHistory]: navigationOptionsHandler(DexHistory, {
      header: () => null,
    }),
    [ROUTE_NAMES.DexHistoryDetail]: navigationOptionsHandler(DexHistoryDetail, {
      header: () => null,
    }),
    [ROUTE_NAMES.AddPin]: navigationOptionsHandler(AddPIN, {
      header: () => null,
    }),
    [ROUTE_NAMES.Dex]: navigationOptionsHandler(Dex, {
      title: 'pDex',
      header: () => null,
    }),
    [ROUTE_NAMES.pApps]: navigationOptionsHandler(pApps),
    [ROUTE_NAMES.NodeHelp]: navigationOptionsHandler(NodeHelp, {
      title: 'Need help?',
    }),
    [ROUTE_NAMES.WhySend]: navigationOptionsHandler(WhySend, {
      header: () => null,
    }),
    [ROUTE_NAMES.WhyReceive]: navigationOptionsHandler(WhyReceive, {
      title: 'Receive',
    }),
    [ROUTE_NAMES.BuyNodeScreen]: navigationOptionsHandler(BuyNodeScreen, {
      headerTitleStyle: { alignSelf: 'center' },
      title: 'Buy Node',
    }),
    [ROUTE_NAMES.PriceChartCrypto]: navigationOptionsHandler(PriceChartCrypto, {
      title: 'Price chart',
    }),
    [ROUTE_NAMES.PaymentBuyNodeScreen]: navigationOptionsHandler(
      PaymentBuyNodeScreen,
      { title: 'Payment' },
    ),
    [ROUTE_NAMES.Node]: navigationOptionsHandler(Node, { header: () => null }),
    [ROUTE_NAMES.AddNode]: navigationOptionsHandler(AddNode, {
      title: 'Add Node',
    }),
    [ROUTE_NAMES.LinkDevice]: navigationOptionsHandler(LinkDevice, {
      title: 'Link Device',
    }),
    [ROUTE_NAMES.AddStake]: navigationOptionsHandler(AddStake, {
      title: 'Stake',
    }),
    [ROUTE_NAMES.Unstake]: navigationOptionsHandler(Unstake, {
      title: 'Unstake',
    }),
    [ROUTE_NAMES.AddSelfNode]: navigationOptionsHandler(AddSelfNode, {
      title: 'Virtual Node',
    }),
    [ROUTE_NAMES.GetStaredAddNode]: navigationOptionsHandler(
      GetStartedAddNode,
      { title: 'Setup Node' },
    ),
    [ROUTE_NAMES.RepairingSetupNode]: navigationOptionsHandler(
      RepairingSetupNode,
      { title: 'Continue setup' },
    ),
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
