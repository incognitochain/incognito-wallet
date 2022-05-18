import { navigationOptionsHandler } from '@src/utils/router';
import WhyShield from '@screens/Shield/features/WhyShield';
import SelectAccount from '@screens/SelectAccount';
import Home from '@screens/Home';
import Community from '@screens/Community';
import CreateToken from '@screens/CreateToken';
import Shield from '@screens/Shield';
import ShieldGenQRCode from '@screens/Shield/features/GenQRCode';
import FollowToken from '@screens/FollowToken';
import AddManually from '@screens/AddManually';
import WalletDetail from '@screens/Wallet/features/Detail';
import ReceiveCrypto from '@screens/Wallet/features/ReceiveCrypto';
import Send from '@screens/Send';
import UnshieldPortal from '@screens/UnshieldPortal';
import TokenSelectScreen from '@components/TokenSelectScreen';
import TradeConfirm from '@screens/DexV2/components/TradeConfirm';
import TradeHistory from '@screens/DexV2/components/History';
import TradeHistoryDetail from '@screens/DexV2/components/HistoryDetail';
import UnShieldModal from '@screens/UnShield/UnShield.modal';
import pApp from '@src/screens/PappView';
import TxHistoryDetail from '@screens/Wallet/features/History';
import ImportAccount from '@src/screens/Account/features/ImportAccount';
import CreateAccount from '@src/screens/Account/features/CreateAccount';
import BackupKeys from '@src/screens/BackupKeys';
import Standby from '@screens/Keychain/features/Standby';
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
  PoolV2LockHistory,
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
import Helper from '@screens/Helper/Helper';
import {
  CreateMasterKey,
  ImportMasterKey,
  KeysExplained,
  MasterKeyList,
  Passphrase,
  VerifyPassPhrase,
} from '@screens/BackUpPassphrase';
import ManageStorage from '@screens/ManageStorage';
import BackUpAllData from '@screens/BackUpAllData';
import RestoreAll from '@screens/RestoreAllData';
import UpdateFirmware from '@screens/Node/UpdateFirmware';
import ExportCSV from '@screens/ExportCSV';
import TermOfUseShield from '@screens/Shield/features/TermOfUseShield';
import MonitorDetail from '@screens/Node/MonitorDetail';
import ShieldDecentralizeDescription from '@screens/Shield/features/ShieldDecentralizeDescription';
import Convert from '@screens/Home/features/Convert';
import ConfirmLiquidity from '@screens/Dex/components/Confirm';
import HistoriesLiquidity from '@screens/Dex/features/Histories';
import HistoryWithdrawDetail from '@screens/Dex/features/HistoryWithdrawDetail';
import ConfirmRetryLiquidity from '@screens/Dex/features/ConfirmRetry';
import TwoTokensSelect from '@screens/Dex/features/TwoTokensSelect';
import SelectTokenStreamline from '@screens/Streamline/features/SelectTokens';
import ConvertTokenList from '@screens/Home/features/ConvertTokenList';
import HistoryConvert from '@src/screens/Home/features/HistoryConvert';
import HomePDexV3 from '@screens/PDexV3/features/Home';
import { PoolsList, PoolsTab } from '@screens/PDexV3/features/Pools';
import {
  OrdeSwapDetail,
  SwapRewardHistoryDetail,
} from '@screens/PDexV3/features/Swap';
import Trade, {
  ReviewOrder,
  TradeOrderHistory,
} from '@screens/PDexV3/features/Trade';
import NFTToken, { MintNFTToken } from '@screens/PDexV3/features/NFTToken';
import OrderLimit, {
  OrderLimitDetail,
} from '@src/screens/PDexV3/features/OrderLimit';
import SelectTokenTrade, {
  SelectTokenModal,
} from '@screens/PDexV3/features/SelectToken';
import Chart from '@screens/PDexV3/features/Chart';
import WebView from '@screens/WebView';
import {
  LiquidityHistories,
  ContributeHistoryDetail,
  RemoveLPDetail,
  WithdrawFeeLPDetail,
} from '@screens/PDexV3/features/LiquidityHistories';
import {
  Staking,
  StakingMoreCoins,
  StakingMoreInput,
  StakingDetail,
  StakingMoreConfirm,
  StakingWithdrawCoins,
  StakingWithdrawInvest,
  StakingWithdrawReward,
  StakingHistories,
  StakingHistoryDetail,
} from '@screens/PDexV3/features/Staking';
import {
  Contribute,
  CreatePool,
  RemovePool,
  ContributeConfirm,
  CreatePoolConfirm,
  RemovePoolConfirm,
} from '@screens/PDexV3/features/Liquidity';
import PairList from '@screens/PDexV3/features/PairList';
import MainTabBar from '@screens/MainTabBar';
import More from '@screens/MainTabBar/features/More';
import Market from '@screens/MainTabBar/features/Market';
import { SelectOptionModal } from '@components/SelectOption';
import {
  PrivacyAppsPancake,
  PrivacyAppsUni,
  PrivacyAppsCurve,
} from '@screens/PDexV3/features/PrivacyApps';
import MarketSearchCoins from '@screens/MainTabBar/features/Market/Market.searchCoins';
import HomeLP from '@screens/MainTabBar/features/HomeLP';
import Tutorial from '@screens/Turotial/Tutorial';
import LiquidityVer1 from '@screens/Dex/Liquidity';

