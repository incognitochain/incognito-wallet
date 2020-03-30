import {THEME} from '@src/styles';
import {createStackNavigator} from 'react-navigation-stack';
import CreateAccount from '@src/screens/CreateAccount';
import ExportAccount from '@src/screens/ExportAccount';
import FollowToken from '@src/screens/FollowToken';
import CreateToken from '@src/screens/CreateToken';
import AddToken from '@src/screens/AddToken';
import ImportAccount from '@src/screens/ImportAccount';
import NetworkSetting from '@src/screens/NetworkSetting';
import WalletDetail from '@src/screens/WalletDetail';
import ReceiveCoin from '@src/screens/ReceiveCoin';
import SendCrypto from '@screens/SendCrypto';
import pApps from '@screens/Papps';
import TxHistoryDetail from '@src/screens/TxHistoryDetail';
import Setting from '@screens/Setting';
import DexHistory from '@screens/DexHistory';
import DexHistoryDetail from '@screens/DexHistoryDetail';
import HeaderBar from '@src/components/HeaderBar';
import pApp from '@src/screens/PappView';
import AddPIN from '@src/screens/AddPIN';
import BackupKeys from '@src/screens/BackupKeys';
import WhyShield from '@src/screens/WhyShield';
import {navigationOptionsHandler} from '@src/utils/router';
import Dex from '@screens/Dex';
import pUniswap from '@screens/Uniswap';
import UniswapHistory from '@screens/UniswapHistory';
import UniswapHistoryDetail from '@screens/UniswapHistoryDetail';
import Shield from '@screens/Shield';
import FrequentReceivers, {
  FrequentReceiversForm,
} from '@src/screens/SendCrypto/FrequentReceivers';
import NodeHelp from '@screens/NodeHelp';
import ROUTE_NAMES from './routeNames';
import TabNavigator from './TabNavigator';

const AppNavigator = createStackNavigator(
  {
    [ROUTE_NAMES.RootTab]: TabNavigator,
    [ROUTE_NAMES.NetworkSetting]: navigationOptionsHandler(NetworkSetting, {
      title: 'Network',
    }),
    [ROUTE_NAMES.CreateAccount]: navigationOptionsHandler(CreateAccount, {
      title: 'Create Account',
    }),
    [ROUTE_NAMES.ImportAccount]: navigationOptionsHandler(ImportAccount, {
      title: 'Import Account',
    }),
    [ROUTE_NAMES.ExportAccount]: navigationOptionsHandler(ExportAccount),
    [ROUTE_NAMES.FollowToken]: navigationOptionsHandler(FollowToken, {
      header: () => null,
    }),
    [ROUTE_NAMES.CreateToken]: navigationOptionsHandler(CreateToken, {
      title: 'Issue privacy coin',
    }),
    [ROUTE_NAMES.AddToken]: navigationOptionsHandler(AddToken, {
      title: 'Add manually',
    }),
    [ROUTE_NAMES.WalletDetail]: navigationOptionsHandler(WalletDetail),
    [ROUTE_NAMES.ReceiveCoin]: navigationOptionsHandler(ReceiveCoin, {
      title: 'Receive privacy coins',
    }),
    [ROUTE_NAMES.SendCrypto]: navigationOptionsHandler(SendCrypto, {
      title: 'Send',
    }),
    [ROUTE_NAMES.Shield]: navigationOptionsHandler(Shield, {
      title: 'Shield your crypto',
    }),
    [ROUTE_NAMES.TxHistoryDetail]: navigationOptionsHandler(TxHistoryDetail, {
      title: 'History Detail',
    }),
    [ROUTE_NAMES.Setting]: navigationOptionsHandler(Setting, {title: 'You'}),
    [ROUTE_NAMES.DexHistory]: navigationOptionsHandler(DexHistory, {
      header: () => null,
    }),
    [ROUTE_NAMES.DexHistoryDetail]: navigationOptionsHandler(DexHistoryDetail, {
      header: () => null,
    }),
    [ROUTE_NAMES.pApp]: navigationOptionsHandler(pApp),
    [ROUTE_NAMES.AddPin]: navigationOptionsHandler(AddPIN, {
      header: () => null,
    }),
    [ROUTE_NAMES.BackupKeys]: navigationOptionsHandler(BackupKeys, {
      title: 'Back up private keys',
    }),
    [ROUTE_NAMES.Dex]: navigationOptionsHandler(Dex, {
      title: 'pDex',
      header: () => null,
    }),
    [ROUTE_NAMES.pUniswap]: navigationOptionsHandler(pUniswap, {
      title: 'pUniswap',
      header: () => null,
    }),
    [ROUTE_NAMES.UniswapHistory]: navigationOptionsHandler(UniswapHistory, {
      title: 'History',
    }),
    [ROUTE_NAMES.UniswapHistoryDetail]: navigationOptionsHandler(UniswapHistoryDetail, {
      title: 'Transaction Detail',
    }),
    [ROUTE_NAMES.WhyShield]: navigationOptionsHandler(WhyShield, {
      title: 'Why Shield?',
    }),
    [ROUTE_NAMES.FrequentReceiversForm]: navigationOptionsHandler(
      FrequentReceiversForm,
    ),
    [ROUTE_NAMES.FrequentReceivers]: navigationOptionsHandler(
      FrequentReceivers,
    ),
    [ROUTE_NAMES.pApps]: navigationOptionsHandler(
      pApps,
    ),
    [ROUTE_NAMES.NodeHelp]: navigationOptionsHandler(
      NodeHelp,
      {
        title: 'Need help?'
      }
    ),
  },
  {
    initialRouteName: ROUTE_NAMES.RootTab,
    defaultNavigationOptions: ({navigation}) => {
      const {routeName} = navigation.state;
      // You can do whatever you like here to pick the title based on the route name
      const title = routeName;
      return {
        title,
        header: HeaderBar,
        headerBackground: THEME.header.backgroundColor,
        gesturesEnabled: false,
      };
    },
  },
);

export default AppNavigator;
