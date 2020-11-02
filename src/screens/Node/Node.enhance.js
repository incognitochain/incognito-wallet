import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { nodeSelector } from '@screens/Node/Node.selector';
import { useSelector } from 'react-redux';
import {useNavigation} from 'react-navigation-hooks';
import { isEmpty } from 'lodash';
import { compose } from 'recompose';
import HeaderNode from '@screens/Node/components/HeaderNode/RightHeaderAddNode';
import nodeSignInEnhance from '@screens/Node/Node.enhanceSignIn';
import nodeFetchDataEnhance from '@screens/Node/Node.enhanceFetchData';
import nodeStakeEnhance from '@screens/Node/Node.enhanceStake';
import nodeWithdrawEnhance from '@screens/Node/Node.enhanceWithdraw';
import nodeWelcomeEnhance from '@screens/Node/Node.enhanceWelcome';
import nodeRemoveDevicesEnhance from '@screens/Node/Node.enhanceRemoveDevices';
import routeNames from '@routers/routeNames';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import appConstant from '@src/constants/app';

// @listDevice selector from redux and pass by props from @enhanceWelcome
const nodeEnhance = WrappedComp => props => {
  const navigation  = useNavigation();
  const [onPress, isDisabled] = useFeatureConfig(appConstant.DISABLED.BUY_NODE);
  const {
    showWelcome,
    listDevice
  } = props; // Get from enhanceWelcome

  const {
    nodeRewards,
    isFetching,
    isRefreshing,
  } = useSelector(nodeSelector);

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

  return (
    <ErrorBoundary>
      <HeaderNode disable={
        showWelcome ||
        (!isFetching && isEmpty(listDevice))}
      />
      <WrappedComp
        {...{
          ...props,
          isFetching,
          isRefreshing,
          nodeRewards,

          handleAddVirtualNodePress,
          handleAddNodePress,
          onBuyNodePress,
          importAccount,
        }}
      />
    </ErrorBoundary>
  );
};

export default compose(
  nodeWelcomeEnhance,
  nodeRemoveDevicesEnhance,
  nodeWithdrawEnhance,
  nodeStakeEnhance,
  nodeFetchDataEnhance,
  nodeSignInEnhance,
  nodeEnhance,
);
