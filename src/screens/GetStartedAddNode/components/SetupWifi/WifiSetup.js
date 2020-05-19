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
import { CustomError } from '@services/exception';
import { PASS_HOSPOT } from 'react-native-dotenv';
import LocalDatabase from '@utils/LocalDatabase';
import { DEVICES } from '@src/constants/miner';
import NetInfo from '@react-native-community/netinfo';
import { CONSTANT_MINER } from '@src/constants';
import clipboard from '@services/clipboard';
import LongLoading from '@components/LongLoading/index';
import { Icon } from 'react-native-elements';
import { COLORS } from '@src/styles';
import LogManager from '@src/services/LogManager';
import styles from '../../styles';

export const TAG = 'SetupWifi';

// Get current wifi name
// with device connected
const getWifiSSID = (empty = false) => {
  return Util.tryAtMost(async () => {
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

class WifiSetup extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      ssid: '',
      password: '',
      error: '',
      steps: [],
    };

    this.scrollView = React.createRef();
  }

  componentDidMount() {
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
    const lastVerifyCode = await LocalDatabase.getVerifyCode();
    this.setState({ lastVerifyCode });
  }

  addStep(step) {
    const { steps } = this.state;
    steps.push(step);
    this.setState({ steps: [...steps] });
  }

  connectToWifi = async (ssid, password) => {
    try {
      const previousSSID = await getWifiSSID();

      this.addStep({ name: 'Current Wi-Fi ' + previousSSID });

      if (previousSSID === ssid) {
        return true;
      }

      await new Promise((resolve, reject) => {
        let connectFunction = WifiManager.connectToProtectedSSID;
        let args = [ssid, password, false];
        if (Platform.OS === 'ios' && !password) {
          connectFunction = WifiManager.connectToSSID;
          args = [ssid];
        }

        connectFunction(...args).then(
          async () => {
            this.addStep({ name: 'Wait for phone to disconnect from current Wi-Fi' });

            try {
              let count = 0;
              await Util.tryAtMost(async () => {
                count++;
                const currentSSID = await getWifiSSID(true);

                if (currentSSID !== previousSSID) {
                  return;
                }

                if (count === 30 && currentSSID === ssid) {
                  return;
                }

                if (currentSSID) {
                  throw new Error('Not connect to new Wi-Fi');
                }
              }, 30, 1);

              this.addStep({ name: 'Disconnected from current Wi-Fi' });

              await Util.tryAtMost(async () => {
                const currentSSID = await getWifiSSID(true);
                this.addStep({ name: 'Wi-Fi ' + currentSSID });
                if (!currentSSID) {
                  throw new Error('Wifi name or password is incorrect');
                }
              }, 5, 3);
            } catch (e) {
              reject(e);
            }

            const currentSSID = await getWifiSSID();
            this.addStep({ name: 'New Wi-Fi ' + currentSSID });

            if (currentSSID === ssid) {
              resolve(true);
            } else {
              reject(new Error('Connect to another Wi-Fi'));
            }
          },
          (error) => {
            console.debug('CONNECT ERROR', error);
            reject({});
          }
        );
      });

      this.addStep({ name: `Connect to Wi-Fi ${ssid}` });
      return true;
    } catch (e) {
      throw new Error('Can not connect to ' + ssid);
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

  // Check if wifi is correct 
  // And its working
  async checkWifiInfo() {
    const { ssid, password, isCorrectWifi } = this.state;

    this.addStep({ name: 'Check your Wi-Fi information' });

    if (isCorrectWifi) {
      return true;
    }

    const result = await this.connectToWifi(ssid, password);
    try {
      this.addStep({ name: 'Check internet is available in Wi-Fi' });

      await Util.tryAtMost(async () => {
        await fetch('https://www.google.com');
      }, 15, 1);

      return result;
    } catch (e) {
      this.addStep({ name: 'Wi-Fi connected but no Internet', detail: ssid });
      this.showAlertInfor({
        title: 'Error',
        subTitle: 'Wi-Fi connected but no Internet. Please use another one better',
      });
      throw new Error('Wi-Fi connected but no Internet');
    }
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
    return new Promise(async (resolve, reject) => {
      try {
        let checkVersionParams = {
          action: 'check_version',
        };
        await Util.delay(3);
        let currentVersionSupport = await NodeService.sendZMQ(checkVersionParams);
        console.log('VERSION ' + currentVersionSupport);
        resolve(!currentVersionSupport || !currentVersionSupport?.value );
      } catch (err) {
        reject(false);
      }
    });
  }

  // Connect to wifi hostpot of node
  connectToWifiHotspot = async () => {
    const { hotspotSSID } = this.props;
    await this.connectToWifi(hotspotSSID, PASS_HOSPOT);
  }

  // Update validator key
  updateValidatorKey = async () => {
    const { qrCode, account } = this.props;
    const { ValidatorKey } = account;
    return APIService.updateValidatorKey(qrCode, ValidatorKey)
      .then(res => {
        this.addStep({ name: 'Send validator key success', detail: res });
        return res;
      })
      .catch(error => {
        this.addStep({ name: 'Send validator key error', detail: error.message });
        this.showAlertInfor({
          title: 'Error',
          subTitle: 'Send validator key error ' + error?.message || '',
          titleOK: 'Retry',
          onPressOK: () => { this.updateValidatorKey(); }
        });
        throw error;
      });
  }

  // Setup wifi for node (update ZMQ)
  setupWifiZMQ = async (params) => {
    try {
      const result = await NodeService.sendZMQ(params);
      if (result) {
        return result;
      } else {
        this.showAlertInfor({
          title: 'Error',
          subTitle: 'Cannot setup node for connecting wifi',
          titleOK: 'Retry',
          onPressOK: () => { this.setupWifiZMQ(params); }
        });
      }
    } catch (err) {
      this.showAlertInfor({
        title: 'Error',
        subTitle: 'Cannot setup node for connecting wifi',
        titleOK: 'Retry',
        onPressOK: () => { this.setupWifiZMQ(params); }
      });
    }
  }

  // Send data to node
  sendZMQ = async () => {
    const { ssid, password } = this.state;
    const { qrCode, hotspotSSID, account } = this.props;
    const deviceId = DeviceInfo.getUniqueId();
    const date = new Date();
    const verifyCode = `${deviceId}.${date.getTime()}`;
    const userJson = await LocalDatabase.getUserInfo();
    const user = userJson.toJSON();
    const { id, token } = user;
    const { ValidatorKey } = account;
    const params = {
      action: 'send_wifi_info',
      ssid: `'${ssid}'`,
      wpa: `'${password}'`,
      product_name: `${qrCode}`,
      qrcode: `${qrCode}`,
      product_type: DEVICES.MINER_TYPE,
      source: Platform.OS,
      verify_code: verifyCode,
      platform: CONSTANT_MINER.PRODUCT_TYPE,
      token,
      time_zone: getTimeZone(),
      user_id: id,
      address_long: 0.0,
      address_lat: 0.0,
      validatorKey: ValidatorKey
    };
    this.setState({ verifyCode });

    // Try to connect to wifi of hotspot
    await Util.tryAtMost(async () => {
      await this.connectToWifiHotspot();
    }, 10, 5);

    let isVersionSupported = await this.checkVersionCodeInZMQ();
    if (isVersionSupported) {
      this.addStep({ name: 'Send validator key', detail: ValidatorKey });
      this.updateValidatorKey();
    }

    let result = await this.setupWifiZMQ(params);

    this.addStep({ name: 'Setup Wi-Fi for node', detail: JSON.stringify(params) + ' ' + JSON.stringify(result) });

    if (_.isEmpty(result)) {
      throw new CustomError(knownCode.node_can_not_connect_hotspot);
    }

    await LocalDatabase.saveVerifyCode(verifyCode);
    // Re connect wifi

    this.addStep({ name: 'Check node hotspot' });

    this.setState({ lastVerifyCode: verifyCode });

    if (Platform.OS === 'android') {
      this.addStep({ name: 'Load Wi-Fi list' });
      await new Promise((resolve, reject) => {
        WifiManager.reScanAndLoadWifiList((jsonString) => {
          const wifis = JSON.parse(jsonString);
          this.addStep({ name: 'Load Wi-Fi list success', detail: wifis.map(item => item.SSID) });

          const hotspot = wifis.find(wifi => wifi.SSID === hotspotSSID);
          if (hotspot) {
            this.addStep({ name: 'Found hotspot', detail: hotspot });
            reject('Setup wifi for node failed. Incorrect wifi name or password');
          } else {
            resolve(true);
          }
        }, (e) => {
          this.addStep({ name: 'Can not get wifi list', detail: e });
          reject('Can not get wifi list');
        });
      });
    } else {
      try {
        const currentSSID = await getWifiSSID();
        if (currentSSID === hotspotSSID) {
          throw new Error('Setup wifi for node failed');
        }
      } catch (e) {
        //
      }
    }
    console.log('=======' + ssid + '===' + password);
    await this.connectToWifi(ssid, password);
    return verifyCode;
  };

  // Send ssid and password wifi for Node
  // Node will automatically connect if received
  setupAndConnectWifiForNode = async () => {
    const { qrCode, hotspotSSID } = this.props;
    const funcName = `${qrCode}-connectHotspot`;
    this.addStep({ name: 'Connect to hotspot' });
    try {
      await APIService.trackLog({ action: funcName, message: `BEGIN Connect HOTSPOT = ${hotspotSSID}` });

      // Send data/info to node
      await this.sendZMQ();
    } catch (error) {
      // this.showAlertInfor({
      //   title: 'Error',
      //   subTitle: `Connect HOTSPOT FAILED.\n ${error?.message || ''}`,
      //   titleOK: 'Retry',
      //   onPressOK: () => this.setupAndConnectWifiForNode()
      // });
      await APIService.trackLog({ action: funcName, message: `Connect HOTSPOT FAILED = ${error?.message || ''}` });
      throw error;
    }
  };

  tryVerifyCode = async () => {
    const { verifyCode } = this.state;
    this.addStep({ name: 'Verify code', detail: verifyCode });
    const result = await Util.tryAtMost(async () => {
      return await NodeService.verifyProductCode(verifyCode)
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
      this.addStep({ name: 'Verify code success', detail: JSON.stringify(result) });
    } else {
      this.addStep({ name: 'Verify code failed' });
      throw new Error('Verify code failed');
    }

    return result;
  };

  authFirebase = async (productInfo) => {
    const { qrCode } = this.props;
    const funcName = `${qrCode}-authFirebase`;
    await APIService.trackLog({ action: funcName, message: 'Bat dau Auth Firebase', rawData: `productInfo = ${JSON.stringify(productInfo)}` });
    const authFirebase = await Util.tryAtMost(async () => {
      const resultFbUID = await NodeService.authFirebase(productInfo)
        .catch(error => this.addStep({ name: 'Authenticate firebase error ', detail: error?.message }));
      this.addStep({ name: 'Authenticate firebase ', detail: resultFbUID });
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
    const { qrCode, account } = this.props;
    const funcName = `${qrCode}-changeDeviceName`;
    try {
      this.addStep({ name: 'Setup account for node ', detail: account.PaymentAddress });
      this.updateDeviceNameRequest(productInfo.product_id, qrCode);
      const fetchProductInfo = {
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
      this.addStep({ name: 'Send stake request' });
      const response = await Util.excuteWithTimeout(APIService.requestStake({
        ProductID: product_id,
        ValidatorKey: ValidatorKey,
        qrCodeDeviceId: qrCode,
        PaymentAddress: PaymentAddress
      }), 60);
      this.addStep({ name: 'Send stake request success', detail: response });
      await APIService.trackLog({ action: funcName, message: `Result: requestStake ==> ${response ? 'SUCCESS' : 'FAIL'}` });
      const dataRequestStake = response?.data || {};
      if (!_.isEmpty(dataRequestStake) && !_.isEmpty(dataRequestStake.PaymentAddress)) {
        fetchProductInfo.minerInfo = {
          ...fetchProductInfo.minerInfo,
          ...dataRequestStake
        };
      }
      await LocalDatabase.updateDevice(fetchProductInfo);
    } catch (error) {
      await APIService.trackLog({ action: funcName, message: `Result: connected Node ==> ERROR- message ${error.message}` });
      throw error;
    }
    await APIService.trackLog({ action: funcName, message: 'Result: connected Node ==> SUCCESS' });
    return true;
  };

  handleSetupNode = async () => {
    const { qrCode, lastVerifyCode } = this.state;

    try {
      await this.setupAndConnectWifiForNode();
      this.addStep({ name: 'Setup Wi-Fi for node success' });
    } catch (e) {
      this.addStep({ name: 'Setup Wi-Fi for node failed', detail: e?.message });

      if (lastVerifyCode) {
        // Setup node failed but verifyCode exist
        this.addStep({ name: 'Try using last verify code' });
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
    const { qrCode } = this.state;
    const productInfo = {
      ...await this.tryVerifyCode(),
      product_name: qrCode,
    };

    await this.authFirebase(productInfo);
    await this.handleSetupAccount(productInfo);
  }

  // Check if code exist
  checkIfNodeExistWithVerifyCode = async () => {
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
    const { onNext } = this.props;
    const { password } = this.state;

    if (password.length > 0 && password.length < 8) {
      return this.setState({ error: 'Password must be empty or at least 8 characters' });
    }

    try {
      this.setState({ loading: true });

      const isCorrectWifi = await this.checkWifiInfo();
      if (!isCorrectWifi) {
        this.setState({ error: 'Wifi name or password is incorrect' });
      } else {
        this.setState({ isCorrectWifi });

        // Start to setup node
        await this.handleSetupNode();

        // Save verifyCode
        await LocalDatabase.saveVerifyCode('');
        onNext();
      }
    } catch (e) {
      console.debug('SETUP FAILED', e);
      this.setState({ error: e.message });
      this.addStep({ name: 'Setup failed', detail: e });
    } finally {
      this.setState({ loading: false });
    }
  };

  copyLogs = () => {
    const { steps } = this.state;
    clipboard.set(JSON.stringify(steps), { copiedMessage: 'Logs copied.' });
  };

  renderFooter = () => {
    const { steps, loading } = this.state;
    return (
      <View style={styles.footer}>
        <Button
          disabled={loading}
          loading={loading}
          onPress={this.handleNext}
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
            color={COLORS.primary}
            size={14}
            name="checkbox-blank-circle"
            type="material-community"
          />
        )}
        <Text style={!isLastStep ? styles.disabledText : null}>{step.name}</Text>
      </View>
    );
  }

  renderLogs() {
    const { steps } = this.state;
    return (
      <View style={{}}>
        <ScrollView
          style={{ height: 200 }}
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
    const { steps } = this.state;
    const rootCauseMessage = this.getErrorMessage();

    return (
      <View>
        <ScrollView>
          <Text style={styles.title2}>Connect Node to your home Wi-Fi</Text>
          {steps.length > 0 ? this.renderLogs() : this.renderContent()}
          <Text style={styles.errorText}>{rootCauseMessage}</Text>
          {this.renderFooter()}
        </ScrollView>
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
