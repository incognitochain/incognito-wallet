import React, {useCallback, useEffect, useState} from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { nodeSelector } from '@screens/Node/Node.selector';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from 'react-navigation-hooks';
import _ from 'lodash';
import { compose } from 'recompose';
import HeaderNode from '@screens/Node/components/HeaderNode/RightHeaderAddNode';
import nodeSignInEnhance from '@screens/Node/Node.enhanceSignIn';
import { checkIfVerifyCodeIsExisting, checkShowWelcome} from '@screens/Node/Node.utils';
import APIService from '@src/services/api/miner/APIService';
import LocalDatabase from '@utils/LocalDatabase';
import Device from '@models/device';
import {
  actionGetNodeFullInfo,
  actionUpdateFetching,
  actionUpdateListNodeDevice as updateListNode, actionUpdateWithdrawing
} from '@screens/Node/Node.actions';
import {ExHandler} from '@services/exception';
import routeNames from '@routers/routeNames';
import { MESSAGES } from '@src/constants';
import accountService from '@services/wallet/accountService';
import NodeService from '@services/NodeService';
import {Toast} from '@components/core';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import appConstant from '@src/constants/app';
import {getTransactionByHash} from '@services/wallet/RpcClientService';
import { onClickView } from '@utils/ViewUtil';
import { parseNodeRewardsToArray } from '@screens/Node/utils';
import convert from '@utils/convert';
import { PRV_ID } from '@screens/Dex/constants';

/*
* avoid refresh data to much
* */
let lastRefreshTime;

