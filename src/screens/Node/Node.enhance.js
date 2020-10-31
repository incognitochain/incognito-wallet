import React, {useState} from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import {nodeSelector} from '@screens/Node/Node.selector';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from 'react-navigation-hooks';
import _ from 'lodash';
import { compose } from 'recompose';
import HeaderNode from '@screens/Node/components/HeaderNode/RightHeaderAddNode';
import nodeSignInEnhance from '@screens/Node/Node.enhanceSignIn';
import nodeFetchDataEnhance from '@screens/Node/Node.enhanceFetchData';
import nodeStakeEnhance from '@screens/Node/Node.enhanceStake';
import nodeWithdrawEnhance from '@screens/Node/Node.enhanceWithdraw';
import LocalDatabase from '@utils/LocalDatabase';
import { updateListNodeDevice } from '@screens/Node/Node.actions';
import routeNames from '@routers/routeNames';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import appConstant from '@src/constants/app';

let loadedDevices = [];

const nodeEnhance = WrappedComp => props => {
  const [onPress, isDisabled] = useFeatureConfig(appConstant.DISABLED.BUY_NODE);
  const navigation  = useNavigation();
  const dispatch    = useDispatch();

  const [removingDevice, setRemovingDevice]
    = useState(null);

  //Redux store
  const wallet = useSelector(state => state.wallet);
  const {
    //from API
    allTokens,
    committees,
    nodeRewards,

    rewards,

    //new flow
    listDevice,
    isFetching,
    isRefreshing,
  } = useSelector(nodeSelector);


  const onClearNetworkNextTime = async () => {
    await LocalDatabase.setNodeCleared('1');
    // setShowWelcome(false);
  };

  const handleAddVirtualNodePress = () => {
    navigation.navigate(routeNames.AddSelfNode);
  };

  const handleAddNodePress = () => {
    navigation.navigate(routeNames.GetStaredAddNode);
  };

  const onBuyNodePress = () => {
    if (isDisabled) {
      onPress && onPress();
      return;
    }
    navigation.navigate(routeNames.BuyNodeScreen);
  };

  const importAccount = () => {
    navigation.navigate(routeNames.ImportAccount, {
      onGoBack: () => navigation.navigate(routeNames.Node, {
        refresh: new Date().getTime()
      }),
    });
  };

  const handlePressRemoveDevice = async (item) => {
    setRemovingDevice(item);
  };

  const handleConfirmRemoveDevice = async () => {
    const newList = await LocalDatabase.removeDevice(removingDevice, listDevice);
    setRemovingDevice(null);
    dispatch(updateListNodeDevice({
      listDevice: newList,
    }));
  };

  const handleCancelRemoveDevice = () => {
    setRemovingDevice(null);
  };

  //new flow
  return (
    <ErrorBoundary>
      <HeaderNode disable={
        // showWelcome ||
        (!isFetching && _.isEmpty(listDevice))}
      />
      <WrappedComp
        {...{
          ...props,
          listDevice,
          wallet,
          isFetching,
          isRefreshing,
          committees,
          nodeRewards,
          allTokens,
          rewards,
          removingDevice,
          loadedDevices,

          onClearNetworkNextTime,
          handleAddVirtualNodePress,
          handleAddNodePress,
          onBuyNodePress,
          handlePressRemoveDevice,
          importAccount,
          handleConfirmRemoveDevice,
          handleCancelRemoveDevice
        }}
      />
    </ErrorBoundary>
  );
};

export default compose(
  nodeWithdrawEnhance,
  nodeStakeEnhance,
  nodeFetchDataEnhance,
  nodeSignInEnhance,
  nodeEnhance,
);
