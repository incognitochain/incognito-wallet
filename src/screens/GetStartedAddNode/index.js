import StepIndicator from '@components/StepIndicator';
import BaseScreen from '@screens/BaseScreen';
import { TouchableOpacity, View } from '@src/components/core';
import { getAccountByName } from '@src/redux/selectors/account';
import routeNames from '@src/router/routeNames';
import React from 'react';
import { connect } from 'react-redux';
import FirstScreen from '@screens/GetStartedAddNode/components/FirstScreen';
import { locationPermission, checkPermission, ENUM_RESULT_PERMISSION } from '@src/utils/PermissionUtil';
import TurnOffCellular from '@screens/GetStartedAddNode/components/TurnOffCellular';
import { COLORS } from '@src/styles';
import { Icon } from 'react-native-elements';
import bandWidthPng from '@src/assets/images/bandwidth.png';
import { checkBandWidth, cancelCheckBandWidth } from '@src/utils/connection';
import { RESULTS } from 'react-native-permissions';
import ModalPermission from '@src/components/Modal/ModalPermission';
import { Linking } from 'react-native';
import { withNavigationFocus } from 'react-navigation';
import locationPermissionPng from '@src/assets/images/location.png';
import ModalBandWidth from '@src/components/Modal/ModalBandWidth';
import LogManager from '@src/services/LogManager';
import ScanQRCode from './components/ScanQRCode';
import SetupWifi from './components/SetupWifi';
import { DialogNotify } from './components/BackUpAccountDialog';
import styles from './styles';
import WifiSetup from './components/SetupWifi/WifiSetup';

export const TAG = 'GetStartedAddNode';

const TEST_DATA = {
  step: 2,
  qrCode: '0205-284853',
  account: { 'name': '0205-284853', 'AccountName': '0205-284853', 'PaymentAddress': '12S24P6ReX425TqJDoj2U74F9y9seYSPKbK9mNrQrrHZbXubT13iz2wC7dBefaGnfNft62x9Gm8VDRkMn9f71Zg6ryu43aUrPkmKU5T', 'ReadonlyKey': '13hdeYULQK8R6BVmqsuPJo3B5hC4rZRuRoWy2MWzwoQoWuqzghTRS6YNqysDG9r7GNje8PoFxKTWQedh3S7Vk9BqTFZ1RD49tN9gLYf', 'PrivateKey': '112t8rndgm2LWVVkhYPakXGNGyaAb78rjtUxPqScudXegEr3UNJVxWnm42QY1eoKNLeBQGD92PLkSKzdNY234tTjua2ymP6MHemShLP5Qwiz', 'PublicKey': 'b4ac7d62696a6a2f58465697f8e098f64cd090d96fe19c3d9ebfedbdf1ac7dad', 'PublicKeyCheckEncode': '12Na52Ze5U6UzumVtFs5NK5dSLcXbm82n6wdRQzxYewkKMe8DYm', 'PublicKeyBytes': '180,172,125,98,105,106,106,47,88,70,86,151,248,224,152,246,76,208,144,217,111,225,156,61,158,191,237,189,241,172,125,173', 'ValidatorKey': '123LVpXiFGQXg6txnt8BCD5yP8erSxDu6J8fkYWT67Z5GYjyPMo' },
  hotspotSSID: 'TheMiner-284853',
};

const CONNECTION_STATUS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

const MINIMUM_BANDWIDTH = 0.25;

