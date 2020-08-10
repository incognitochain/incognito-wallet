import React, { PureComponent } from 'react';
import { Platform, ScrollView, View, Alert } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import DeviceInfo from 'react-native-device-info';
import { getTimeZone } from 'react-native-localize';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  ActivityIndicator,
  Button,
  InputExtension as Input,
  Text,
  TouchableOpacity
} from '@src/components/core';
import knownCode from '@src/services/exception/customError/code/knownCode';
import NodeService from '@src/services/NodeService';
import APIService from '@services/api/miner/APIService';
import Util from '@utils/Util';
import NetInfo from '@react-native-community/netinfo';
import RNSettings from 'react-native-settings';
import { CustomError } from '@services/exception';
import { PASS_HOSPOT } from 'react-native-dotenv';
import LocalDatabase from '@utils/LocalDatabase';
import { DEVICES } from '@src/constants/miner';
import { CONSTANT_MINER } from '@src/constants';
import clipboard from '@services/clipboard';
import LongLoading from '@components/LongLoading/index';
import { Icon } from 'react-native-elements';
import { COLORS } from '@src/styles';
import LogManager from '@src/services/LogManager';
import ModalConnectWifi from '@src/components/Modal/ModalConnection/ModalConnectWifi';
import { isIOS } from '@src/utils/platform';
import { ScreenHeight, ScreenWidth } from '@src/utils/devices';
import theme from '@src/styles/theme';
import { LineView } from '@src/components/Line';
import { Header } from '@src/components';
import NavigationService from '@src/services/NavigationService';
import styles from './styles';

export const TAG = 'UpdateWifi';

