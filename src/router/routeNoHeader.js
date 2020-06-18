import { navigationOptionsHandler } from '@src/utils/router';
import WhyShield from '@screens/Shield/features/WhyShield';
import SelectAccount from '@screens/SelectAccount';
import Home from '@screens/Home';
import Wallet from '@screens/Wallet/features/Home';
import Community from '@screens/Community';
import CreateToken from '@screens/CreateToken';
import Stake from '@screens/Stake';
import Shield from '@screens/Shield';
import ShieldGenQRCode from '@screens/Shield/features/GenQRCode';
import FollowToken from '@screens/FollowToken';
import AddManually from '@screens/AddManually';
import WalletDetail from '@screens/Wallet/features/Detail';
import UnShield from '@screens/UnShield';
import ReceiveCrypto from '@screens/Wallet/features/ReceiveCrypto';
import Send from '@screens/Send';
import TokenSelectScreen from '@components/TokenSelectScreen';
import Trade from '@screens/DexV2';
import TradeConfirm from '@screens/DexV2/components/TradeConfirm';
import TradeHistory from '@screens/DexV2/components/History';
import TradeHistoryDetail from '@screens/DexV2/components/HistoryDetail';
import UnShieldModal from '@screens/UnShield/UnShield.modal';
import pApp from '@src/screens/PappView';
import TxHistoryDetail from '@screens/Wallet/features/TxHistoryDetail';
import ImportAccount from '@src/screens/Account/features/ImportAccount';
import CreateAccount from '@src/screens/Account/features/CreateAccount';
import BackupKeys from '@src/screens/BackupKeys';
import Setting from '@screens/Setting';
import ExportAccount from '@src/screens/Account/features/ExportAccount';
import NetworkSetting from '@src/screens/NetworkSetting';
import WhyUnshield from '@src/screens/UnShield/features/WhyUnshield';
import ExportAccountModal from '@src/screens/Account/features/ExportAccount/ExportAccount.modal';
import AddressBook from '@src/screens/AddressBook';
import AddressBookForm from '@src/screens/AddressBook/AddressBook.form';
import CoinInfo from '@screens/Wallet/features/CoinInfo';
import Keychain from '@src/screens/Setting/features/Keychain';
import CoinInfoVerify from '@src/screens/Wallet/features/CoinInfo/CoinInfo.verify';
import routeNames from './routeNames';

const routes = [
  {
    screen: WhyShield,
    name: routeNames.WhyShield,
  },
  {
    screen: SelectAccount,
    name: routeNames.SelectAccount,
  },
  {
    screen: Home,
    name: routeNames.Home,
  },
  {
    screen: Wallet,
    name: routeNames.Wallet,
  },
  {
    screen: Community,
    name: routeNames.Community,
  },
  {
    screen: Shield,
    name: routeNames.Shield,
  },
  {
    screen: CreateToken,
    name: routeNames.CreateToken,
  },
  {
    screen: Stake,
    name: routeNames.Stake,
  },
  {
    screen: ShieldGenQRCode,
    name: routeNames.ShieldGenQRCode,
  },
  {
    screen: FollowToken,
    name: routeNames.FollowToken,
  },
  {
    screen: AddManually,
    name: routeNames.AddManually,
  },
  {
    screen: WalletDetail,
    name: routeNames.WalletDetail,
  },
  {
    screen: ReceiveCrypto,
    name: routeNames.ReceiveCrypto,
  },
  {
    screen: Send,
    name: routeNames.Send,
  },
  {
    screen: UnShield,
    name: routeNames.UnShield,
  },
  {
    screen: UnShieldModal,
    name: routeNames.UnShieldModal,
  },
  {
    screen: pApp,
    name: routeNames.pApp,
  },
  {
    screen: Trade,
    name: routeNames.Trade,
  },
  {
    screen: TradeConfirm,
    name: routeNames.TradeConfirm,
  },
  {
    screen: TradeHistory,
    name: routeNames.TradeHistory,
  },
  {
    screen: TradeHistoryDetail,
    name: routeNames.TradeHistoryDetail,
  },
  {
    screen: TokenSelectScreen,
    name: routeNames.TokenSelectScreen,
  },
  {
    screen: TxHistoryDetail,
    name: routeNames.TxHistoryDetail,
  },
  {
    screen: ImportAccount,
    name: routeNames.ImportAccount,
  },
  {
    screen: CreateAccount,
    name: routeNames.CreateAccount,
  },
  {
    screen: ExportAccount,
    name: routeNames.ExportAccount,
  },
  {
    screen: BackupKeys,
    name: routeNames.BackupKeys,
  },
  {
    screen: Setting,
    name: routeNames.Setting,
  },
  {
    screen: NetworkSetting,
    name: routeNames.NetworkSetting,
  },
  {
    screen: WhyUnshield,
    name: routeNames.WhyUnshield,
  },
  {
    screen: ExportAccountModal,
    name: routeNames.ExportAccountModal,
  },
  {
    screen: AddressBook,
    name: routeNames.AddressBook,
  },
  {
    screen: AddressBookForm,
    name: routeNames.AddressBookForm,
  },
  {
    screen: CoinInfo,
    name: routeNames.CoinInfo,
  },
  {
    screen: Keychain,
    name: routeNames.Keychain,
  },
  {
    screen: CoinInfoVerify,
    name: routeNames.CoinInfoVerify,
  },
];

export const getRoutesNoHeader = () =>
  routes.reduce((result, route) => {
    result[(route?.name)] = navigationOptionsHandler(route?.screen, {
      header: () => null,
    });
    return result;
  }, {});

export const getRoutesNameNoHeader = () => routes.map((route) => route?.name);
