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
import styles from '../../styles';

export const TAG = 'SetupWifi';

class WifiSetup extends PureComponent {
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
        throw new Error('Can not get Wi-Fi SSID');
      }

      if (ssid.includes('unknown ssid')) {
        throw new Error('Can not get Wi-Fi SSID');
      }

      return ssid;
    }, 15, 2);
  };

  componentDidMount() {
    this.isMounteds = true;
    this.getCurrentWifi();
    this.getLastVerifyCode();
  }

  componentDidUpdate(prevProps, prevState) {
    const { ssid, password } = this.state;

    if (ssid !== prevState.ssid || password !== prevState.password) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ error: '', isCorrectWifi: false });
    }
  }

  // Check last verify code if exist => Set state for current verifyCode
  async getLastVerifyCode() {
    this.funcQueue.push('getLastVerifyCode');
    const lastVerifyCode = await LocalDatabase.getVerifyCode();
    if (lastVerifyCode && lastVerifyCode != '') {
      this.setState({ lastVerifyCode });
    }
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
    try {
      const previousSSID = await this.getWifiSSID();
      this.addStep({ name: 'Current Wi-Fi connected is:' + previousSSID, isSuccess: true });

      if (previousSSID === ssid) {
        return true;
      }
      this.addStep({ name: 'Trying to connect to Wi-Fi ' + ssid, isSuccess: true });
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
              this.addStep({ name: 'Wait for phone to disconnect from current Wi-Fi', isSuccess: true });

              try {
                let count = 0;
                this._interval = setInterval(async () => {
                  count++;
                  const currentSSID = await this.getWifiSSID(true);
                  if (currentSSID !== previousSSID) {
                    clearInterval(this._interval);
                    return;
                  }

                  if (count === 50 && currentSSID === ssid) {
                    clearInterval(this._interval);
                    return;
                  }

                  if (currentSSID) {
                    throw new Error('Not connect to new Wi-Fi');
                  }
                }, 1000);
                this.addStep({ name: 'Disconnected from current Wi-Fi', isSuccess: true });

                await this.tryAtMost(async () => {
                  const currentSSID = await this.getWifiSSID(true);
                  this.addStep({ name: 'Wi-Fi ' + currentSSID, isSuccess: true });
                  if (!currentSSID) {
                    this.setState({ steps: [] });
                    throw new Error('Wifi name or password is incorrect');
                  }
                }, 5, 3);
              } catch (e) {
                reject(e);
              }

              const currentSSID = await this.getWifiSSID();
              this.addStep({ name: 'New Wi-Fi ' + currentSSID, isSuccess: true });

              if (currentSSID === ssid) {
                resolve(true);
              } else {
                reject(new Error('Connect to another Wi-Fi'));
              }
            },
            (error) => {
              this.addStep({ name: 'Could not setup wifi connection: \n' + error?.message, isSuccess: false });
              console.debug('CONNECT ERROR', error);
              if (this.isMounteds) {
                throw new Error('Could not setup wifi connection: ' + error?.message);
              } else {
                reject(error);
              }
            }
          )
          .catch(err => {
            reject(err);
            this.addStep({ name: 'Error while connecting to wifi ' + err?.message, isSuccess: false });
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
    } catch (error) {
      this.setState({ ssid: '' });
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
    return networkState?.isInternetReachable || false;
  }

  // Check if wifi is correct 
  // And its has to be working
  checkWifiInfo = async () => {
    this.setState({ loading: true });
    this.funcQueue.push('checkWifiInfo');
    const { ssid, password, isCorrectWifi } = this.state;

    this.addStep({ name: 'Check your Wi-Fi information', isSuccess: true });
    return new Promise((resolve, reject) => {
      try {
        this.addStep({ name: 'Trying to connect your network', isSuccess: true });
        // Connect to wifi
        this.connectToWifi(ssid, password)
          .then(async val => {
            this.addStep({ name: 'Checking internet is good to go ... ', isSuccess: true });
            let isInternetReachable = await this.checkInternetReachable();
            console.log('### INCOGNITO ###: isInternetReachable' + isInternetReachable);
            if (isInternetReachable) {
              this.addStep({ name: 'Internet reachable to network', isSuccess: true });
              resolve(true);
            } else {
              this.addStep({ name: 'Trying to check internet is reachable', isSuccess: true });
              this.checkWifiInfo();
            }
          })
          .catch(err => {
            this.addStep({ name: 'Your currently wifi connection has issues. Please use another one better', isSuccess: true });
            resolve(false);
          });
      } catch (e) {
        this.addStep({ name: 'Please check your wifi connection', detail: ssid, isSuccess: false });
        this.showAlertInfor({
          title: 'Error',
          subTitle: 'Your currently wifi connection has issues. Please use another one better',
        });
        resolve(false);
      }
    });
  }

  renderContent = () => {
    const { ssid, error, password, loading } = this.state;
    const { text, item, item_container_input, errorText } = styles;

    if (loading) {
      return <LongLoading />;
    }

    return (
      <View>
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
        await Util.delay(3);
        let currentVersionSupport = await NodeService.sendZMQ(checkVersionParams);
        resolve(!currentVersionSupport || !currentVersionSupport?.value);
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
        this.addStep({ name: 'Send validator key success', detail: res, isSuccess: true });
        return res;
      })
      .catch(error => {
        this.addStep({ name: 'Send validator key error', detail: error.message, isSuccess: false });
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
          subTitle: 'Cannot setup node for connecting wifi',
          titleOK: 'Retry',
          onPressOK: async () => { await this.funcQueue.shift(); }
        });
      }
    });

  }

  // Send data to node
  sendZMQ = async () => {
    const { ssid, password, lastVerifyCode, verifyCode, date } = this.state;
    const { qrCode, hotspotSSID, account } = this.props;
    const deviceId = DeviceInfo.getUniqueId();
    let time = date.getTime();
    let verifyNewCode = `${deviceId}.${time}`;
    const userJson = await LocalDatabase.getUserInfo();
    const user = userJson.toJSON();
    const { id, token } = user;
    const { ValidatorKey } = account;

    this.setState({ verifyCode: verifyNewCode, lastVerifyCode: verifyNewCode }, () => {
      console.log('### INCOGNITO ###: Last VerifyCode' + lastVerifyCode);
      console.log('### INCOGNITO ###: Verify Code' + verifyNewCode);
    });

    const params = {
      action: 'send_wifi_info',
      ssid: `'${ssid}'`,
      wpa: `'${password}'`,
      product_name: `${qrCode}`,
      qrcode: `${qrCode}`,
      product_type: DEVICES.MINER_TYPE,
      source: Platform.OS,
      verify_code: verifyNewCode,
      platform: CONSTANT_MINER.PRODUCT_TYPE,
      token,
      time_zone: getTimeZone(),
      user_id: id,
      address_long: 0.0,
      address_lat: 0.0,
      validatorKey: ValidatorKey
    };

    // Try to connect to wifi of hotspot
    await this.tryAtMost(async () => {
      if (this.isMounteds)
        await this.connectToWifiHotspot();
    }, 10, 5);

    let isVersionSupported = await this.checkVersionCodeInZMQ();
    if (isVersionSupported) {
      this.addStep({ name: 'Send validator key', detail: ValidatorKey, isSuccess: true });
      await this.updateValidatorKey();
    }

    this.setupWifiZMQ(params)
      .then(async result => {
        if (result) {
          this.addStep({ name: 'Setup Wi-Fi for node', detail: JSON.stringify(params) + ' ' + JSON.stringify(result), isSuccess: true });

          if (_.isEmpty(result)) {
            throw new CustomError(knownCode.node_can_not_connect_hotspot);
          }

          await LocalDatabase.saveVerifyCode(verifyNewCode);
          // Re connect wifi

          this.addStep({ name: 'Check node hotspot', isSuccess: true });

          this.setState({ lastVerifyCode: verifyNewCode });

          Util.delay(1500);
          await this.connectToWifi(ssid, password);
          return verifyNewCode;
        }
      })
      .catch(err => {
        this.addStep({ name: 'Setup configuration for node failed ' + err?.message, isSuccess: false });
        return verifyNewCode;
      });
    return verifyNewCode;
  };

  // Send ssid and password wifi for Node
  // Node will automatically connect if received
  setupAndConnectWifiForNode = async () => {
    this.setState({ loading: true });
    const { qrCode, hotspotSSID } = this.props;
    const funcName = `${qrCode}-connectHotspot`;
    this.addStep({ name: 'Starting to connect to hotspot ... ', isSuccess: true });
    try {
      await APIService.trackLog({ action: funcName, message: `BEGIN Connect HOTSPOT = ${hotspotSSID}` });

      // Send data/info to node
      await this.sendZMQ();
    } catch (error) {
      this.addStep({ name: 'Setup and connect wifi for node failed', isSuccess: false });
      await APIService.trackLog({ action: funcName, message: `Connect HOTSPOT FAILED = ${error?.message || ''}` });
      throw error;
    }
  };

  tryVerifyCode = async () => {
    this.funcQueue.push('tryVerifyCode');
    const { verifyCode, lastVerifyCode } = this.state;
    console.log('### INCOGNITO ###: tryVerifyCode ' + verifyCode + '_' + lastVerifyCode);
    this.addStep({ name: 'Verifying product code ...', detail: verifyCode, isSuccess: true });
    const result = await this.tryAtMost(async () => {
      return NodeService.verifyProductCode(lastVerifyCode)
        .then(res => {
          if (!res) {
            throw new Error('empty result');
          }

          return res;
        })
        .catch(error => {
          // No need to add log here
          // this.addStep({ name: 'Try to redo verifying code error', detail: error });
          throw error;
        });
    }, 36, 5);
    if (result) {
      this.addStep({ name: 'Verify code success', detail: JSON.stringify(result), isSuccess: true });
    } else {
      this.addStep({ name: 'Verify code failed', isSuccess: false });
      throw new Error('Verify code failed');
    }

    return result;
  };

  authFirebase = async (productInfo) => {

    const { qrCode } = this.props;
    const funcName = `${qrCode}-authFirebase`;
    await APIService.trackLog({ action: funcName, message: 'Bat dau Auth Firebase', rawData: `productInfo = ${JSON.stringify(productInfo)}` });
    const authFirebase = await this.tryAtMost(async () => {
      const resultFbUID = await NodeService.authFirebase(productInfo)
        .catch(error => this.addStep({ name: 'Authenticate firebase error ', detail: error?.message, isSuccess: false }));
      this.addStep({ name: 'Authenticate firebase ', detail: resultFbUID, isSuccess: true });
      return _.isEmpty(resultFbUID) ? new CustomError(knownCode.node_auth_firebase_fail) : resultFbUID;
    }, 3, 3);
    await APIService.trackLog({ action: funcName, message: authFirebase ? 'Auth Firebase=> SUCCESS' : 'Auth Firebase=> FAIL' });
    return authFirebase;
  };

  updateDeviceNameRequest = async (product_id, name) => {
    let params = {
      product_id: product_id,
      product_name: name
    };
    try {
      const response = await APIService.updateProduct(params);

      const { status, data } = response;
      if (status === 1) {
        console.log(TAG, 'Change name = ', response);
        params = { ...params, ...data };
      }
      return params;
    } catch (error) {
      console.log(TAG, 'updateDeviceNameRequest error');
    }
    return null;
  };

  handleSetupAccount = async (productInfo) => {
    this.funcQueue.push('handleSetupAccount');
    const { qrCode, account, onNext } = this.props;
    const funcName = `${qrCode}-changeDeviceName`;
    try {
      this.addStep({ name: 'Setup account for node ', detail: account.PaymentAddress, isSuccess: true });
      this.updateDeviceNameRequest(productInfo.product_id, qrCode);
      let fetchProductInfo = {
        ...productInfo,
        product_name: qrCode,
        product_type: DEVICES.MINER_TYPE,
        minerInfo: {
          isCallStaked: false,
          qrCodeDeviceId: qrCode,
        },
      };
      const { product_id } = fetchProductInfo;
      const { PaymentAddress, ValidatorKey } = account;
      this.addStep({ name: 'Send stake request', isSuccess: true });
      await Util.excuteWithTimeout(APIService.requestStake({
        ProductID: product_id,
        ValidatorKey: ValidatorKey,
        qrCodeDeviceId: qrCode,
        PaymentAddress: PaymentAddress
      }), 60)
        .then(async response => {
          this.addStep({ name: 'Send stake request success', detail: response, isSuccess: true });
          await APIService.trackLog({ action: funcName, message: `Result: requestStake ==> ${response ? 'SUCCESS' : 'FAIL'}` });
          const dataRequestStake = response?.data || {};
          if (!_.isEmpty(dataRequestStake) && !_.isEmpty(dataRequestStake.PaymentAddress)) {
            fetchProductInfo.minerInfo = {
              ...fetchProductInfo.minerInfo,
              ...dataRequestStake
            };
          }
          await LocalDatabase.updateDevice(fetchProductInfo);
          await LocalDatabase.saveVerifyCode('');
        })
        .catch(async error => {
          let messageErr = error?.message || '';
          if (typeof messageErr === 'string' && messageErr?.includes('already staked')) {
            await LocalDatabase.saveVerifyCode('');
            onNext();
            return;
          }
          this.addStep({ name: 'Send stake request failed', detail: '', isSuccess: false });
        });

    } catch (error) {
      await APIService.trackLog({ action: funcName, message: `Result: connected Node ==> ERROR- message ${error.message}` });
      throw error;
    }
    await APIService.trackLog({ action: funcName, message: 'Result: connected Node ==> SUCCESS' });
    return true;
  };

  handleSetupNode = async () => {
    this.funcQueue.push('handleSetupNode');
    const { qrCode, lastVerifyCode } = this.state;

    try {
      await this.setupAndConnectWifiForNode();
      this.addStep({ name: 'Setup Wi-Fi for node success', isSuccess: true });
    } catch (e) {
      this.addStep({ name: 'Setup Wi-Fi for node failed', detail: e?.message, isSuccess: false });

      if (lastVerifyCode && lastVerifyCode != '') {
        // Setup node failed but verifyCode exist
        this.addStep({ name: 'Try using last verify code', isSuccess: true });
        this.setState({ verifyCode: lastVerifyCode });
        await Util.delay(1);

        // Need to actions..........
      } else {
        throw e;
      }
    }

    // Check code in firebase
    await this.verifyCodeFirebase();
  };


  // Start to authen with firebase for verifying code
  verifyCodeFirebase = async () => {
    this.setState({ loading: true });
    this.funcQueue.push('verifyCodeFirebase');
    const { qrCode } = this.state;
    const productInfo = {
      ...await this.tryVerifyCode(),
      product_name: qrCode,
    };

    await this.authFirebase(productInfo);
    await this.handleSetupAccount(productInfo);
  }

  // On press button next
  handleNext = async () => {
    this.funcQueue.push('handleNext');
    const { steps, lastVerifyCode } = this.state;
    // Check if verifyCode exist, check 1 time
    if (lastVerifyCode && lastVerifyCode != '') {
      this.verifyCodeFirebase();
    } else {
      // 
      const { onNext } = this.props;
      const { password } = this.state;

      if (password.length > 0 && password.length < 8) {
        return this.setState({ error: 'Password must be empty or at least 8 characters' });
      }

      try {
        this.setState({ loading: true });
        this.checkWifiInfo()
          .then(async isCorrectWifi => {
            console.log('isCorrectWifi ' + isCorrectWifi);
            if (!isCorrectWifi) {
              this.setState({ error: 'Wifi name or password is incorrect', steps: [] });
            } else {
              this.setState({ isCorrectWifi });

              // Start to setup node
              await this.handleSetupNode();

              // Save verifyCode
              await LocalDatabase.saveVerifyCode('');
              onNext();
            }
          })
          .catch(e => {
            this.addStep({ name: `Setup failed \n${e?.message || ''}`, detail: e, isSuccess: false });
          });
      } catch (e) {
        console.debug('SETUP FAILED', e);
        this.setState({ error: e.message });
        this.addStep({ name: `Setup failed \n${e?.message || ''}`, detail: e, isSuccess: false });
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  copyLogs = () => {
    const { steps } = this.state;
    clipboard.set(JSON.stringify(steps), { copiedMessage: 'Logs copied.' });
  };

  // Check by func name 
  retryFuncByName = (name) => {
    console.log('### INCOGNITO_LOG ### Current step being invoked: '+ name);
    switch (name) {
    case 'getLastVerifyCode':
      this.getLastVerifyCode();
      break;
    case 'checkWifiInfo':
      this.handleNext();
      break;
    case 'setupAndConnectWifiForNode':
      this.setupAndConnectWifiForNode();
      break;
    case 'connectToWifiHotspot':
      this.handleSetupNode();
      break;
    case 'verifyCodeFirebase':
      this.verifyCodeFirebase();
      break;
    case 'handleSetupAccount':
      this.handleSetupAccount();
      break;
    case 'handleSetupNode':
      this.handleSetupNode();
      break;
    case 'tryVerifyCode':
      this.verifyCodeFirebase();
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
    const { steps, loading } = this.state;
    return (
      <View style={styles.footer}>
        <Button
          disabled={loading}
          loading={loading}
          onPress={() => {
            console.log('### INCOGNITO ### funcQueue: ' + LogManager.parseJsonObjectToJsonString(this.funcQueue));
            if (this.funcQueue.length > 1) {
              this.retryFuncByName(this.funcQueue.pop());
            } else {
              this.handleNext();
            }
          }}
          title={steps.length > 0 ? 'Retry' : 'Next'}
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
            color={step?.isSuccess ? COLORS.primary : COLORS.red}
            size={14}
            name="checkbox-blank-circle"
            type="material-community"
          />
        )}
        <Text style={[!isLastStep ? styles.disabledText : null, { width: ScreenWidth * 0.7 }]}>{step.name}</Text>
      </View>
    );
  }

  renderLogs() {
    const { steps } = this.state;
    return (
      <View>
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
      <View>
        <ScrollView>
          <Text style={styles.title2}>Connect Node to your home Wi-Fi</Text>
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

WifiSetup.propTypes = {
  qrCode: PropTypes.string.isRequired,
  hotspotSSID: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
};

WifiSetup.defaultProps = {};

export default WifiSetup;
