import { COLORS } from '@src/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform, StatusBar as RNComponent, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import routeNames from '@src/router/routeNames';
import { useSelector } from 'react-redux';
import { wizardSelector } from '@src/screens/GetStarted/GetStarted.selector';

const { Wizard, Node, Dex, DexHistory, DexHistoryDetail, GetStaredAddNode } = routeNames;

const dark4Screens = [];
const blue2Screens = [GetStaredAddNode];
const blue1Screens = [Node, GetStaredAddNode];
const dark2Screen = [GetStaredAddNode];
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
  const { isFetched } = useSelector(wizardSelector);

  if (dark4Screens.includes(currentScreen)) {
    backgroundColor = COLORS.dark4;
    textColor = 'light-content';
  } else if (blue2Screens.includes(currentScreen)) {
    backgroundColor = COLORS.blue2;
    textColor = 'light-content';
  } else if (blue1Screens.includes(currentScreen)) {
    backgroundColor = COLORS.blue1;
    textColor = 'light-content';
  } else if (blackScreen.includes(currentScreen)) {
    backgroundColor = COLORS.black;
    textColor = 'light-content';
  } else {
    backgroundColor = COLORS.white;
    textColor = 'dark-content';
  }

  if (currentScreen === Wizard && isFetched) {
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
