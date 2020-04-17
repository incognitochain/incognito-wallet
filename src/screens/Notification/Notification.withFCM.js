import React from 'react';
import { AppState } from 'react-native';
import {
  actionNavigate,
  normalizedData,
  actionHasNoti,
  actionFetch,
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
import {
  notificationSelector,
  recentlyNotificationSelector,
} from './Notification.selector';
import { actionUpdateRecently } from './Notification.actions';

const sentIds = {};
const channelId = 'Incognito';
const channelName = 'Incogniton notification';
const channelDescription = 'Incognito notification';

const enhance = WrappedComponent =>
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        appState: AppState.currentState,
      };
    }

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
    onFetchNotifications = async ({ fetchNotifications }) => {
      try {
        await fetchNotifications();
      } catch (error) {
        new ExHandler(error).showErrorToast();
      }
    };

    _handleAppStateChange = async nextAppState => {
      const { appState } = this.state;
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        await this.onFetchNotifications(this.props);
      }
      await this.setState({ appState: nextAppState });
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

    handleHasNotification = async notification => {
      try {
        const {
          hasNotification,
          updateRecently,
          fetchNotifications,
        } = this.props;
        const payload = normalizedData(notification?.data);
        await hasNotification(payload);
        await updateRecently(payload);
        await fetchNotifications();
      } catch (error) {
        new ExHandler(error).showErrorToast();
      }
    };

    onListenerEventFCM = async () => {
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
  notification: notificationSelector(state),
  recently: recentlyNotificationSelector(state),
  accountList: accountSeleclor.listAccount(state),
});

const mapDispatch = {
  navigateNotification: actionNavigate,
  hasNotification: actionHasNoti,
  fetchNotifications: actionFetch,
  updateRecently: actionUpdateRecently,
  initNotification: actionInit,
};

enhance.propTypes = {
  navigateNotification: PropTypes.func.isRequired,
  navigation: PropTypes.any.isRequired,
  hasNotification: PropTypes.func.isRequired,
  fetchNotifications: PropTypes.func.isRequired,
  notification: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    isFetched: PropTypes.bool.isRequired,
    isRefresh: PropTypes.bool.isRequired,
    data: PropTypes.any.isRequired,
    recently: PropTypes.any.isRequired,
  }).isRequired,
  updateRecently: PropTypes.func.isRequired,
  recently: PropTypes.any.isRequired,
  accountList: PropTypes.array.isRequired,
};

export default compose(withNavigation, connect(mapState, mapDispatch), enhance);
