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
    name: routeNames.UnShield
  }
];

export const getRoutesNoHeader = () =>
  routes.reduce((result, route) => {
    result[(route?.name)] = navigationOptionsHandler(route?.screen, {
      header: () => null,
    });
    return result;
  }, {});
