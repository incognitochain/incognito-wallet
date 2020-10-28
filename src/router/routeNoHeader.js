import { navigationOptionsHandler } from '@src/utils/router';
import WhyShield from '@screens/Shield/features/WhyShield';
import SelectAccount from '@screens/SelectAccount';
import Home from '@screens/Home';
import Wallet from '@screens/Wallet/features/Home';
import Community from '@screens/Community';
import CreateToken from '@screens/CreateToken';
import Shield from '@screens/Shield';
import ShieldGenQRCode from '@screens/Shield/features/GenQRCode';
import FollowToken from '@screens/FollowToken';
import AddManually from '@screens/AddManually';
import WalletDetail from '@screens/Wallet/features/Detail';
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
import CoinInfo from '@screens/Wallet/features/CoinInfo';
import Keychain from '@src/screens/Setting/features/Keychain';
import CoinInfoVerify from '@src/screens/Wallet/features/CoinInfo/CoinInfo.verify';
import News from '@screens/News';
import FrequentReceivers, {
  FrequentReceiversForm,
  SelectNetworkName,
} from '@screens/FrequentReceivers';
import {
  PoolV2,
  PoolV2History,
  PoolV2Provide,
  PoolV2Withdraw,
} from '@src/screens/PoolV2';
import Profile from '@src/screens/Profile';
import Receipt from '@src/components/Receipt';
import NodeItemsHelp from '@screens/NodeItemsHelp';
import DestinationBuyNode from '@screens/DestinationBuyNode';
import ItemSelectScreen from '@components/ItemSelectScreen';
import NodeReturnPolicy from '@screens/BuyNodeScreen/NodeReturnPolicy';
import routeNames from '@routers/routeNames';
import BuyNodeScreen from '@screens/BuyNodeScreen';
import NodeHelp from '@screens/NodeHelp';
import PaymentBuyNodeScreen from '@screens/PaymentBuyNodeScreen';
import Node from '@screens/Node';
// import Node from '@screens/Node/Node';

import AddNode from '@screens/AddNode';
import LinkDevice from '@screens/LinkDevice';
import AddStake from '@screens/AddStake';
import Unstake from '@screens/Unstake';
import AddSelfNode from '@screens/AddSelfNode';
import GetStartedAddNode from '@screens/GetStartedAddNode';
import RepairingSetupNode from '@screens/GetStartedAddNode/continueSetup/RepairingSetupNode';
import NodeItemDetail from '@screens/Node/components/NodeItemDetail';
import NodeUpdateWifi from '@screens/Node/UpdateWifi';
import Streamline from '@screens/Streamline';
import WhyStreamline from '@screens/Streamline/features/WhyStreamLine';
import TxHistoryReceive from '@screens/Wallet/features/TxHistoryReceive';
import Event from '@screens/Event';

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
  {
    screen: FrequentReceivers,
    name: routeNames.FrequentReceivers,
  },
  {
    screen: FrequentReceiversForm,
    name: routeNames.FrequentReceiversForm,
  },
  {
    screen: PoolV2.Home,
    name: routeNames.PoolV2,
  },
  {
    screen: PoolV2.Help,
    name: routeNames.PoolV2Help,
  },
  {
    screen: PoolV2Provide.SelectCoin,
    name: routeNames.PoolV2ProvideSelectCoin,
  },
  {
    screen: PoolV2Provide.Input,
    name: routeNames.PoolV2ProvideInput,
  },
  {
    screen: PoolV2Provide.Confirm,
    name: routeNames.PoolV2ProvideConfirm,
  },
  {
    screen: PoolV2Withdraw.SelectCoin,
    name: routeNames.PoolV2WithdrawSelectCoin,
  },
  {
    screen: PoolV2Withdraw.Rewards,
    name: routeNames.PoolV2WithdrawRewards,
  },
  {
    screen: PoolV2Withdraw.Provision,
    name: routeNames.PoolV2WithdrawProvision,
  },
  {
    screen: PoolV2History.HistoryList,
    name: routeNames.PoolV2History,
  },
  {
    screen: PoolV2History.HistoryDetail,
    name: routeNames.PoolV2HistoryDetail,
  },
  {
    name: routeNames.News,
    screen: News,
  },
  {
    name: routeNames.Profile,
    screen: Profile,
  },
  {
    screen: Receipt,
    name: routeNames.Receipt,
  },
  {
    screen: NodeItemsHelp,
    name: routeNames.NodeItemsHelp,
  },
  {
    name: routeNames.DestinationBuyNode,
    screen: DestinationBuyNode,
  },
  {
    name: routeNames.ItemSelectScreen,
    screen: ItemSelectScreen,
  },
  {
    name: routeNames.NodeReturnPolicy,
    screen: NodeReturnPolicy,
  },
  {
    name: routeNames.BuyNodeScreen,
    screen: BuyNodeScreen,
  },
  {
    name: routeNames.NodeHelp,
    screen: NodeHelp,
  },
  {
    name: routeNames.PaymentBuyNodeScreen,
    screen: PaymentBuyNodeScreen,
  },
  {
    name: routeNames.Node,
    screen: Node,
  },
  {
    name: routeNames.AddNode,
    screen: AddNode,
  },
  {
    name: routeNames.LinkDevice,
    screen: LinkDevice,
  },
  {
    name: routeNames.AddStake,
    screen: AddStake,
  },
  {
    name: routeNames.AddSelfNode,
    screen: AddSelfNode,
  },
  {
    name: routeNames.Unstake,
    screen: Unstake,
  },
  {
    name: routeNames.GetStaredAddNode,
    screen: GetStartedAddNode,
  },
  {
    name: routeNames.RepairingSetupNode,
    screen: RepairingSetupNode,
  },
  {
    name: routeNames.NodeItemDetail,
    screen: NodeItemDetail,
  },
  {
    name: routeNames.NodeUpdateWifi,
    screen: NodeUpdateWifi,
  },
  {
    screen: SelectNetworkName,
    name: routeNames.SelectNetworkName,
  },
  {
    screen: Streamline,
    name: routeNames.Streamline,
  },
  {
    screen: WhyStreamline,
    name: routeNames.WhyStreamline,
  },
  {
    screen: TxHistoryReceive,
    name: routeNames.TxHistoryReceive,
  },
  {
    screen: Event,
    name: routeNames.Event,
  },
];

export const getRoutesNoHeader = () =>
  routes.reduce((result, route) => {
    result[(route?.name)] = navigationOptionsHandler(route?.screen, {
      header: () => null,
    });
    return result;
  }, {});
