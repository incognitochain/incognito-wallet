import { THEME } from '@src/styles';
import { createStackNavigator } from 'react-navigation-stack';
import WhySend from '@screens/WhySend';
import AddNode from '@src/screens/AddNode';
import Node from '@src/screens/Node';
import AddStake from '@src/screens/AddStake';
import Unstake from '@src/screens/Unstake';
import AddSelfNode from '@src/screens/AddSelfNode';
import LinkDevice from '@screens/LinkDevice';
import NodeBuyHelp from '@screens/NodeBuyHelp';
import DestinationBuyNode from '@screens/DestinationBuyNode';
import HeaderBar from '@src/components/HeaderBar';
import GetStartedAddNode from '@src/screens/GetStartedAddNode';
import NodeItemDetail from '@src/screens/Node/components/NodeItemDetail';
import RepairingSetupNode from '@src/screens/GetStartedAddNode/continueSetup/RepairingSetupNode';
import WhyReceive from '@screens/WhyReceive';
import pApps from '@screens/Papps';
import DexHistory from '@screens/DexHistory';
import DexHistoryDetail from '@screens/DexHistoryDetail';
import AddPIN from '@src/screens/AddPIN';
import PriceChartCrypto from '@src/screens/PriceChartCrypto';
import { navigationOptionsHandler } from '@src/utils/router';
import Dex from '@screens/Dex';

import Notification from '@src/screens/Notification';
import NodeHelp from '@screens/NodeHelp';
import NodeItemsHelp from '@screens/NodeItemsHelp';
import BuyNodeScreen from '@screens/BuyNodeScreen';
import StakeHistory from '@screens/StakeHistory';
import StakeRecoverAccount from '@screens/Stake/features/RecoverAccount';
import StakeHistoryDetail from '@screens/StakeHistory/features/Detail';
import PaymentBuyNodeScreen from '@src/screens/PaymentBuyNodeScreen';
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
    [ROUTE_NAMES.Notification]: navigationOptionsHandler(Notification),
    [ROUTE_NAMES.pApps]: navigationOptionsHandler(pApps),
    [ROUTE_NAMES.NodeHelp]: navigationOptionsHandler(NodeHelp, {
      header: () => null
    }),
    [ROUTE_NAMES.NodeItemsHelp]: navigationOptionsHandler(NodeItemsHelp, {
      header: () => null
    }),
    [ROUTE_NAMES.StakeHistory]: navigationOptionsHandler(StakeHistory, {
      title: 'Activities',
    }),
    [ROUTE_NAMES.StakeRecoverAccount]: navigationOptionsHandler(
      StakeRecoverAccount,
      {
        title: 'Recover Account',
      },
    ),
    [ROUTE_NAMES.StakeHistoryDetail]: navigationOptionsHandler(
      StakeHistoryDetail,
      {
        title: 'Activity Detail',
      },
    ),
    [ROUTE_NAMES.WhySend]: navigationOptionsHandler(WhySend, {
      header: () => null
    }),
    [ROUTE_NAMES.WhyReceive]: navigationOptionsHandler(WhyReceive, {
      title: 'Receive',
    }),
    [ROUTE_NAMES.BuyNodeScreen]: navigationOptionsHandler(BuyNodeScreen, {
      header: ()=>null,
    }),
    [ROUTE_NAMES.Node]: navigationOptionsHandler(Node, { header: () => null, }),
    [ROUTE_NAMES.AddNode]: navigationOptionsHandler(AddNode, { header: () => null, }),
    [ROUTE_NAMES.LinkDevice]: navigationOptionsHandler(LinkDevice, { header: () => null,}),
    [ROUTE_NAMES.AddStake]: navigationOptionsHandler(AddStake, { title: 'Stake' }),
    [ROUTE_NAMES.Unstake]: navigationOptionsHandler(Unstake, { header: () => null }),
    [ROUTE_NAMES.AddSelfNode]: navigationOptionsHandler(AddSelfNode, { header: () => null, }),
    [ROUTE_NAMES.GetStaredAddNode]: navigationOptionsHandler(GetStartedAddNode, { header: () => null,}),
    [ROUTE_NAMES.RepairingSetupNode]: navigationOptionsHandler(RepairingSetupNode, { header: () => null }),
    [ROUTE_NAMES.NodeItemDetail]: navigationOptionsHandler(NodeItemDetail, { header: () => null }),
    [ROUTE_NAMES.NodeBuyHelp]: navigationOptionsHandler(NodeBuyHelp, { header: () => null }),
    [ROUTE_NAMES.DestinationBuyNode]: navigationOptionsHandler(DestinationBuyNode, { header: () => null }),
    [ROUTE_NAMES.PriceChartCrypto]: navigationOptionsHandler(PriceChartCrypto, {
      title: 'Price chart',
    }),
    [ROUTE_NAMES.PaymentBuyNodeScreen]: navigationOptionsHandler(
      PaymentBuyNodeScreen,
      { header: () => null },
    ),
    [ROUTE_NAMES.Node]: navigationOptionsHandler(Node,{ header: () => null }),
    [ROUTE_NAMES.AddNode]: navigationOptionsHandler(AddNode, { header: () => null }),
    [ROUTE_NAMES.LinkDevice]: navigationOptionsHandler(LinkDevice, { header: () => null }),
    [ROUTE_NAMES.AddStake]: navigationOptionsHandler(AddStake, { header: () => null }),
    [ROUTE_NAMES.Unstake]: navigationOptionsHandler(Unstake, { header: () => null }),
    [ROUTE_NAMES.AddSelfNode]: navigationOptionsHandler(AddSelfNode, { header: () => null }),
    [ROUTE_NAMES.GetStaredAddNode]: navigationOptionsHandler(GetStartedAddNode, { header: () => null }),
    [ROUTE_NAMES.RepairingSetupNode]: navigationOptionsHandler(RepairingSetupNode, { header: () => null }),
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
