import { COLORS } from '@src/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform, StatusBar as RNComponent, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import routeNames from '@src/router/routeNames';

const {
  Wizard,
  Node,
  Dex,
  DexHistory,
  DexHistoryDetail,
  AddPin,
  Community,
  Home,
  Stake,
  CreateToken,
  HomeWallet,
  Wallet,
  FollowToken,
  Shield,
  WhyShield,
  WalletDetail,
  Send,
  ShieldGenQRCode,
  AddManually,
  ReceiveCrypto,
  UnShield,
  Trade,
  TradeConfirm,
  TradeHistoryDetail,
  TradeHistory,
  SelectAccount,
  TokenSelectScreen,
  UnShieldModal,
  pApp,
  TxHistoryDetail,
  GetStaredAddNode,
  ImportAccount,
  CreateAccount,
  ExportAccount,
  BackupKeys,
  Setting,
  NodeHelp,
  AddNode,
  LinkDevice,
  AddSelfNode,
  Unstake,
  NodeItemDetail,
  NetworkSetting,
  WhyUnshield,
  ExportAccountModal,
  AddressBook,
  AddressBookForm,
  CoinInfo,
  Keychain,
  CoinInfoVerify,
  FrequentReceivers,
  FrequentReceiversForm,
  WhySend,
  RepairingSetupNode,
  AddStake,
  BuyNodeScreen
} = routeNames;

const whiteScreens = [
  AddPin,
  Community,
  Home,
  CreateToken,
  HomeWallet,
  SelectAccount,
  FollowToken,
  Wallet,
  Shield,
  WhyShield,
  WalletDetail,
  Send,
  ShieldGenQRCode,
  AddManually,
  ReceiveCrypto,
  WhySend,
  UnShield,
  Trade,
  TradeConfirm,
  TradeHistory,
  TradeHistoryDetail,
  SelectAccount,
  TokenSelectScreen,
  UnShieldModal,
  pApp,
  TxHistoryDetail,
  Node,
  GetStaredAddNode,
  ImportAccount,
  CreateAccount,
  ExportAccount,
  BackupKeys,
  Setting,
  NodeHelp,
  NetworkSetting,
  AddNode,
  LinkDevice,
  AddSelfNode,
  Unstake,
  NodeItemDetail,
  WhyUnshield,
  ExportAccountModal,
  AddressBook,
  AddressBookForm,
  CoinInfo,
  Keychain,
  CoinInfoVerify,
  FrequentReceiversForm,
  RepairingSetupNode,
  AddStake,
  BuyNodeScreen,
];
const dark4Screens = [
  FrequentReceivers,
];
const blue2Screens = [];
const blue1Screens = [Node];
const dark2Screen = [Dex, DexHistory, DexHistoryDetail];
const blackScreen = [Wizard];

const isIOS = Platform.OS === 'ios';
const isIphoneX = DeviceInfo.hasNotch();

export const STATUS_BAR_HEIGHT = isIOS
  ? isIphoneX
    ? 40
    : 20
  : RNComponent.currentHeight;

const StatusBar = React.memo(({ currentScreen }) => {
  let backgroundColor;
  let textColor;

  if (dark4Screens.includes(currentScreen)) {
    backgroundColor = COLORS.dark4;
    textColor = 'light-content';
  } else if (blue2Screens.includes(currentScreen)) {
    backgroundColor = COLORS.blue2;
    textColor = 'light-content';
  } else if (blue1Screens.includes(currentScreen)) {
    backgroundColor = COLORS.blue1;
    textColor = 'light-content';
  } else if (dark2Screen.includes(currentScreen)) {
    backgroundColor = COLORS.dark2;
    textColor = 'light-content';
  } else if (blackScreen.includes(currentScreen)) {
    backgroundColor = COLORS.black;
    textColor = 'light-content';
  } else {
    backgroundColor = COLORS.white;
    textColor = 'dark-content';
  }

  if (!isIOS) {
    RNComponent.setBackgroundColor(backgroundColor);
    RNComponent.setBarStyle(textColor);
    return null;
  }

  return (
    <View
      style={{
        width: '100%',
        height: STATUS_BAR_HEIGHT,
        backgroundColor: backgroundColor,
      }}
    >
      <RNComponent barStyle={textColor} />
    </View>
  );
});

StatusBar.defaultProps = {
  currentScreen: '',
};

StatusBar.propTypes = {
  currentScreen: PropTypes.string,
};

export default StatusBar;