const masterKeyRoutes = [
  {
    screen: MasterKeyList,
    name: routeNames.MasterKeys,
  },
  {
    screen: ImportMasterKey,
    name: routeNames.ImportMasterKey,
  },
  {
    screen: CreateMasterKey,
    name: routeNames.CreateMasterKey,
  },
  {
    screen: Passphrase,
    name: routeNames.MasterKeyPhrase,
  },
  {
    screen: VerifyPassPhrase,
    name: routeNames.VerifyPassphrase,
  },
  {
    screen: KeysExplained,
    name: routeNames.KeysExplained,
  },
];

const devRoutes = [
  {
    screen: ManageStorage,
    name: routeNames.ManageStorage,
  },
  {
    screen: BackUpAllData,
    name: routeNames.BackUpAllData,
  },
  {
    screen: RestoreAll,
    name: routeNames.RestoreAllData,
  },
];

const pDexV3Routes = [
  {
    screen: HomePDexV3,
    name: routeNames.HomePDexV3,
  },
  {
    screen: PoolsList,
    name: routeNames.PoolsList,
  },
  {
    screen: Trade,
    name: routeNames.Trade,
  },
  {
    screen: CreatePool,
    name: routeNames.CreatePool,
  },
  {
    screen: Contribute,
    name: routeNames.ContributePool,
  },
  {
    screen: RemovePool,
    name: routeNames.RemovePool,
  },
  {
    screen: ReviewOrder,
    name: routeNames.ReviewOrder,
  },
  {
    screen: OrderLimit,
    name: routeNames.OrderLimit,
  },
  {
    screen: SelectTokenTrade,
    name: routeNames.SelectTokenTrade,
  },
  {
    screen: Chart,
    name: routeNames.Chart,
  },
  {
    screen: NFTToken,
    name: routeNames.NFTToken,
  },
  {
    screen: MintNFTToken,
    name: routeNames.MintNFTToken,
  },
  {
    screen: LiquidityHistories,
    name: routeNames.LiquidityHistories,
  },
  {
    screen: ContributeHistoryDetail,
    name: routeNames.ContributeHistoryDetail,
  },
  {
    screen: RemoveLPDetail,
    name: routeNames.RemoveLPDetail,
  },
  {
    screen: WithdrawFeeLPDetail,
    name: routeNames.WithdrawFeeLPDetail,
  },
  {
    screen: Staking,
    name: routeNames.Staking,
  },
  {
    screen: StakingMoreCoins,
    name: routeNames.StakingMoreCoins,
  },
  {
    screen: StakingMoreInput,
    name: routeNames.StakingMoreInput,
  },
  {
    screen: StakingMoreConfirm,
    name: routeNames.StakingMoreConfirm,
  },
  {
    screen: StakingDetail,
    name: routeNames.StakingDetail,
  },
  {
    screen: StakingWithdrawCoins,
    name: routeNames.StakingWithdrawCoins,
  },
  {
    screen: StakingWithdrawInvest,
    name: routeNames.StakingWithdrawInvest,
  },
  {
    screen: StakingWithdrawReward,
    name: routeNames.StakingWithdrawReward,
  },
  {
    screen: StakingHistories,
    name: routeNames.StakingHistories,
  },
  {
    screen: StakingHistoryDetail,
    name: routeNames.StakingHistoryDetail,
  },
  {
    screen: TradeOrderHistory,
    name: routeNames.TradeOrderHistory,
  },
  {
    screen: PairList,
    name: routeNames.PairList,
  },
  {
    screen: OrderLimitDetail,
    name: routeNames.OrderLimitDetail,
  },
  {
    screen: ContributeConfirm,
    name: routeNames.ContributeConfirm,
  },
  {
    screen: CreatePoolConfirm,
    name: routeNames.CreatePoolConfirm,
  },
  {
    screen: RemovePoolConfirm,
    name: routeNames.RemovePoolConfirm,
  },
  {
    screen: OrdeSwapDetail,
    name: routeNames.OrdeSwapDetail,
  },
  {
    screen: SwapRewardHistoryDetail,
    name: routeNames.SwapRewardHistoryDetail,
  },
  {
    screen: PoolsTab,
    name: routeNames.PoolsTab,
  },
  {
    screen: SelectTokenModal,
    name: routeNames.SelectTokenModal,
  },
  {
    screen: PrivacyAppsPancake,
    name: routeNames.PrivacyAppsPancake,
  },
  {
    screen: PrivacyAppsUni,
    name: routeNames.PrivacyAppsUni,
  },
  {
    screen: PrivacyAppsCurve,
    name: routeNames.PrivacyAppsCurve,
  },
  {
    screen: MarketSearchCoins,
    name: routeNames.MarketSearchCoins,
  },
  {
    screen: HomeLP,
    name: routeNames.HomeLP,
  },
];

