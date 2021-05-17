import React from 'react';
import firebase from 'react-native-firebase';
import { actionInit, actionNavigate, normalizedData, } from '@src/screens/Notification';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withNavigation } from 'react-navigation';
import { ExHandler } from '@src/services/exception';
import ErrorBoundary from '@src/components/ErrorBoundary/ErrorBoundary';
import _ from 'lodash';
import { accountSelector } from '@src/redux/selectors';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { isIOS } from '@utils/platform';
import { Toast } from '@components/core';
import {
  getDurationShowMessage,
  handleGetFunctionConfigs
} from '@src/shared/hooks/featureConfig';
import { CONSTANT_APP } from '@src/constants';

const sentIds = {};
let component;

const notificationHandler = (notification) => {
  if (notification) {
    // process the notification
    if (notification.userInteraction && notification && component) {
      component.onNavigateNotification({
        ...notification,
        data: {
          ...notification,
          ...notification.data,
        }
      });
    }

    // (required) Called when a remote is received or opened, or local notification is opened
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  }
};

PushNotification.configure({
  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: notificationHandler,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: true,
});

const enhance = WrappedComponent =>
  class extends React.Component {
    onNavigateNotification = async notification => {
      try {
        // eslint-disable-next-line react/prop-types
        const { navigateNotification, navigation } = this.props;

        const _normalizedData = normalizedData({
          ...notification?.data,
          ...sentIds[notification?.data?.ID],
        });
        const featureName = CONSTANT_APP.FEATURES_TYPE_MAP[_normalizedData.type] || CONSTANT_APP.FEATURES_ROUTE_MAP[_normalizedData.screen];
        const feature = await handleGetFunctionConfigs(featureName);
        const { disabled, message } = feature;
        if (disabled) {
          const duration = getDurationShowMessage(message);
          Toast.showInfo(message, {duration});
          return;
        }
        await navigateNotification(
          _normalizedData,
          navigation,
        );
      } catch (error) {
        new ExHandler(error).showErrorToast();
      }
    };

    handleSendNotificationToSystem(notification) {
      try {
        if (!notification?.data) {
          return;
        }

        const { ID, Title, Content, message, title } = notification.data;

        if (sentIds[ID]) {
          return;
        }

        sentIds[ID] = notification.data;

        const newNotification = {
          autoCancel: true,
          title: Title || message,
          message: Content || title,
          userInfo: notification.data,
        };

        delete newNotification.id;
        return PushNotification.localNotification(newNotification);
      } catch (e) {
        console.debug('PUSH NOTIFICATION ERROR', e);
      }
    }

    componentDidMount() {
      this.onListenerEventFCM();
      component = this;
    }

    componentWillUnmount() {
      component = null;
    }

    componentDidUpdate(prevProps) {
      // eslint-disable-next-line react/prop-types
      const { accountList, initNotification } = this.props;
      // eslint-disable-next-line react/prop-types
      const { accountList: oldAccountList } = prevProps;
      if (!_.isEqual(accountList, oldAccountList)) {
        initNotification();
      }
    }

    onListenerEventFCM = async () => {
      await firebase
        .messaging()
        .ios.registerForRemoteNotifications();
      firebase.messaging().ios.getAPNSToken();

      firebase.messaging().subscribeToTopic(global.isMainnet ? 'all-production' : 'all-staging');

      firebase.messaging().onMessage(this.handleSendNotificationToSystem);
      firebase.notifications().onNotification(this.handleSendNotificationToSystem);

      if (isIOS()) {
        firebase
          .notifications()
          .onNotificationOpened(notificationOpen => {
            const notification = notificationOpen.notification;
            this.onNavigateNotification(notification);
          });
      }

      PushNotification.popInitialNotification(notificationHandler);
    };

    render() {
      return (
        <ErrorBoundary>
          <WrappedComponent {...this.props} />
        </ErrorBoundary>
      );
    }
  };

const mapState = state => ({
  accountList: accountSelector.listAccount(state),
});

const mapDispatch = {
  navigateNotification: actionNavigate,
  initNotification: actionInit,
};

enhance.propTypes = {
  navigateNotification: PropTypes.func.isRequired,
  navigation: PropTypes.any.isRequired,
  accountList: PropTypes.array.isRequired,
};

export default compose(withNavigation, connect(mapState, mapDispatch), enhance);
