import { THEME } from '@src/styles';
import { createStackNavigator } from 'react-navigation-stack';
import CreateAccount from '@src/screens/CreateAccount';
import ExportAccount from '@src/screens/ExportAccount';
import ImportAccount from '@src/screens/ImportAccount';
import NetworkSetting from '@src/screens/NetworkSetting';
import WalletDetail from '@src/screens/WalletDetail';
import SendCrypto from '@screens/SendCrypto';
import WhySend from '@screens/WhySend';
import WhyReceive from '@screens/WhyReceive';
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
import PriceChartCrypto from '@src/screens/PriceChartCrypto';
import { navigationOptionsHandler } from '@src/utils/router';
import Dex from '@screens/Dex';
import pUniswap from '@screens/Uniswap';
import UniswapHistory from '@screens/UniswapHistory';
import UniswapHistoryDetail from '@screens/UniswapHistoryDetail';
import Shield from '@screens/Shield';
import FrequentReceivers, {
  FrequentReceiversForm,
} from '@src/screens/SendCrypto/FrequentReceivers';
import Notification from '@src/screens/Notification';
import NodeHelp from '@screens/NodeHelp';
import BuyNodeScreen from '@screens/BuyNodeScreen';
import StakeHistory from '@screens/StakeHistory';
import StakeRecoverAccount from '@screens/Stake/features/RecoverAccount';
import StakeHistoryDetail from '@screens/StakeHistory/features/Detail';
import UniswapHelp from '@screens/UniswapHelp';
import PaymentBuyNodeScreen from '@src/screens/PaymentBuyNodeScreen';
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
    [ROUTE_NAMES.WalletDetail]: navigationOptionsHandler(WalletDetail),
    [ROUTE_NAMES.SendCrypto]: navigationOptionsHandler(SendCrypto, {
      title: 'Send',
    }),
    [ROUTE_NAMES.Shield]: navigationOptionsHandler(Shield, {
      title: 'Shield your crypto',
    }),
    [ROUTE_NAMES.TxHistoryDetail]: navigationOptionsHandler(TxHistoryDetail, {
      title: 'History Detail',
    }),
    [ROUTE_NAMES.Setting]: navigationOptionsHandler(Setting, { title: 'You' }),
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
      title: 'pKyber',
      header: () => null,
    }),
    [ROUTE_NAMES.UniswapHistory]: navigationOptionsHandler(UniswapHistory, {
      title: 'History',
    }),
    [ROUTE_NAMES.UniswapHistoryDetail]: navigationOptionsHandler(
      UniswapHistoryDetail,
      {
        title: 'Transaction Detail',
      },
    ),
    [ROUTE_NAMES.WhyShield]: navigationOptionsHandler(WhyShield, {
      title: 'Why Shield?',
    }),
    [ROUTE_NAMES.FrequentReceiversForm]: navigationOptionsHandler(
      FrequentReceiversForm,
    ),
    [ROUTE_NAMES.FrequentReceivers]: navigationOptionsHandler(
      FrequentReceivers,
    ),
    [ROUTE_NAMES.Notification]: navigationOptionsHandler(Notification),
    [ROUTE_NAMES.pApps]: navigationOptionsHandler(pApps),
    [ROUTE_NAMES.NodeHelp]: navigationOptionsHandler(NodeHelp, {
      title: 'Need help?',
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
      title: 'Send',
    }),
    [ROUTE_NAMES.WhyReceive]: navigationOptionsHandler(WhyReceive, {
      title: 'Receive',
    }),
    [ROUTE_NAMES.UniswapHelp]: navigationOptionsHandler(UniswapHelp, {
      title: 'FAQs',
    }),
    [ROUTE_NAMES.BuyNodeScreen]: navigationOptionsHandler(BuyNodeScreen, {
      headerTitleStyle: { alignSelf: 'center' },
      title: 'Buy Node',
    }),
    [ROUTE_NAMES.PriceChartCrypto]: navigationOptionsHandler(PriceChartCrypto, { title: 'Price chart' }),
    [ROUTE_NAMES.PaymentBuyNodeScreen]: navigationOptionsHandler(PaymentBuyNodeScreen, { title: 'Payment' }),
  },
  {
    initialRouteName: ROUTE_NAMES.RootTab,
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
