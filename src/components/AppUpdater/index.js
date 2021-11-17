/* eslint-disable react-native/split-platform-components */
import codePush from 'react-native-code-push';
import {
  ProgressBarAndroid,
  ProgressViewIOS,
  Platform,
} from 'react-native';
import React, { PureComponent } from 'react';
import Dialog, { DialogContent } from 'react-native-popup-dialog';
import { View, Text } from '@components/core';
import { CONSTANT_CONFIGS } from '@src/constants';
import { COLORS } from '@src/styles';

import { withNavigation } from 'react-navigation';
import routeNames from '@src/router/routeNames';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import {
  isToggleBackupAllKeysSelector,
  actionToggleBackupAllKeys,
} from '@src/screens/Setting';
import {actionLogEvent} from '@screens/Performance';
import { BtnClose, ButtonBasic } from '../Button';
import styles from './styles';

let displayedNews = false;
let ignored = false;
let data;

class AppUpdater extends PureComponent {
  static instance = null;
  static appVersion = CONSTANT_CONFIGS.BUILD_VERSION;
  static codePushVersion = '';

  static update = () => {
    if (AppUpdater.instance) {
      AppUpdater.instance.checkNewVersion();
    }
  };

  state = {
    percent: 0,
    downloading: false,
    updating: false,
    news: '',
    appVersion: '',
  };

  componentDidMount() {
    AppUpdater.instance = this;
    this.checkNewVersion();
  }

  closeNewsDialog = () => {
    this.setState({ news: '' });
  };

  async handleDisplayNews() {
    if (displayedNews) {
      return;
    }

    try {
      const { logEvent } = this.props;
      const metadata = await codePush.getUpdateMetadata();
      logEvent(JSON.stringify(metadata));
      const { isFirstRun, description, appVersion } = metadata || {};
      if (isFirstRun && description) {
        displayedNews = true;
        AppUpdater.appVersion = appVersion;
        this.setState({
          news: description,
          appVersion: CONSTANT_CONFIGS.BUILD_VERSION,
        });
      }
    } catch (error) {
      console.debug('DISPLAY NEWS', error);
    }
  }

  handleStatusChange = (newStatus) => {
    const { logEvent } = this.props;
    switch(newStatus) {
    case codePush.SyncStatus.CHECKING_FOR_UPDATE:
      logEvent('[CODE_PUSH] Checking for update.');
      break;
    case codePush.SyncStatus.DOWNLOADING_PACKAGE:
      logEvent('[CODE_PUSH] Downloading package.');
      break;
    case codePush.SyncStatus.AWAITING_USER_ACTION:
      logEvent('[CODE_PUSH] Awaiting user action.');
      break;
    case codePush.SyncStatus.INSTALLING_UPDATE:
      logEvent('[CODE_PUSH] Installing update.');
      break;
    case codePush.SyncStatus.UP_TO_DATE:
      logEvent('[CODE_PUSH] App up to date.');
      break;
    case codePush.SyncStatus.UPDATE_IGNORED:
      logEvent('[CODE_PUSH] Update cancelled by user.');
      break;
    case codePush.SyncStatus.UPDATE_INSTALLED:
      logEvent('[CODE_PUSH] Update installed and will be applied on restart.');
      break;
    case codePush.SyncStatus.UNKNOWN_ERROR:
      logEvent('[CODE_PUSH] An unknown error occurred.');
      break;
    }
    switch (newStatus) {
    case codePush.SyncStatus.DOWNLOADING_PACKAGE:
      this.setState({ downloading: true });
      break;
    case codePush.SyncStatus.INSTALLING_UPDATE:
      this.setState({ updating: true, downloading: false });
      break;
    case codePush.SyncStatus.UP_TO_DATE:
      this.handleDisplayNews();
      break;
    case codePush.SyncStatus.UPDATE_IGNORED:
      ignored = true;
      break;
    case codePush.SyncStatus.UNKNOWN_ERROR:
      console.debug('Update failed.');
      this.setState({ downloading: false, updating: false });
      break;
    }
  };

  handleDownload = (progress) => {
    const { logEvent } = this.props;
    const percent = Math.floor(
      (progress.receivedBytes / progress.totalBytes) * 100,
    );
    logEvent(JSON.stringify({ percent, progress }));
    this.setState({ percent });
  };