class UpdateWifi extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      ssid: '',
      lastVerifyCode: '',
      verifyCode: '',
      isCorrectWifi: false,
      password: '',
      date: new Date(),
      backToQRCode: false,
      error: '',
      steps: [],
      connectWifi: {
        shouldShowModalConnectWifi: false,
        isCheckingWifiConnection: false,
        isConnected: false,
        title: 'We are trying to connect to your network',
      },
    };
    this.isMounteds = false;
    this.scrollView = React.createRef();
    this.funcQueue = [];
  }

  tryAtMost = async (promiseFunc, count = 6, delayToTry = 1) => {
    if (count > 0 && promiseFunc && this.isMounteds === true) {
      const result = await promiseFunc().catch(e => e);
      console.log(`tryAtMost result = ${result}, count = ${count}---isEROR = ${result instanceof Error}`);
      if (result instanceof Error) {
        if (_.isNumber(delayToTry)) {
          await Util.delay(delayToTry);
        }
        return await this.tryAtMost(promiseFunc, count - 1, delayToTry);
      }
      return result;
    }
    return Promise.reject(`Tried ${count} times and failed`);
  };

  // Get current wifi name
  // with device connected
  getWifiSSID = (empty = false) => {
    return this.tryAtMost(async () => {
      let ssid;
      try {
        ssid = await WifiManager.getCurrentWifiSSID();
      } catch {
        ssid = '';
      }
      if (!empty && !ssid) {
        throw new Error('Could not find Wi-Fi name');
      }

      if (ssid.includes('unknown ssid')) {
        ssid = '';
        throw new Error('Could not find Wi-Fi name');
      }

      return ssid;
    }, 15, 2);
  };

  componentDidMount() {
    this.isMounteds = true;
    this.getCurrentWifi();
    this.updateLastVerifyCode();
  }

  componentDidUpdate(prevProps, prevState) {
    const { ssid, password } = this.state;

    if (ssid !== prevState.ssid || password !== prevState.password) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ error: '', isCorrectWifi: false });
    }
  }

  // Check last verify code if exist => Set state for current verifyCode
  async updateLastVerifyCode() {
    await LocalDatabase.saveVerifyCode('');
  }

  componentWillUnmount() {
    this.isMounteds = false;
    clearInterval(this._interval);
    clearInterval(this.checkNetWorkSwitched);
  }

  addStep(step) {
    const { steps } = this.state;
    steps.push(step);
    this.setState({ steps: [...steps] });
  }

  connectToWifi = async (ssid, password) => {
    const { steps } = this.state;
    const { hotspotSSID } = this.props;
    if (!this.isMounteds) {
      return;
    }
    // WifiManager.forceWifiUsage(true);
    try {
      const previousSSID = await this.getWifiSSID();
      this.addStep({ name: 'Currently connected to: ' + previousSSID, isSuccess: true });

      if (previousSSID === ssid) {
        return true;
      }
      this.setState({ loading: true });
      this.addStep({ name: 'Trying to connect to preferred WiFi: "' + ssid + '" ..... ', isSuccess: true });
      return new Promise((resolve, reject) => {
        let connectFunction = WifiManager.connectToProtectedSSID;
        let args = [ssid, password, false];
        if (Platform.OS === 'ios' && !password) {
          connectFunction = WifiManager.connectToSSID;
          args = [ssid];
        }

        connectFunction(...args)
          .then(
            async () => {
              this.addStep({ name: 'Waiting for phone to switch from current WiFi', isSuccess: true });

              try {
                let count = 0;
                this._interval = setInterval(async () => {
                  count++;
                  const currentSSID = await this.getWifiSSID(true);
                  if (currentSSID !== previousSSID) {
                    clearInterval(this._interval);
                    return;
                  }

                  if (count === 30 && currentSSID === ssid) {
                    clearInterval(this._interval);
                    return;
                  }

                  if (currentSSID) {
                    clearInterval(this._interval);
                    throw new Error('Not connect to new Wi-Fi');
                  }
                }, 1000);
                this.addStep({ name: 'Disconnected from current Wi-Fi', isSuccess: true });

                await this.tryAtMost(async () => {
                  const currentSSID = await this.getWifiSSID(true);
                  // this.addStep({ name: 'Wi-Fi ' + currentSSID, isSuccess: true }); // No need to log
                  if (!currentSSID) {
                    this.setState({ steps: [] });
                    throw new Error('WiFi details are incorrect');
                  }
                }, 5, 3);
              } catch (e) {
                reject(e);
              }
              
              const currentSSID = await this.getWifiSSID();
              
              if (currentSSID === ssid) {
                this.addStep({ name: 'Switched to ' + currentSSID, isSuccess: true });
                resolve(true);
              } else {
                this.addStep({ name: 'Could not setup WiFi and connect to Node', isSuccess: false });
                reject(new Error('Connect to another Wi-Fi'));
              }
            },
            async (error) => {
              this.setState({ loading: false });
              // Check internet connectable
              let isConnected = await (await NetInfo.fetch()).isConnected;
              let connectable = await (await NetInfo.fetch()).isInternetReachable;
              // And wifi name is the same with hotspot
              let wifiName = await this.getCurrentWifi();
              if (!isConnected || !connectable || !ssid.includes('Node') || wifiName === '') {
                if (!ssid.includes('Node')) {
                  this.addStep({ name: 'Could not automatically connect to WiFi. Please first disconnect your phone from WiFi,\nthen manually connect again by entering username and password.', isSuccess: false });
                }
              }
              this.addStep({ name: 'Could not setup WiFi and connect to Node: \n' + error?.message || '', isSuccess: false });
              if (error?.message?.includes('Timeout connecting')) {
                this.setState({ backToQRCode: false });
              }
              console.debug('CONNECT ERROR', error);
              if (this.isMounteds) {
                this.setState({ loading: true });
                if (!ssid.includes('Node')) {
                  this.setState({ backToQRCode: true });
                } else {
                  this.setState({ backToQRCode: false });
                }
                throw new Error('Could not setup wifi and connect to node: ' + error?.message || '');
              } else {
                reject(error);
              }
            }
          )
          .catch(err => {
            this.setState({ loading: false });
            this.addStep({ name: err?.message || 'Error while connecting to wifi ', isSuccess: false });
            reject(err);
          });
      });

    } catch (e) {
      if (this.isMounteds) {
        throw new Error('Can not connect to ' + ssid + '' + e?.message);
      } else {
        return false;
      }
    }
  };

  // Get current wifi
  async getCurrentWifi() {
    try {
      const ssid = await WifiManager.getCurrentWifiSSID();

      console.debug('SSID', ssid);

      this.setState({ ssid });
      return ssid;
    } catch (error) {
      this.setState({ ssid: '' });
      return '';
    }
  }

  // Show dialog temporarily for alerting something
  showAlertInfor = ({ title, subTitle, onPressOK, onCancel, titleOK }) => {
    Alert.alert(title, subTitle, [
      {
        text: 'Cancel',
        onPress: onCancel ? onCancel : () => { },
        style: 'cancel'
      },
      { text: titleOK ? titleOK : 'OK', onPress: onPressOK ? onPressOK : () => { } }
    ], { cancelable: false });
  }

  // Check internet truely connected to network
  checkInternetReachable = async () => {
    const networkState = await NetInfo.fetch();
    return networkState?.isInternetReachable || true;
  }

  // Check if wifi is correct 
  // And its has to be working
  checkWifiInfo = async () => {
    this.setState({ loading: true });
    this.funcQueue.push('checkWifiInfo');
    const { ssid, password, isCorrectWifi } = this.state;

    if (isCorrectWifi) {
      return true;
    }

    // this.addStep({ name: 'Check your Wi-Fi information ... ', isSuccess: true });
    const result = await this.connectToWifi(ssid, password);
    try {
      this.addStep({ name: 'Checking WiFi details', isSuccess: true });
      this.setState({ loading: true });
      await Util.tryAtMost(async () => {
        await fetch('https://google.com.vn');
      }, 5, 1);

      return result;
    } catch (e) {
      this.setState({ loading: false });
      this.addStep({ name: 'WiFi connected but internet unavailable', detail: ssid, isSuccess: false });
      throw new Error('WiFi connected but internet unavailable');
    }
  }

  renderContent = () => {
    const { ssid, error, password, loading } = this.state;
    const { text, item, item_container_input, errorText } = styles;

    return (
      <View>
        <Text style={[styles.title2, { textAlign: 'left', marginLeft: 20, marginTop: 40, marginBottom: 20 }]}>Wi-Fi</Text>
        <Input
          underlineColorAndroid="transparent"
          containerStyle={item}
          inputContainerStyle={item_container_input}
          inputStyle={[text]}
          placeholder="Wi-Fi name"
          errorStyle={[errorText, { textAlign: 'left', marginLeft: 0 }]}
          errorMessage={!_.isEmpty(this.ssid) ? 'Required' : ''}
          value={ssid}
          onChangeText={ssid => this.setState({ ssid })}
        />
        <Input
          underlineColorAndroid="transparent"
          containerStyle={item}
          autoCapitalize="none"
          inputContainerStyle={item_container_input}
          inputStyle={[text]}
          placeholder="Password"
          errorStyle={[errorText, { textAlign: 'left', marginLeft: 0 }]}
          errorMessage={error}
          value={password}
          onChangeText={password => this.setState({ password })}
        />
      </View>
    );
  };

  // Check version code
  checkVersionCodeInZMQ = async () => {
    this.setState({ loading: true });
    this.funcQueue.push('checkVersionCodeInZMQ');
    return new Promise(async (resolve, reject) => {
      try {
        let checkVersionParams = {
          action: 'check_version',
        };
        // Make sure device node is alive
        await Util.delay(4);
        let currentVersionNotSupport = await NodeService.sendZMQ(checkVersionParams);
        currentVersionNotSupport = JSON.parse(currentVersionNotSupport);
        resolve(!currentVersionNotSupport || !currentVersionNotSupport?.value);
      } catch (err) {
        reject(false);
      }
    });
  }

  // Connect to wifi hostpot of node
  connectToWifiHotspot = async () => {
    this.funcQueue.push('connectToWifiHotspot');
    const { hotspotSSID } = this.props;
    await this.connectToWifi(hotspotSSID, PASS_HOSPOT);
  }

  // Update validator key
  updateValidatorKey = async () => {
    this.setState({ loading: true });
    this.funcQueue.push('updateValidatorKey');
    const { qrCode, account } = this.props;
    const { ValidatorKey } = account;
    return APIService.updateValidatorKey(qrCode, ValidatorKey)
      .then(res => {
        this.addStep({ name: 'Successfully sent validator key', detail: res, isSuccess: true });
        return res;
      })
      .catch(error => {
        this.setState({ loading: false });
        this.addStep({ name: 'Validator key not yet sent \n' + error?.message || '', detail: error.message, isSuccess: false });
        throw error;
      });
  }

  // Setup wifi for node (update ZMQ)
  setupWifiZMQ = async (params) => {
    this.setState({ loading: true });
    this.funcQueue.push('setupWifiZMQ');
    return new Promise((resolve, reject) => {
      try {
        NodeService.sendZMQ(params)
          .then(result => {
            if (result) {
              resolve(result);
            }
          })
          .catch(err => {
            reject(err);
          });
      } catch (err) {
        this.showAlertInfor({
          title: 'Error',
          subTitle: 'Cannot setup node for updating wifi',
          titleOK: 'Retry',
          onPressOK: async () => { await this.funcQueue.shift(); }
        });
      }
    });

  }

  // Send data to node
  sendZMQ = async () => {
    const { ssid, password } = this.state;
    const params = {
      action: 'update_wifi',
      ssid: `'${ssid}'`,
      wpa: `'${password}'`,
    };

    // Try to connect to wifi of hotspot
    await this.tryAtMost(async () => {
      if (this.isMounteds)
        await this.connectToWifiHotspot();
    }, 1, 5);

    this.setupWifiZMQ(params)
      .then(async result => {
        if (result) {
          this.addStep({ name: 'Updating WiFi for node', detail: JSON.stringify(params) + ' ' + JSON.stringify(result), isSuccess: true });
          if (_.isEmpty(result)) {
            throw new CustomError(knownCode.node_can_not_connect_hotspot);
          }
          if (result?.status === 1 || result?.status === '1') {
            Alert.alert('Success', 'Update WiFi info successfully', [
              {text: 'Go back', onPress: () => {NavigationService.goBack();}}
            ]);
          } else {
            throw new CustomError(knownCode.node_can_not_connect_hotspot);
          }
        }
      })
      .catch(async err => {
        this.addStep({ name: 'Could not connect Node for updating WiFi ', isSuccess: false });
        // Cheating testing
        setTimeout(()=>{
          this.setState({ loading: false });
        }, 1000);
      });
  };

  // Send ssid and password wifi for Node
  // Node will automatically connect if received
  setupAndConnectWifiForNode = async () => {
    this.setState({ loading: true });
    const { qrCode, hotspotSSID } = this.props;
    const funcName = `${qrCode}-connectHotspot`;
    this.addStep({ name: 'Connecting to Node hotspot ', isSuccess: true });
    try {
      await APIService.trackLog({ action: funcName, message: `BEGIN Connect HOTSPOT = ${hotspotSSID}` });

      // Send data/info to node
      await this.sendZMQ();
    } catch (error) {
      this.setState({ loading: false });
      await APIService.trackLog({ action: funcName, message: `Connect HOTSPOT FAILED = ${error?.message || ''}` });
      throw error;
    }
  };

  handleSetupNode = async () => {
    this.setState({ backToQRCode: false });
    this.funcQueue.push('handleSetupNode');
    try {
      await this.setupAndConnectWifiForNode();

    } catch (e) {
      const { steps } = this.state;
      this.setState({ loading: false });
      this.funcQueue.push('handleSetupNode');
      this.addStep({ name: 'Could not update Node WiFi', detail: e, isSuccess: false });
    }
  };

  // On press button next
  handleNext = async () => {
    this.funcQueue.push('handleNext');
    // 
    const { onNext } = this.props;
    const { password } = this.state;

    if (password.length > 0 && password.length < 8) {
      return this.setState({ error: 'Network must have no password, or a password of at least 8 characters. \nPlease enter details again.' });
    }

    try {
      this.setState({ loading: true });
      this.checkWifiInfo()
        .then(async isCorrectWifi => {
          console.log('isCorrectWifi ' + isCorrectWifi);
          if (!isCorrectWifi) {
            this.setState({ error: 'Could not automatically connect to WiFi.', steps: [] });
          } else {
            this.setState({ isCorrectWifi });

            // Start to connect node
            await this.handleSetupNode();
          }
        })
        .catch(e => {
          this.setState({ loading: false });
          this.addStep({ name: 'Could not connect to Node', detail: e, isSuccess: false });
        });
    } catch (e) {
      console.debug('SETUP FAILED', e);
      this.setState({ error: e.message, loading: false });
      this.addStep({ name: 'Could not connect to Node', detail: e, isSuccess: false });
    } finally {
      this.setState({ loading: false });
    }
  };

  copyLogs = () => {
    const { steps } = this.state;
    clipboard.set(JSON.stringify(steps), { copiedMessage: 'Logs copied.' });
  };

  // Check by func name 
  retryFuncByName = (name) => {
    console.log('### INCOGNITO_LOG ### Current step being invoked: ' + name);
    switch (name) {
    case 'checkWifiInfo':
      this.handleNext();
      break;
    case 'setupAndConnectWifiForNode':
      this.setupAndConnectWifiForNode();
      break;
    case 'connectToWifiHotspot':
      this.handleSetupNode();
      break;
    case 'handleSetupNode':
      this.handleSetupNode();
      break;
    case 'setupWifiZMQ':
      this.setupAndConnectWifiForNode();
      break;
    case 'updateValidatorKey':
      this.setupAndConnectWifiForNode();
      break;
    case 'checkVersionCodeInZMQ':
      this.checkVersionCodeInZMQ();
      break;
    case 'handleNext':
      this.handleNext();
      break;
    default:
      break;
    }
  }

  renderFooter = () => {
    const { steps, loading, backToQRCode } = this.state;
    return (
      <View style={styles.footer}>
        <Button
          disabled={loading}
          loading={loading}
          onPress={() => {
            console.log('### INCOGNITO ### funcQueue: ' + LogManager.parseJsonObjectToJsonString(this.funcQueue));
            if (backToQRCode) {
              const { setStep } = this.props;
              setStep(1);
              return;
            }
            if (this.funcQueue.length > 1) {
              this.retryFuncByName(this.funcQueue.pop());
            } else {
              this.handleNext();
            }
          }}
          style={[loading ? theme.BUTTON.BLACK_TYPE_DISABLE : theme.BUTTON.BLACK_TYPE]}
          title={backToQRCode ? 'Restart update' : steps.length > 0 ? 'Retry this step' : 'Next'}
        />
      </View>
    );
  };

  renderStep(step, isLastStep) {
    const { loading } = this.state;
    return (
      <View style={styles.log}>
        {isLastStep && loading ? <ActivityIndicator style={styles.logIcon} size="small" /> : (
          <Icon
            containerStyle={styles.logIcon}
            color={step?.isSuccess ? COLORS.colorPrimary : COLORS.red}
            size={15}
            name="checkbox-blank-circle"
            type="material-community"
          />
        )}
        <Text style={[!isLastStep ? styles.disabledText : null, { width: ScreenWidth * 0.7 }]}>{step?.name}</Text>
      </View>
    );
  }

  renderLogs() {
    const { steps } = this.state;
    return (
      <View style={{marginTop: 30}}>
        <LineView color={COLORS.lightGrey10} />
        <ScrollView
          style={[{ height: ScreenHeight * 0.35 }]}
          ref={ref => this.scrollView = ref}
          onContentSizeChange={() => {
            if (this.scrollView) {
              this.scrollView.scrollToEnd({ animated: true });
            }
          }}
          onPress={this.copyLogs}
        >
          <TouchableOpacity onPress={this.copyLogs}>
            {steps.map((step, index) => this.renderStep(step, index === steps.length - 1))}
          </TouchableOpacity>
        </ScrollView>
        <LineView color={COLORS.lightGrey10} />
      </View>
    );
  }

  getErrorMessage = () => {
    const { errorInSetUp } = this.state;
    const message = errorInSetUp?.message || '';
    const code = errorInSetUp?.code ?? 0;
    return !_.isEmpty(errorInSetUp) ? `[${code}]${message}` : '';
  };

  render() {
    const { steps, ssid, connectWifi } = this.state;
    const rootCauseMessage = this.getErrorMessage();

    return (
      <View style={{margin: 20, marginTop: 0}}>
        <Header title="Update WiFi" />
        <ScrollView>
          {steps.length > 0 ? this.renderLogs() : this.renderContent()}
          <Text style={styles.errorText}>{rootCauseMessage}</Text>
          {this.renderFooter()}
        </ScrollView>
        <ModalConnectWifi
          isLoading={connectWifi.isCheckingWifiConnection}
          isVisible={connectWifi.shouldShowModalConnectWifi}
          isSuccess={connectWifi.isConnected}
          title={connectWifi.title}
          titleConfirm='OK'
          titleRetry='Retry'
        />
      </View>
    );
  }
}

UpdateWifi.propTypes = {
  qrCode: PropTypes.string.isRequired,
  hotspotSSID: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
};

UpdateWifi.defaultProps = {};

export default UpdateWifi;
