/* eslint-disable react-native/split-platform-components */
import codePush from 'react-native-code-push';
import { ProgressBarAndroid, ProgressViewIOS, Platform } from 'react-native';
import React, { PureComponent } from 'react';
import 'react-native-console-time-polyfill';
import Dialog, { DialogContent } from 'react-native-popup-dialog';
import { View, Text } from '@components/core';
import { CONSTANT_CONFIGS } from '@src/constants';
import { COLORS } from '@src/styles';

import styles from './styles';
import { BtnClose } from '../Button';

let displayedNews = false;
let ignored = false;

class AppUpdater extends PureComponent {
  static instance = null;

  static appVersion = CONSTANT_CONFIGS.BUILD_VERSION;

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
      const metadata = await codePush.getUpdateMetadata();
      const { isFirstRun, description } = metadata || {};
      if (isFirstRun && description) {
        displayedNews = true;
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
    const percent = Math.floor(
      (progress.receivedBytes / progress.totalBytes) * 100,
    );
    this.setState({ percent });
  };

  async checkNewVersion() {
    if (ignored) {
      return;
    }

    try {
      await codePush.sync(
        {
          updateDialog: {
            optionalInstallButtonLabel: 'Update',
          },
          installMode: codePush.InstallMode.IMMEDIATE,
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

  render() {
    const { downloading, updating, news, appVersion } = this.state;
    return (
      <View>
        <Dialog
          visible={updating || downloading}
          dialogStyle={styles.dialog}
        >
          <DialogContent>
            <View style={styles.hook}>
              <Text style={styles.title}>Update new version</Text>
              {!downloading
                ? this.renderDownloadModal()
                : this.renderInstallModal()}
            </View>
          </DialogContent>
        </Dialog>
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
      </View>
    );
  }
}

export default AppUpdater;