  async checkNewVersion() {
    if (ignored) {
      return;
    }
    const { logEvent } = this.props;
    logEvent('TEST::: 3');
    try {
      await codePush.sync(
        {
          updateDialog: {
            optionalInstallButtonLabel: 'Update',
          },
          checkFrequency: codePush.CheckFrequency.ON_APP_START,
          installMode: codePush.InstallMode.ON_NEXT_SUSPEND,
          mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
          minimumBackgroundDuration: 2 * 60,
          rollbackRetryOptions: {
            delayInHours: 0.5,
            maxRetryAttempts: 5
          }
        },
        this.handleStatusChange,
        this.handleDownload,
      );
    } catch (e) {
      console.debug('CODE PUSH ERROR', e);
    }
  }

  renderDownloadModal() {
    const { percent } = this.state;

    return (
      <View>
        {Platform.OS === 'android' ? (
          <ProgressBarAndroid
            progress={percent / 100}
            styleAttr="Horizontal"
            indeterminate={false}
            color={COLORS.black}
          />
        ) : (
          <ProgressViewIOS
            progressTintColor={COLORS.black}
            progress={percent / 100}
          />
        )}
        <Text style={[styles.desc, { marginTop: 10 }]}>{percent}%</Text>
      </View>
    );
  }

  renderInstallModal() {
    return <Text style={styles.desc}>Installing...</Text>;
  }

  handleRemindBackupAllKeys = () => {
    const { navigation, toggleBackupAllKeys } = this.props;
    toggleBackupAllKeys(false);
    setTimeout(() => {
      navigation.navigate(routeNames.BackupKeys);
    }, 200);
  };

  render() {
    const { downloading, updating, news, appVersion } = this.state;
    const { isToggleBackupAllKeys } = this.props;
    const disabled = !(updating || downloading || !!news) && !news;
    return (
      <View>
        {/*<Dialog visible={updating || downloading} dialogStyle={styles.dialog}>*/}
        {/*  <DialogContent>*/}
        {/*    <View style={styles.hook}>*/}
        {/*      <Text style={styles.title}>Update new version</Text>*/}
        {/*      {!downloading*/}
        {/*        ? this.renderDownloadModal()*/}
        {/*        : this.renderInstallModal()}*/}
        {/*    </View>*/}
        {/*  </DialogContent>*/}
        {/*</Dialog>*/}
        <Dialog
          visible={!!news}
          onTouchOutside={this.closeNewsDialog}
          dialogStyle={styles.dialog}
        >
          <DialogContent>
            <BtnClose
              style={styles.btnClose}
              onPress={this.closeNewsDialog}
              size={18}
            />
            <View style={styles.hook}>
              <Text style={styles.title}>{`What's new in ${appVersion}?`}</Text>
              <Text style={styles.desc}>{news}</Text>
            </View>
          </DialogContent>
        </Dialog>
        <Dialog
          visible={disabled && isToggleBackupAllKeys}
          dialogStyle={styles.dialog}
          onTouchOutside={this.handleRemindBackupAllKeys}
        >
          <DialogContent>
            <BtnClose
              style={styles.btnClose}
              onPress={this.handleRemindBackupAllKeys}
              size={18}
            />
            <View style={styles.hook}>
              <Text style={styles.title}>Updated new version</Text>
              <Text style={styles.desc}>
                {
                  'Congratulations, welcome to the latest Incognito app with Privacy version 2.\n Please back up all keychains in a safe place prior to doing any other actions, it will help you recover funds in unexpected circumstances.\n(Note: take your own risk if you ignore it)'
                }
              </Text>
              <ButtonBasic
                title="Go to backup"
                onPress={this.handleRemindBackupAllKeys}
                btnStyle={{ marginTop: 30 }}
              />
            </View>
          </DialogContent>
        </Dialog>
      </View>
    );
  }
}

const mapState = (state) => ({
  isToggleBackupAllKeys: isToggleBackupAllKeysSelector(state),
});

const mapDispatch = (dispatch) => ({
  toggleBackupAllKeys: (payload) =>
    dispatch(actionToggleBackupAllKeys(payload)),
  logEvent: (message) => dispatch(actionLogEvent({ desc: message }))
});

export default compose(
  withNavigation,
  connect(
    mapState,
    mapDispatch,
  ),
)(AppUpdater);