const homeRoutes = [
  {
    screen: MainTabBar,
    name: routeNames.MainTabBar,
  },
  {
    screen: More,
    name: routeNames.More,
  },
  {
    screen: Market,
    name: routeNames.Market,
  },
];

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
    screen: UnshieldPortal,
    name: routeNames.UnshieldPortal,
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
    screen: PoolV2Provide.InputMigration,
    name: routeNames.PoolV2ProvideMigrateInput,
  },
  {
    screen: PoolV2Provide.ConfirmMigration,
    name: routeNames.PoolV2ProvideMigrateConfirm,
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
    screen: PoolV2LockHistory.LockHistoryList,
    name: routeNames.PoolV2ProvideLockHistory,
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
  {
    screen: Helper,
    name: routeNames.Helper,
  },
  {
    screen: UpdateFirmware,
    name: routeNames.UpdateNodeFirmware,
  },
  {
    screen: ExportCSV,
    name: routeNames.ExportCSV,
  },
  {
    screen: TermOfUseShield,
    name: routeNames.TermOfUseShield,
  },
  {
    screen: MonitorDetail,
    name: routeNames.MonitorDetail,
  },
  {
    screen: ShieldDecentralizeDescription,
    name: routeNames.ShieldDecentralizeDescription,
  },
  {
    screen: Convert,
    name: routeNames.Convert,
  },
  {
    screen: ConfirmLiquidity,
    name: routeNames.ConfirmLiquidity,
  },
  {
    screen: HistoriesLiquidity,
    name: routeNames.HistoriesLiquidity,
  },
  {
    screen: HistoryWithdrawDetail,
    name: routeNames.HistoryWithdrawDetail,
  },
  {
    screen: ConfirmRetryLiquidity,
    name: routeNames.ConfirmRetryLiquidity,
  },
  {
    screen: TwoTokensSelect,
    name: routeNames.TwoTokensSelect,
  },
  {
    screen: SelectTokenStreamline,
    name: routeNames.SelectTokenStreamline,
  },
  {
    screen: ConvertTokenList,
    name: routeNames.ConvertTokenList,
  },
  {
    screen: HistoryConvert,
    name: routeNames.HistoryConvert,
  },
  {
    screen: Standby,
    name: routeNames.Standby,
  },
  {
    screen: WebView,
    name: routeNames.WebView,
  },
  {
    screen: SelectOptionModal,
    name: routeNames.SelectOptionModal,
  },
  {
    screen: Tutorial,
    name: routeNames.Tutorial,
  },
  {
    screen: LiquidityVer1,
    name: routeNames.LiquidityVer1,
  },
  ...masterKeyRoutes,
  ...devRoutes,
  ...pDexV3Routes,
  ...homeRoutes,
];

export const getRoutesNoHeader = () =>
  routes.reduce((result, route) => {
    result[route?.name] = navigationOptionsHandler(route?.screen, {
      header: () => null,
    });
    return result;
  }, {});
