import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import dexUtil from '@utils/dex';
import { BIG_COINS } from '@screens/Dex/constants';
import { CONSTANT_EVENTS } from '@src/constants';
import { logEvent } from '@services/firebase';
import { useSelector } from 'react-redux';
import { defaultAccount } from '@src/redux/selectors/account';
import { useNavigation } from 'react-navigation-hooks';
import LinkingService from '@src/services/linking';
import AppUpdater from '@components/AppUpdater/index';
import { isIOS } from '@utils/platform';
import deviceInfo from 'react-native-device-info';
import { Dimensions, PixelRatio, Platform, Linking } from 'react-native';
import NavigationService from '@src/services/NavigationService';

const sendFeedback = async () => {
  const buildVersion = AppUpdater.appVersion;
  const { width, height } = Dimensions.get('window');
  const deviceInfomation = `${await deviceInfo.getModel()}, OS version ${
    Platform.Version
  }, screen size: ${PixelRatio.getPixelSizeForLayoutSize(
    height,
  )}x${PixelRatio.getPixelSizeForLayoutSize(width)}`;
  const title = `Incognito wallet ${buildVersion} ${
    isIOS() ? 'iOS' : 'Android'
  } ${deviceInfomation} feedback`;
  const email = 'go@incognito.org';
  let content =
    'Please include as much detail as possible. Thanks for your time!';

  LinkingService.openUrl(`mailto:${email}?subject=${title}&body=${content}`);
};

const enhance = WrappedComp => props => {
  const account = useSelector(defaultAccount);
  const navigation = useNavigation();

  const goToScreen = (route, params, event) => {
    navigation.navigate(route, params);
    if (event) {
      logEvent(event);
    }
  };
  const interactionById = item => {
    switch (item.key) {
    case 'buy_prv':
      goToScreen(
          item?.route || '',
          {
            inputTokenId: BIG_COINS.USDT,
            outputTokenId: BIG_COINS.PRV,
            outputValue: 1750e9,
          },
          CONSTANT_EVENTS.CLICK_HOME_BUY,
      );
      break;
    case 'trade':
      goToScreen(item?.route || '', {}, CONSTANT_EVENTS.CLICK_HOME_TRADE);
      break;
    case 'feedback':
      sendFeedback();
      break;
    case 'explorer':
      goToScreen('pApp', {url: item?.route});
      break;
    default:
      goToScreen(item?.route || '');
      break;
    }
  };

  const isDisabled = item => {
    if (item?.sortId === 'Send' && dexUtil.isDEXMainAccount(account.name)) {
      return true;
    }

    if (
      (item?.title === 'Receive' || item?.title === 'Shield') &&
      dexUtil.isDEXWithdrawAccount(account.name)
    ) {
      return true;
    }

    return false;
  };
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, interactionById, isDisabled }} />
    </ErrorBoundary>
  );
};

export default enhance;
