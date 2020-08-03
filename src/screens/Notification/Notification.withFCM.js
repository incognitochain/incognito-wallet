import React from 'react';
import {
  actionNavigate,
  normalizedData,
  actionInit,
} from '@src/screens/Notification';
import firebase from 'react-native-firebase';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withNavigation } from 'react-navigation';
import { ExHandler } from '@src/services/exception';
import ErrorBoundary from '@src/components/ErrorBoundary/ErrorBoundary';
import _ from 'lodash';
import { accountSeleclor } from '@src/redux/selectors';
import { v4 } from 'uuid';
import { isAndroid } from '@utils/platform';

const sentIds = {};
const channelId = 'Incognito';
const channelName = 'Incogniton notification';
const channelDescription = 'Incognito notification';

const enhance = WrappedComponent =>
  class extends React.Component {
    onNavigateNotification = async notification => {
      try {
        const { navigateNotification, navigation } = this.props;
        await navigateNotification(
          normalizedData(notification?.data),
          navigation,
        );
      } catch (error) {
        new ExHandler(error).showErrorToast();
      }
    };

    getFCMToken = async () => {
      try {
        const fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {
          // user has a device token
          return fcmToken;
        } else {
          // user doesn't have a device token yet
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    handleSendNotificationToSystem(notification) {
      try {
        if (!notification?.data) {
          return;
        }

        const { ID, Title, Content } = notification.data;

        if (sentIds[ID]) {
          return;
        }

        const id = v4();
        sentIds[ID] = id;

        const localNotification = new firebase.notifications.Notification({
          sound: 'default',
          show_in_foreground: true,
        })
          .setNotificationId(id)
          .setTitle(Title)
          .setBody(Content)
          .setData(notification.data);

        if (isAndroid()) {
          const channel = new firebase.notifications.Android.Channel(
            channelId,
            channelName,
            firebase.notifications.Android.Importance.Max
          ).setDescription(channelDescription);
          firebase.notifications().android.createChannel(channel);

          localNotification
            .android.setChannelId(channelId)
            .android.setSmallIcon('ic_launcher')
            .android.setPriority(firebase.notifications.Android.Priority.High);
        }

        return firebase
          .notifications()
          .displayNotification(localNotification)
          .catch(err => console.error(err));
      } catch {
        //
      }
    }
    onListenerEventFCM = async () => {
      firebase.messaging().onMessage(notification => {
        this.handleSendNotificationToSystem(notification);
      });
      this.removeNotificationListener = firebase
        .notifications()
        .onNotification(notification => {
          this.handleSendNotificationToSystem(notification);
        });
      this.removeNotificationOpenedListener = firebase
        .notifications()
        .onNotificationOpened(notificationOpen => {
          const notification = notificationOpen.notification;
          this.onNavigateNotification(notification);
          firebase.notifications().removeDeliveredNotification(notification._notificationId ? notification._notificationId : notification.notificationId);
        });
      const notificationOpen = await firebase
        .notifications()
        .getInitialNotification();
      if (notificationOpen) {
        const notification = notificationOpen.notification;
        this.onNavigateNotification(notification);
      }
      await this.getFCMToken();
    };

    componentDidMount() {
      this.onListenerEventFCM();
    }

    componentDidUpdate(prevProps) {
      const { accountList, initNotification } = this.props;
      const { accountList: oldAccountList } = prevProps;
      if (!_.isEqual(accountList, oldAccountList)) {
        initNotification();
      }
    }

    render() {
      return (
        <ErrorBoundary>
          <WrappedComponent {...this.props} />
        </ErrorBoundary>
      );
    }
  };

const mapState = state => ({
  accountList: accountSeleclor.listAccount(state),
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
