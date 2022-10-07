import { Linking } from 'react-native';
import { Toast } from '@src/components/core';
import NavigationService from '@services/NavigationService';
import routeNames from '@routers/routeNames';
import RNSettings from 'react-native-settings';

const LinkingService = {
  openUrl(url) {
    try {
      if (url && typeof url === 'string') {
        Linking.canOpenURL(url).then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            throw new Error('This URL is not supported');
          }
        });
      } else {
        throw new Error('URL must be string');
      }
    } catch {
      Toast.showError('Can not open this URL, please try again');
    }
  },

  openCommunityUrl(uri) {
    NavigationService.navigate(routeNames.Community, { uri });
  },

  openUrlInSide(uri) {
    NavigationService.navigate(routeNames.WebView, { url: uri });
  },

  openSettings() {
    Linking.openSettings();
  },

  openLocation() {
    return RNSettings.openSetting(RNSettings.ACTION_LOCATION_SOURCE_SETTINGS);
  },

  openInBrowser(url) {
    Linking.openURL(url).catch((err) => console.error(err));
  },
};

export default LinkingService;