class GetStartedAddNode extends BaseScreen {
  constructor(props) {
    super(props);
    this.state = {
      qrCode: null,
      account: null,
      step: 0,
      hotspotSSID: '',
      success: false,
      statusConnection: CONNECTION_STATUS.LOW,
      bandWidth: {},
      errPermission: '',
      isErrPermission: false,
      showBandWidthModal: false,
    };
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerRight: (
        <TouchableOpacity
          onPress={() => navigation.navigate(routeNames.NodeHelp)}
          style={styles.headerRight}
        >
          <Icon name="help-outline" color={COLORS.white} />
        </TouchableOpacity>
      )
    };
  };

  componentDidMount = async () => {
    this.checkPermissionForSteps();
    this.checkBandwidthNetwork();
  };

  checkBandwidthNetwork = async () => {
    await this.getNetworkBandwidth();
  }

  checkPermissionForSteps = async () => {
    let isGranted = false;
    await checkPermission()
      .then(status => {
        switch (status) {
        case ENUM_RESULT_PERMISSION.GRANTED.CODE: {
          this.setState({ errPermission: '', isErrPermission: false });
          isGranted = true;
        }
          break;
        case ENUM_RESULT_PERMISSION.DENIED.CODE: {
          locationPermission()
            .then(val => {
              if (val != RESULTS.GRANTED) {
                isGranted = false;
                this.setState({ errPermission: ENUM_RESULT_PERMISSION.UNAVAILABLE.MESSAGE, isErrPermission: true });
              } else {
                isGranted = true;
              }
            })
            .catch(() => {
              isGranted = false;
              this.setState({ errPermission: ENUM_RESULT_PERMISSION.UNAVAILABLE.MESSAGE, isErrPermission: true });
            });
        }
          break;
        case ENUM_RESULT_PERMISSION.UNAVAILABLE.CODE:
        case ENUM_RESULT_PERMISSION.BLOCKED.CODE: {
          this.setState({ errPermission: ENUM_RESULT_PERMISSION.UNAVAILABLE.MESSAGE, isErrPermission: true });
          isGranted = false;
        }
          break;
        default: {
          isGranted = false;
        }
          break;
        }
      })
      .catch(() => {
        isGranted = false;
      })
      .finally(() => {
        return isGranted;
      });
    return isGranted;
  }

  listenFocusedScreen = () => {
    this.focusedListener = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.checkPermissionForSteps();
      }
    );
  }

  componentWillUnmount() {
    this.focusedListener && this.focusedListener?.remove();
  }

  checkBandwidthValid = (speed) => {
    if (!speed || Number.isNaN(speed)) {
      this.setState({ showBandWidthModal: false });
    } else {
      this.setState({ showBandWidthModal: speed <= MINIMUM_BANDWIDTH });
    }
  }

  getNetworkBandwidth = async () => {
    await checkBandWidth()
      .then(data => {
        console.log('Check bandwidth ' + LogManager.parseJsonObjectToJsonString(data));
        this.setState({ bandWidth: data }, () => {
          this.checkBandwidthValid(data?.speed || 0);
        });
      })
      .catch(err => {
        this.setState({ bandWidth: {}, showBandWidthModal: true });
      });

    // If wanna cancel, do this.
    // await cancelCheckBandWidth();
  }

  handleFinish = () => {
    this.setState({ success: false }, () => {
      // Need to navigate to RootMiner to pass params
      // this.goToScreen(routeNames.RootMiner, { setupNode: true });
      this.goToScreen(routeNames.Node, { setupNode: true });
    });
  };

  handleSetupComplete = () => {
    this.setState({ success: true });
  };

  nextScreen = async () => {
    const { bandWidth } = this.state;
    let isLocationGranted = await this.checkPermissionForSteps();
    if (isLocationGranted) {
      if (Number(bandWidth?.speed || 0) > MINIMUM_BANDWIDTH) {
        const { step } = this.state;
        this.setState({ step: step + 1 });
      } else {
        this.setState({ showBandWidthModal: true });
      }
    }
  };

  scanQrCodeComplete = ({ qrCode, account, hotspotSSID }) => {
    if (account && account?.ValidatorKey && account?.PaymentAddress) {
      this.setState({ qrCode, account, hotspotSSID }, this.nextScreen);
    }
  };

  renderStep() {
    const { step, qrCode, hotspotSSID, account } = this.state;

    if (step === 0) {
      return (
        <FirstScreen
          onNext={this.nextScreen}
          goToScreen={this.goToScreen}
        />
      );
    }

    if (step === 1) {
      return (
        <ScanQRCode onNext={this.scanQrCodeComplete} />
      );
    }

    if (step === 2) {
      return (
        <TurnOffCellular onNext={this.nextScreen} />
      );
    }

    if (step === 3) {
      return (
        <WifiSetup
          onNext={this.handleSetupComplete}
          qrCode={qrCode}
          account={account}
          hotspotSSID={hotspotSSID}
        />
      );
    }
  }

  openSettingApp = () => {
    let messageErr = 'Can\'t handle settings url, please go to Setting manually';
    try {
      Linking.openSettings();
    } catch (err) {
      alert(messageErr);
    }
  };

  render() {
    const { success, step, isErrPermission, errPermission, bandWidth, showBandWidthModal } = this.state;
    return (
      <View style={styles.container}>
        <DialogNotify visible={success} onClose={this.handleFinish} />
        <StepIndicator stepCount={4} currentPage={step} />
        {this.renderStep()}
        <ModalPermission
          isVisible={isErrPermission}
          title="Ask location permission"
          btnTitle="Go to Settings"
          subTitle={errPermission}
          uri={locationPermissionPng}
          onPressDismiss={() => {
            this.setState({ errPermission: '', isErrPermission: false });
          }}
          onPressSetting={() => {
            this.setState({ errPermission: '', isErrPermission: false });
            this.openSettingApp();
          }}
        />
        <ModalBandWidth
          isVisible={showBandWidthModal}
          uri={bandWidthPng}
          title="Low quality connection"
          btnTitle="Go to Settings"
          btnSetting='OK'
          subTitle={`We recommend to you should use the better wifi/celcular for setting up everything smoother.\nCurrently, speed is ${bandWidth?.speed?.toFixed(2) || 0} MBps`}
          onPress={() => {
            this.setState({ showBandWidthModal: false });
          }}
          onPressSetting={() => {
            this.setState({ showBandWidthModal: false });
            this.openSettingApp();
          }}
        />
      </View>
    );
  }

}

GetStartedAddNode.propTypes = {};

GetStartedAddNode.defaultProps = {};
const mapStateToProps = state => ({
  getAccountByName: getAccountByName(state),
});
const mapDispatchToProps = {};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(GetStartedAddNode));
