import StepIndicator from '@components/StepIndicator';
import BaseScreen from '@screens/BaseScreen';
import { View } from '@src/components/core';
import { getAccountByName } from '@src/redux/selectors/account';
import routeNames from '@src/router/routeNames';
import React from 'react';
import { connect } from 'react-redux';
import { withNavigationFocus } from 'react-navigation';
import LocalDatabase from '@src/utils/LocalDatabase';
import Header from '@src/components/Header';
import { BtnQuestionDefault } from '@src/components/Button';
import NavigationService from '@src/services/NavigationService';
import { DialogNotify } from '../components/BackUpAccountDialog';
import styles from './styles';
import WifiRepairSetup from './WifiRepairSetup';

export const TAG = 'GetStartedAddNode';


const CONNECTION_STATUS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};


class RepairingSetupNode extends BaseScreen {
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

  static navigationOptions = () => {
    return {
      headerRight: null
    };
  };

  getAccountByName = async () => {
    let accountQRCode = await LocalDatabase.getAccountWithQRCode();
    let account = await getAccountByName(JSON.parse(accountQRCode));
    this.setState({ account: account });
  }

  handleFinish = () => {
    this.setState({ success: false }, () => {
      // Need to navigate to RootMiner to pass params
      this.goToScreen(routeNames.Node, { setupNode: true });
    });
  };

  handleSetupComplete = () => {
    this.setState({ success: true });
  };

  nextScreen = async () => {
    const { step } = this.state;
    this.setState({ step: step + 1 });
  }

  renderStep() {
    const { hotspotSSID, account } = this.state;
    const { navigation } = this.props;
    const { verifyProductCode } = navigation.state.params;
    console.log(verifyProductCode);
    return (
      <WifiRepairSetup
        onNext={this.handleSetupComplete}
        verifyProductCode={verifyProductCode}
        account={account}
        hotspotSSID={hotspotSSID}
      />
    );
  }

  render() {
    const { success, step } = this.state;
    return (
      <View style={styles.container}>
        <Header
          title="Continue setup"
          rightHeader={<BtnQuestionDefault onPress={() => { NavigationService.navigate(routeNames.NodeHelp); }} />}
        />
        <DialogNotify visible={success} onClose={this.handleFinish} />
        {this.renderStep()}
      </View>
    );
  }

}

RepairingSetupNode.propTypes = {};

RepairingSetupNode.defaultProps = {};
const mapStateToProps = state => ({
  getAccountByName: getAccountByName(state),
});
const mapDispatchToProps = {};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(RepairingSetupNode));