const nodeEnhance = WrappedComp => props => {
  const [onPress, isDisabled] = useFeatureConfig(appConstant.DISABLED.BUY_NODE);
  const { refresh } = props?.navigation?.state?.params || {};
  const navigation  = useNavigation();
  const dispatch    = useDispatch();

  //State
  const [showWelcome, setShowWelcome]
    = useState(false);
  const [showModalMissingSetup, setShowModalMissingSetup]
    = useState(false);
  const [verifyProductCode, setVerifyProductCode]
    = useState('');
  const [loadedDevices, setLoadedDevices]
    = useState([]);
  const [withdrawTxs, setWithdrawTxs]
    = useState({});
  const [withdrawable, setWithdrawable]
    = useState(false);
  const [removingDevice, setRemovingDevice]
    = useState(null);
  const [rewards, setRewards]
    = useState(null);
  const [noRewards, setNoRewards]
    = useState(false);

  //Redux store
  const wallet
    = useSelector(state => state.wallet);
  const {
    isFetching,
    listDevice,
    withdrawing,
    allTokens,
    committees,
    nodeRewards,
  } = useSelector(nodeSelector);

  //Actions
  const showToastMessage = (message = '') => {
    message && Toast.showInfo(message, { duration: 10000 });
  };

  const checkWithdrawTxsStatus = () => {
    const _withdrawTxs = _.cloneDeep(withdrawTxs);
    _.forEach(_withdrawTxs, async (txId, key) => {
      const tx = await getTransactionByHash(txId);

      if (tx.err || tx.isInBlock) {
        delete _withdrawTxs[key];
      }
    });
    setWithdrawTxs(_withdrawTxs);
  };

  const getFullInfo = (_list) => {
    const _listDevice = _list || listDevice;
    if (!_listDevice || _listDevice.length === 0) {
      dispatch(actionUpdateFetching(false));
      return;
    }
    setLoadedDevices([]);
    dispatch(actionGetNodeFullInfo(allTokens));
  };
  const refreshData = async () => {
    // to refresh token
    APIService.getProductList(true).then();

    let list = (await LocalDatabase.getListDevices()) || [];
    list = list.map(item => Device.getInstance(item));

    if (!isFetching && !_.isEmpty(list)) {
      dispatch(updateListNode({
        listDevice: list,
        isFetching: true
      }));
      getFullInfo(list);
      checkWithdrawTxsStatus();
    } else {
      dispatch(updateListNode({ listDevice: list }));
      getFullInfo(list);
    }
  };

  const reloadData = async (firstTime) => {
    if (firstTime && (!refresh || (refresh === lastRefreshTime))) {
      return;
    }
    console.log('SANG TEST', refresh);
    lastRefreshTime = refresh || new Date().getTime();
    checkShowWelcome(listDevice)
      .then((isShow) => {
        setShowWelcome(isShow);
      });

    // Check old product code
    checkIfVerifyCodeIsExisting()
      .then(({showModal, verifyProductCode}) => {
        setShowModalMissingSetup(showModal);
        setVerifyProductCode(verifyProductCode);
      });

    // Refresh newest
    refreshData().then();
  };

  /*missing setup modal actions*/
  const onMissingSetupResume = () => {
    setShowModalMissingSetup(false);
    navigation.navigate(routeNames.RepairingSetupNode, {
      isRepairing: true,
      verifyProductCode: verifyProductCode
    });
  };

  const onMissingSetupGoBack = () => {
    setShowModalMissingSetup(false);
    navigation.navigate(routeNames.Home);
  };

  const onClearNetworkNextTime = async () => {
    await LocalDatabase.setNodeCleared('1');
    setShowWelcome(false);
  };

  const handleAddVirtualNodePress = () => {
    navigation.navigate(routeNames.AddSelfNode);
  };

  const handleAddNodePress = () => {
    navigation.navigate(routeNames.GetStaredAddNode);
  };

  const sendWithdrawTx = async (paymentAddress, tokenIds) => {
    const _withdrawTxs = _.cloneDeep(withdrawTxs);
    const listAccount = await wallet.listAccount();
    for (const tokenId of tokenIds) {
      const account = listAccount.find(item => item.PaymentAddress === paymentAddress);
      await accountService.createAndSendWithdrawRewardTx(tokenId, account, wallet)
        .then((res) => _withdrawTxs[paymentAddress] = res?.txId)
        .catch(() => null);
    }
    setWithdrawTxs(_withdrawTxs);
    return _withdrawTxs;
  };

  const handleWithdraw = async (device, showToast = true) => {
    try {
      const account = device.Account;
      const rewards = device.Rewards;
      if ((device.IsVNode) || (device.IsFundedUnstaked)) {
        const { PaymentAddress } = (account || {});
        const tokenIds = Object.keys(rewards)
          .filter(id => rewards[id] > 0);
        const txs = await sendWithdrawTx(PaymentAddress, tokenIds);
        const message = MESSAGES.VNODE_WITHDRAWAL;

        if (showToast) {
          showToastMessage(message);
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
          showToastMessage(message);
        }
      }
    } catch (error) {
      if (showToast) {
        new ExHandler(error).showErrorToast(true);
      }
      throw error;
    }
  };

  const handleWithdrawAll = async () => {
    dispatch(actionUpdateWithdrawing(true));
    for (const device of listDevice) {
      try {
        await handleWithdraw(device, false);
      } catch {/*Ignore the error*/}
    }
    showToastMessage(MESSAGES.ALL_NODE_WITHDRAWAL);
  };

  const onBuyNodePress = () => {
    if (isDisabled) {
      onPress && onPress();
      return;
    }
    navigation.navigate(routeNames.BuyNodeScreen);
  };

  const handlePressWithdraw = onClickView(handleWithdraw);

  const handlePressStake = onClickView(async (device) => {
    navigation.navigate(routeNames.AddStake, { device });
  });

  const handlePressUnstake = onClickView(async (device) => {
    navigation.navigate(routeNames.Unstake, { device });
  });

  const handlePressRemoveDevice = async (item) => {
    setRemovingDevice(item);
  };

  const importAccount = () => {
    navigation.navigate(routeNames.ImportAccount, {
      onGoBack: () => navigation.navigate(routeNames.Node, {
        refresh: new Date().getTime()
      }),
    });
  };

  const handleGetNodeInfoCompleted = async ({ device, index }) => {
    const _listDevice     = _.cloneDeep(listDevice);
    const _loadedDevices  = _.cloneDeep(loadedDevices);
    const _withdrawTxs    = _.cloneDeep(withdrawTxs);

    if (device) {
      const deviceIndex = _listDevice.findIndex(item => item.ProductId === device.ProductId);
      if (deviceIndex > -1) {
        _listDevice[deviceIndex] = device;
        await LocalDatabase.saveListDevices(_listDevice);
      }
    }
    _loadedDevices.push(index);
    setLoadedDevices(_loadedDevices);
    dispatch(updateListNode({
      listDevice: _listDevice
    }));

    let _noRewards = true;
    let rewardsList = [];
    _listDevice.forEach((element) => {
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
            _noRewards = false;
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

    const vNodeWithdrawable = vNodes.length && vNodes.length !== _withdrawTxs?.length;
    const pNodeWithdrawable = pNodes.length && pNodes.some(item => item.IsFundedStakeWithdrawable);
    const _withdrawable = !_noRewards && (vNodeWithdrawable || pNodeWithdrawable);
    setRewards(rewardsList);
    setWithdrawable(_withdrawable);
    setNoRewards(_noRewards);
  };

  const handleConfirmRemoveDevice = async () => {
    const newList = await LocalDatabase.removeDevice(removingDevice, listDevice);
    setRemovingDevice(null);
    dispatch(updateListNode({
      listDevice: newList,
    }));
  };

  const handleCancelRemoveDevice = () => {
    setRemovingDevice(null);
  };

  useEffect(() => {
    reloadData(true).then();
  }, []);

  useFocusEffect(
    useCallback( () => {
      reloadData().then();
    }, [refresh])
  );

  return (
    <ErrorBoundary>
      <HeaderNode disable={
        showWelcome ||
        (!isFetching && _.isEmpty(listDevice))}
      />
      <WrappedComp
        {...{
          ...props,
          listDevice,
          wallet,
          isFetching,
          showModalMissingSetup,
          verifyProductCode,
          withdrawing,
          withdrawable,
          withdrawTxs,
          committees,
          nodeRewards,
          allTokens,
          rewards,
          removingDevice,
          noRewards,
          loadedDevices,

          refreshData,
          onMissingSetupGoBack,
          onMissingSetupResume,
          onClearNetworkNextTime,
          handleAddVirtualNodePress,
          handleAddNodePress,
          handleWithdrawAll,
          onBuyNodePress,
          handlePressStake,
          handlePressUnstake,
          handlePressWithdraw,
          handlePressRemoveDevice,
          importAccount,
          handleGetNodeInfoCompleted,
          handleConfirmRemoveDevice,
          handleCancelRemoveDevice
        }}
      />
    </ErrorBoundary>
  );
};

export default compose(
  nodeSignInEnhance,
  nodeEnhance,
);
