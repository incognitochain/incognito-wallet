// export { default } from './Node';

import React from 'react';
import { ActivityIndicator, RoundCornerButton, Toast } from '@components/core';
import DialogLoader from '@components/DialogLoader';
import Device from '@models/device';
import BaseScreen from '@screens/BaseScreen';
import NodeItem from '@screens/Node/components/NodeItem';
import WelcomeNodes from '@screens/Node/components/Welcome';
import { getTokenList } from '@services/api/token';
import { CustomError, ErrorCode, ExHandler } from '@services/exception';
import NodeService from '@services/NodeService';
import accountService from '@services/wallet/accountService';
import { PRV_ID } from '@screens/Dex/constants';
import {
  getBeaconBestStateDetail,
  getBlockChainInfo,
  getTransactionByHash,
  listRewardAmount
} from '@services/wallet/RpcClientService';
import tokenService, { PRV } from '@services/wallet/tokenService';
import { MESSAGES } from '@src/constants';
import routeNames from '@src/router/routeNames';
import APIService from '@src/services/api/miner/APIService';
import LocalDatabase from '@utils/LocalDatabase';
import Util from '@utils/Util';
import { onClickView } from '@utils/ViewUtil';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { FlatList, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import LogManager from '@src/services/LogManager';
import Header from '@src/components/Header';
import BtnAdd from '@src/components/Button/BtnAdd';
import convert from '@utils/convert';
import NavigationService from '@src/services/NavigationService';
import theme from '@src/styles/theme';
import Rewards from '@screens/Node/components/Rewards';
import { SuccessModal } from '@src/components';
import { parseNodeRewardsToArray } from '@screens/Node/utils';
import appConstant from '@src/constants/app';
import {
  getDurationShowMessage,
  handleGetFunctionConfigs
} from '@src/shared/hooks/featureConfig';
import style from './style';
import WelcomeFirstTime from './components/WelcomeFirstTime';

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
let lastRefreshTime;

const updateBeaconInfo = async () => {
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
    const cPromise = getBeaconBestStateDetail().then(data => {
      if (!_.has(data, 'AutoStaking')) {
        throw new CustomError(ErrorCode.FULLNODE_DOWN);
      }
      committees = data || [];
    });
    promises.push(cPromise);

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
      dialogVisible: false,
      rewards: [],
      showModalMissingSetup: false,
      showWelcome: false,
      withdrawTxs: {},
      disabled: false,
      message: '',
      withdrawing: false,
      withdrawable: false,
    };
    this.renderNode = this.renderNode.bind(this);
  }

  async componentDidMount() {
    const { navigation } = this.props;

    if (allTokens.length === 0) {
      allTokens.push(PRV);
    }

    this.loadData(true);

    this.listener = navigation.addListener('didFocus', this.loadData);
  }

  componentWillUnmount() {
    if (this.listener) {
      this.listener.remove();
    }
  }

  loadData = async (firstTime = false) => {
    const { navigation } = this.props;
    const { listDevice } = this.state;
    const { refresh } = navigation?.state?.params || {};

    if (firstTime !== true && (!refresh || (refresh === lastRefreshTime))) {
      return;
    }

    lastRefreshTime = refresh || new Date().getTime();

    const clearedNode = await LocalDatabase.getNodeCleared();
    const list = (await LocalDatabase.getListDevices()) || [];

    if (!clearedNode && listDevice.length === 0 && list.length > 0) {
      const firstDevice = Device.getInstance(list[0]);

      if (firstDevice.IsPNode && !firstDevice.IsLinked) {
        this.setState({ showWelcome: true });
      }
    }

    // Check old product code
    this.checkIfVerifyCodeIsExisting();
    // Refresh newest
    this.handleRefresh();
  };

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
          result: result || {}
        }), status: 1
      });

      if (result && result?.verify_code && result?.verify_code === verifyProductCode) { // VerifyCode the same and product_name in list
        this.setState({ showModalMissingSetup: true, verifyProductCode });
      }
    } else {
      // Force eventhough the same
      LocalDatabase.saveVerifyCode('');
    }
  };

  onResume = () => {
    this.handleRefresh();
  };

  async componentWillMount() {
    await this.createSignIn();
    const feature = await handleGetFunctionConfigs(appConstant.DISABLED.BUY_NODE);
    const { disabled, message } = feature;
    this.setState({ disabled, message });
  }

  sendWithdrawTx = async (paymentAddress, tokenIds) => {
    const { wallet } = this.props;
    const { withdrawTxs } = this.state;
    const listAccount = await wallet.listAccount();
    for (const tokenId of tokenIds) {
      const account = listAccount.find(item => item.PaymentAddress === paymentAddress);
      await accountService.createAndSendWithdrawRewardTx(tokenId, account, wallet)
        .then((res) => withdrawTxs[paymentAddress] = res?.txId)
        .catch(() => null);
    }

    this.setState({ withdrawTxs });
    return withdrawTxs;
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

    updateBeaconInfo()
      .catch(error => {
        new ExHandler(error).showErrorToast(true);
      })
      .finally(() => this.setState({ isFetching: false }));
  }

  handleGetNodeInfoCompleted = async ({ device, index }) => {
    const { listDevice, loadedDevices, withdrawTxs } = this.state;

    if (device) {

      const deviceIndex = listDevice.findIndex(item => item.ProductId === device.ProductId);
      if (deviceIndex > -1) {
        listDevice[deviceIndex] = device;
        await LocalDatabase.saveListDevices(listDevice);
      }
    }

    loadedDevices.push(index);

    this.setState({ listDevice, loadedDevices }, () => {
      let noRewards = true;
      let rewardsList = [];
      listDevice.forEach((element) => {
        let rewards = !_.isEmpty(element?.Rewards) ? element?.Rewards : { [PRV_ID] : 0};
        if (rewards) {
          const nodeReward = parseNodeRewardsToArray(rewards, allTokens);
          nodeReward.forEach((reward) => {
            const coinTotalReward = rewardsList.find(item => item.id === reward.id);
            if (!coinTotalReward) {
              rewardsList.push(reward);
            } else {
              coinTotalReward.balance += reward.balance;
              coinTotalReward.displayBalance = convert.toHumanAmount(coinTotalReward.balance, coinTotalReward.pDecimals || 0);
            }

            if (reward?.balance > 0) {
              noRewards = false;
            }
          });
        }
      });

      rewardsList = _.orderBy(rewardsList, item => item.displayBalance, 'desc');

      const validNodes = listDevice.filter(device => device.AccountName &&
        !_.isEmpty(device?.Rewards) &&
        _.some(device.Rewards, value => value),
      );

      const vNodes = validNodes.filter(device => device.IsVNode);
      const pNodes = validNodes.filter(device => device.IsPNode);

      const vNodeWithdrawable = vNodes.length && vNodes.length !== withdrawTxs?.length;
      const pNodeWithdrawable = pNodes.length && pNodes.some(item => item.IsFundedStakeWithdrawable);
      const withdrawable = !noRewards && (vNodeWithdrawable || pNodeWithdrawable);

      this.setState({ rewards: rewardsList, withdrawable, noRewards });
    });
  };

  checkWithdrawTxsStatus() {
    const { withdrawTxs } = this.state;

    _.forEach(withdrawTxs, async (txId, key) => {
      const tx = await getTransactionByHash(txId);

      if (tx.err || tx.isInBlock) {
        delete withdrawTxs[key];
      }
    });
  }

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
        withdrawing: false,
      }, this.getFullInfo);

      this.checkWithdrawTxsStatus();
    } else {
      this.setState({ listDevice: list }, () => {
        this.getFullInfo();
      });
    }

  };

  handleAddVirtualNodePress = () => {
    this.goToScreen(routeNames.AddSelfNode);
  };

  handleAddNodePress = () => {
    this.goToScreen(routeNames.GetStaredAddNode);
  };

  handlePressRemoveDevice = async (item) => {
    this.setState({ removingDevice: item });
  };

  handleConfirmRemoveDevice = async () => {
    const { listDevice, removingDevice } = this.state;
    const newList = await LocalDatabase.removeDevice(removingDevice, listDevice);
    this.setState({ listDevice: newList, removingDevice: null });
  };

  handleCancelRemoveDevice = () => {
    this.setState({ removingDevice: null });
  };

  handleWithdrawAll = async () => {
    const { listDevice } = this.state;

    this.setState({ withdrawing: true });

    for (const device of listDevice) {
      try {
        await this.handleWithdraw(device, false);
      } catch {
        // Ignore the error
      }
    }

    this.showToastMessage(MESSAGES.ALL_NODE_WITHDRAWAL);
  };

  handleWithdraw = async (device, showToast = true) => {
    try {
      const account = device.Account;
      const rewards = device.Rewards;
      if ((device.IsVNode) || (device.IsFundedUnstaked)) {
        const { PaymentAddress } = (account || {});
        const tokenIds = Object.keys(rewards)
          .filter(id => rewards[id] > 0);
        const txs = await this.sendWithdrawTx(PaymentAddress, tokenIds);
        const message = MESSAGES.VNODE_WITHDRAWAL;

        if (showToast) {
          this.showToastMessage(message);
        }

        return txs;
      } else {
        await APIService.requestWithdraw({
          ProductID: device.ProductId,
          QRCode: device.qrCodeDeviceId,
          ValidatorKey: device.ValidatorKey,
          PaymentAddress: device.PaymentAddressFromServer
        });
        device.IsFundedStakeWithdrawable = await NodeService.isWithdrawable(device);
        const message = MESSAGES.PNODE_WITHDRAWAL;

        if (showToast) {
          this.showToastMessage(message);
        }
      }
    } catch (error) {
      if (showToast) {
        new ExHandler(error).showErrorToast(true);
      }

      throw error;
    }
  };

  handlePressWithdraw = onClickView(this.handleWithdraw);

  handlePressStake = onClickView(async (device) => {
    this.goToScreen(routeNames.AddStake, { device });
  });

  handlePressUnstake = onClickView(async (device) => {
    this.goToScreen(routeNames.Unstake, { device });
  });

  importAccount = () => {
    const { navigation } = this.props;
    this.goToScreen(routeNames.ImportAccount, {
      onGoBack: () => navigation.navigate(routeNames.Node, {
        refresh: new Date().getTime()
      }),
    });
  };

  renderNode({ item, index }) {
    const { wallet } = this.props;
    const {
      isFetching,
      withdrawTxs,
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
        withdrawTxs={withdrawTxs}
      />
    );
  }

  renderModalActionsForNodePrevSetup = () => {
    const { showModalMissingSetup, verifyProductCode } = this.state;
    return (
      <SuccessModal
        title="Something stopped unexpectedly"
        extraInfo="Please resume setup to bring Node online."
        visible={showModalMissingSetup}
        onSuccess={() => {
          this.setState({ showModalMissingSetup: false });
          this.goToScreen(routeNames.RepairingSetupNode, { isRepairing: true, verifyProductCode: verifyProductCode });
        }}
        successTitle="Resume"
        buttonTitle="Back"
        buttonStyle={style.button}
        closeSuccessDialog={() => {
          this.setState({ showModalMissingSetup: false });
          setTimeout(()=>{
            this.goToScreen(routeNames.Home);
          }, 200);
        }}
      />
    );
  };

  onClearNetworkNextTime = async () => {
    await LocalDatabase.setNodeCleared('1');
    this.setState({ showWelcome: false });
  };

  onBuyNodePress = () => {
    const { disabled, message } = this.state;
    if (disabled) {
      const duration = getDurationShowMessage(message);
      Toast.showInfo(message, { duration });
      return;
    }
    this.goToScreen(routeNames.BuyNodeScreen);
  };

  renderTotalRewards() {
    const {
      listDevice,
      loadedDevices,
      rewards,
      withdrawable,
      withdrawing,
      noRewards,
    } = this.state;

    if (listDevice?.length > loadedDevices?.length) {
      return (
        <ActivityIndicator />
      );
    }

    return (
      <View style={{ paddingHorizontal: 25 }}>
        <Rewards rewards={rewards} />
        { !noRewards && (
          <RoundCornerButton
            onPress={this.handleWithdrawAll}
            style={[theme.BUTTON.NODE_BUTTON, { marginBottom: 50 }]}
            title={!withdrawable || withdrawing ? 'Withdrawing all rewards...' : 'Withdraw all rewards'}
            disabled={!withdrawable || withdrawing}
          />
        ) }
      </View>
    );
  }

  renderContent() {
    const {
      listDevice,
      isFetching,
      showWelcome,
      removingDevice,
    } = this.state;


    if (showWelcome) {
      return (
        <View style={{ marginHorizontal: 25 }}>
          <WelcomeFirstTime onPressOk={this.onClearNetworkNextTime} />
        </View>
      );
    }

    if (!isFetching && _.isEmpty(listDevice)) {
      return (
        <View style={{ marginHorizontal: 25 }}>
          <WelcomeNodes
            onAddVNode={this.handleAddVirtualNodePress}
            onAddPNode={this.handleAddNodePress}
          />
        </View>
      );
    }

    return (
      <>
        {this.renderTotalRewards()}
        <View style={{ flex: 1 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[{ flexGrow: 1}]}
            style={style.list}
            data={listDevice}
            keyExtractor={item => String(item.ProductId)}
            renderItem={this.renderNode}
            onRefresh={this.handleRefresh}
            refreshing={isFetching}
          />
          <View style={{ marginHorizontal: 25 }}>
            <RoundCornerButton
              style={[style.buyButton, theme.BUTTON.BLACK_TYPE]}
              title="Get a Node Device"
              onPress={this.onBuyNodePress}
            />
          </View>
          {this.renderModalActionsForNodePrevSetup()}
          <SuccessModal
            title="Remove from display"
            extraInfo={'Are you sure?\nYou can add this Node again later.'}
            visible={!!removingDevice}
            buttonTitle="Remove"
            closeSuccessDialog={this.handleConfirmRemoveDevice}
            onSuccess={this.handleCancelRemoveDevice}
            successTitle="Cancel"
            buttonStyle={theme.BUTTON.NODE_BUTTON}
          />
        </View>
      </>
    );
  }

  render() {
    const {
      loading,
      listDevice,
      isFetching,
      showWelcome,
    } = this.state;

    let rightHeader = <BtnAdd btnStyle={style.rightButton} onPress={() => NavigationService.navigate(routeNames.AddNode)} />;

    if (showWelcome || (!isFetching && _.isEmpty(listDevice))) {
      rightHeader = null;
    }

    return (
      <View style={style.container}>
        <Header
          title="Power"
          rightHeader={rightHeader}
          style={{ paddingHorizontal: 25 }}
        />
        {this.renderContent()}
        {this.renderModalActionsForNodePrevSetup()}
        <DialogLoader loading={loading} />
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
