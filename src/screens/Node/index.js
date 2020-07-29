import { Alert, Button } from '@components/core';
import DialogLoader from '@components/DialogLoader';
import Device from '@models/device';
import BaseScreen from '@screens/BaseScreen';
import NodeItem from '@screens/Node/components/NodeItem';
import WelcomeNodes from '@screens/Node/components/Welcome';
import { getTokenList } from '@services/api/token';
import { CustomError, ErrorCode, ExHandler } from '@services/exception';
import NodeService from '@services/NodeService';
import accountService from '@services/wallet/accountService';
import {
  getBeaconBestStateDetail,
  getBlockChainInfo,
  listRewardAmount
} from '@services/wallet/RpcClientService';
import tokenService, { PRV } from '@services/wallet/tokenService';
import { CONSTANT_CONFIGS, MESSAGES } from '@src/constants';
import routeNames from '@src/router/routeNames';
import APIService from '@src/services/api/miner/APIService';
import COLORS from '@src/styles/colors';
import LocalDatabase from '@utils/LocalDatabase';
import Util from '@utils/Util';
import { onClickView } from '@utils/ViewUtil';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import LogManager from '@src/services/LogManager';
import WelcomeSetupNode from './components/WelcomeSetupNode';
import Header from './Header';
import style from './style';

export const TAG = 'Node';

let allTokens = [PRV];
let beaconHeight;
let committees = {
  AutoStaking: [],
  ShardPendingValidator: {},
  CandidateShardWaitingForNextRandom: [],
  CandidateShardWaitingForCurrentRandom: [],
  ShardCommittee: {},
};
let nodeRewards = {};

const updateBeaconInfo = async (listDevice) => {
  const chainInfo = await getBlockChainInfo();
  const beacon = chainInfo.BestBlocks['-1'];
  const currentHeight = beacon.Height;
  const promises = [];

  if (!committees) {
    committees = {
      AutoStaking: [],
      ShardPendingValidator: {},
      CandidateShardWaitingForNextRandom: [],
      CandidateShardWaitingForCurrentRandom: [],
      ShardCommittee: {},
    };
  }

  if (currentHeight !== beaconHeight) {
    if (!listDevice.every(device => committees.AutoStaking.find(node => node.MiningPubKey.bls === device.PublicKeyMining))) {
      const cPromise = getBeaconBestStateDetail().then(data => {
        if (!_.has(data, 'AutoStaking')) {
          throw new CustomError(ErrorCode.FULLNODE_DOWN);
        }
        committees = data || [];
      });
      promises.push(cPromise);
    }

    const rPromise = listRewardAmount()
      .then(async data => {
        if (!data) {
          throw new CustomError(ErrorCode.FULLNODE_DOWN);
        }
        nodeRewards = data || {};
        let tokenIds = [];

        _.forEach(nodeRewards, reward => tokenIds.push(Object.keys(reward)));
        tokenIds = _.flatten(tokenIds);
        tokenIds = _.uniq(tokenIds);

        let tokenDict = tokenService.flatTokens(allTokens);
        if (tokenIds.some(id => !tokenDict[id])) {
          const pTokens = await getTokenList();
          allTokens = tokenService.mergeTokens(allTokens, pTokens);
          tokenDict = tokenService.flatTokens(allTokens);
          if (tokenIds.some(id => !tokenDict[id])) {
            const chainTokens = await tokenService.getPrivacyTokens();
            allTokens = tokenService.mergeTokens(chainTokens, allTokens);
          }
        }
      });
    promises.push(rPromise);
  }

  beaconHeight = currentHeight;

  return Promise.all(promises);
};

