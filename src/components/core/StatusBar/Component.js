import { COLORS } from '@src/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform, StatusBar as RNComponent, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import routeNames from '@src/router/routeNames';

const {
  GetStarted,
  Game,
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
  SelectAccount,
  FollowToken,
  Shield,
  WhyShield,
  WalletDetail,
  Send,
  ShieldGenQRCode,
  AddManually,
  ReceiveCrypto,
  UnShield,
} = routeNames;

const whiteScreens = [
  Game,
  GetStarted,
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
  UnShield,
];
const blue2Screens = [];
const blue1Screens = [Wizard, Node];
const dark2Screen = [Dex, DexHistory, DexHistoryDetail];
const blackScreen = [];
const linearScreen = [Stake];

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

  if (linearScreen.includes(currentScreen)) {
    return null;
  } else if (whiteScreens.includes(currentScreen)) {
    backgroundColor = COLORS.white;
    textColor = 'dark-content';
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
    backgroundColor = COLORS.dark4;
    textColor = 'light-content';
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