class Node extends BaseScreen {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      listDevice: [],
      loadedDevices: [],
      balancePRV: 0,
      timeToUpdate: Date.now(),
      isFetching: false,
      loading: false,
      showWelcomeSetupNode: false,
      dialogVisible: false,
    };
    this.dialogbox = React.createRef();
    this.renderNode = this.renderNode.bind(this);
  }

  hasShowWelcomeNode = false;

  async componentDidMount() {
    const { navigation } = this.props;
    this.listener = navigation.addListener('willFocus', () => {

      const { setupNode } = navigation?.state?.params || this.props.navigation.dangerouslyGetParent()?.state?.params || {};

      if (setupNode && !this.hasShowWelcomeNode) {
        this.hasShowWelcomeNode = true;
        this.setState({ showWelcomeSetupNode: true });
      }
      // Check old product code
      this.checkIfVerifyCodeIsExisting();
      // Refresh newest
      this.handleRefresh();
    });

    if (allTokens.length === 0) {
      allTokens.push(PRV);
    }
  }

  checkIfVerifyCodeIsExisting = async () => {
    // Check if the current list is existing
    // Check next qrcode === current qrcode with verifyProductCode
    // No need to show
    let list = (await LocalDatabase.getListDevices()) || [];
    let verifyProductCode = await LocalDatabase.getVerifyCode();
    let deviceList = [];
    let verifyCodeList = [];
    list.forEach(element => {
      deviceList.push(element?.product_name);
      verifyCodeList.push(element?.verify_code);
    });
    console.log('Verify code in Home node ' + verifyProductCode);
    if (verifyProductCode && verifyProductCode != '') {
      console.log('Verify code in Home node ' + verifyProductCode);
      let result = await NodeService.verifyProductCode(verifyProductCode);
      console.log('Verifing process check code in Home node to API: ' + LogManager.parseJsonObjectToJsonString(result));
      // We also add tracking log
      await APIService.trackLog({
        action: 'tracking_node_devices', message: 'Tracking node devices info for better supportable', rawData: JSON.stringify({
          deviceList: deviceList || [],
          verifyProductCode: verifyProductCode || 'Empty',
          list: list,
          result: result || {}
        }), status: 1
      });
      
      if (result && result?.verify_code && result?.verify_code === verifyProductCode) { // VerifyCode the same and product_name in list
        Alert.alert(
          'Something stopped unexpectedly',
          'Please resume setup to bring Node online',
          [
            { text: 'Back', onPress: () => this.goToScreen(routeNames.Home) },
            { text: 'Skip', onPress: () => {} },
            { text: 'Resume', onPress: () => { this.goToScreen(routeNames.RepairingSetupNode, { isRepairing: true, verifyProductCode: verifyProductCode }); } },
          ],
          { cancelable: false }
        );
      }
    } else {
      // Force eventhough the same
      LocalDatabase.saveVerifyCode('');
    }

  }

  componentWillUnmount() {
    if (this.listener) {
      this.listener.remove();
    }
  }

  onResume = () => {
    this.handleRefresh();
  };

  async componentWillMount() {
    await this.createSignIn();
  }

  closeWelcomeSetupNode = () => {
    this.setState({ showWelcomeSetupNode: false });
  };

  sendWithdrawTx = async (paymentAddress, tokenIds) => {
    const { wallet } = this.props;
    const listAccount = await wallet.listAccount();
    for (const tokenId of tokenIds) {
      const account = listAccount.find(item => item.PaymentAddress === paymentAddress);
      await accountService.createAndSendWithdrawRewardTx(tokenId, account, wallet)
        .catch(() => null);
    }
  };

  createSignIn = async () => {
    const user = await LocalDatabase.getUserInfo();
    if (_.isEmpty(user)) {
      this.setState({
        loading: true
      });
      const deviceId = DeviceInfo.getUniqueId();
      const params = {
        email: deviceId + '@minerX.com',
        password: Util.hashCode(deviceId)
      };
      let response = await APIService.signUp(params);
      if (response?.status !== 1) {
        response = await APIService.signIn(params);
      }
      const { status, data } = response;
      const list = (status === 1 && await this.saveData(data)) || [];
      this.setState({
        loading: false,
        listDevice: list
      });
    }
  };

  saveData = async (data): Promise<Array<Object>> => {
    let filterProducts = [];
    if (data) {
      const {
        email,
        fullname,
        id,
        token,
        phone,
        user_hash,
        gender,
        credit,
        last_update_task,
        created_at,
        country,
        birth,
        city,
        code,
        refresh_token
      } = data;
      const user = {
        email: email,
        fullname: fullname,
        id: id,
        token: token,
        refresh_token: refresh_token,
        user_hash: user_hash,
        last_update_task: last_update_task,
        birth: birth,
        city: city,
        code: code,
        country: country,
        created_at: created_at,
        credit: credit,
        gender: gender,
        phone: phone
      };
      await LocalDatabase.saveUserInfo(JSON.stringify(user));
    }
    return filterProducts;
  };

  async getFullInfo() {
    const { listDevice } = this.state;

    if (!listDevice || listDevice.length === 0) {
      return this.setState({ isFetching: false });
    }

    this.setState({ loadedDevices: [] });

    updateBeaconInfo(listDevice)
      .catch(error => {
        new ExHandler(error).showErrorToast(true);
      })
      .finally(() => this.setState({ isFetching: false }));
  }

  handleGetNodeInfoCompleted = async ({ device, index }) => {
    const { listDevice, loadedDevices } = this.state;

    if (device) {
      const deviceIndex = listDevice.findIndex(item => item.ProductId === device.ProductId);
      if (deviceIndex) {
        listDevice[deviceIndex] = device;
        await LocalDatabase.saveListDevices(listDevice);
      }
    }

    loadedDevices.push(index);

    this.setState({ listDevice, loadedDevices });
  };

  handleRefresh = async () => {
    const { isFetching } = this.state;

    // to refresh token
    APIService.getProductList(true);

    let list = (await LocalDatabase.getListDevices()) || [];
    list = list.map(item => Device.getInstance(item));

    if (!isFetching && !_.isEmpty(list)) {
      this.setState({
        isFetching: true,
        isLoadMore: false,
        listDevice: list,
      }, this.getFullInfo);
    } else {
      this.setState({ listDevice: list });
    }
  };

  handleAddVirtualNodePress = () => {
    this.goToScreen(routeNames.AddSelfNode);
  };

  handleAddNodePress = () => {
    this.goToScreen(routeNames.GetStaredAddNode);
  };

  handlePressRemoveDevice = (item) => {
    const { listDevice } = this.state;
    Alert.alert('Confirm', 'Are you sure to delete this item?', [
      {
        text: 'Yes', onPress: async () => {
          const newList = await LocalDatabase.removeDevice(item, listDevice);
          this.setState({ listDevice: newList });
        }
      },
      { text: 'Cancel' }
    ], { cancelable: true });
  };

  handlePressWithdraw = onClickView(async (device) => {
    try {
      const account = device.Account;
      const rewards = device.Rewards;
      this.setState({ loading: true });
      if ((device.IsVNode) || (device.Unstaked)) {
        const { PaymentAddress } = (account || {});
        const tokenIds = Object.keys(rewards)
          .filter(id => rewards[id] > 0);
        await this.sendWithdrawTx(PaymentAddress, tokenIds);

        const message = MESSAGES.VNODE_WITHDRAWAL;
        this.showToastMessage(message);
      } else {
        await APIService.requestWithdraw({
          ProductID: device.ProductId,
          QRCode: device.qrCodeDeviceId,
          ValidatorKey: device.ValidatorKey,
          PaymentAddress: device.PaymentAddressFromServer
        });
        device.IsWithdrawable = await NodeService.isWithdrawable(device);
        const message = MESSAGES.PNODE_WITHDRAWAL;
        this.showToastMessage(message);
      }
    } catch (error) {
      new ExHandler(error).showErrorToast(true);
    } finally {
      this.setState({ loading: false });
    }
  });

  handlePressStake = onClickView(async (device) => {
    this.goToScreen(routeNames.AddStake, { device });
  });

  handlePressUnstake = onClickView(async (device) => {
    this.goToScreen(routeNames.Unstake, { device });
  });

  importAccount = () => {
    this.goToScreen(routeNames.ImportAccount);
  };

  renderNode({ item, index }) {
    const { wallet } = this.props;
    const {
      isFetching,
    } = this.state;

    return (
      <NodeItem
        wallet={wallet}
        committees={committees}
        nodeRewards={nodeRewards}
        allTokens={allTokens}
        item={item}
        isFetching={isFetching}
        index={index}
        onStake={this.handlePressStake}
        onUnstake={this.handlePressUnstake}
        onWithdraw={this.handlePressWithdraw}
        onRemove={this.handlePressRemoveDevice}
        onGetInfoCompleted={this.handleGetNodeInfoCompleted}
        onImport={this.importAccount}
      />
    );
  }

  render() {
    const {
      listDevice,
      isFetching,
      loading,
      loadedDevices,
      showWelcomeSetupNode,
    } = this.state;

    if (!isFetching && _.isEmpty(listDevice)) {
      return (
        <ScrollView refreshControl={(
          <RefreshControl
            onRefresh={this.handleRefresh}
            refreshing={isFetching}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        )}
        >
          <WelcomeNodes
            onAddVNode={this.handleAddVirtualNodePress}
            onAddPNode={this.handleAddNodePress}
          />
        </ScrollView>
      );
    }

    return (
      <View style={style.container}>
        <View style={style.background} />
        <Header goToScreen={this.goToScreen} isFetching={listDevice.length > loadedDevices.length || isFetching} />
        <DialogLoader loading={loading} />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={(
            <RefreshControl
              onRefresh={this.handleRefresh}
              refreshing={isFetching}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          )}
        >
          <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[{ flexGrow: 1 }]}
            style={style.list}
            data={listDevice}
            keyExtractor={item => String(item.ProductId)}
            onEndReachedThreshold={0.7}
            renderItem={this.renderNode}
          />
          <Button
            style={style.buyButton}
            title="Get a Node"
            onPress={() => { this.goToScreen(routeNames.BuyNodeScreen); }}
          />

        </ScrollView>
        <WelcomeSetupNode visible={showWelcomeSetupNode} onClose={this.closeWelcomeSetupNode} />
      </View>
    );
  }
}

Node.propTypes = {
  wallet: PropTypes.object.isRequired,
};

Node.defaultProps = {};

const mapState = state => ({
  wallet: state.wallet,
});

export default connect(
  mapState,
  null,
)(Node);
