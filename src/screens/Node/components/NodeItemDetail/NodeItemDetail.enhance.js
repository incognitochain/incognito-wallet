import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import nodeItemDetailEnhanceData from '@screens/Node/components/NodeItemDetail/NodeItemDetail.enhanceData';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import {useDispatch} from 'react-redux';
import {
  actionCheckWithdrawTxs as checkWithdrawTxs,
  actionGetNodesInfoFromApi as getNodesInfoFromApi, actionUpdatePNodeItem, actionUpdateVNodeItem as updateVNodeItem
} from '@screens/Node/Node.actions';

const withEnhance = WrappedComp => props => {
  const {
    item,
    onImport,
    onStake,
    onUnstake,
    onWithdraw,
    setProcessing,
    isLoading
  } = props;
  const dispatch   = useDispatch();
  const navigation = useNavigation();

  const onHelpPress = () => {
    navigation.navigate(routeNames.NodeItemsHelp);
  };

  const onImportAccountPress = () => {
    onImport && onImport();
  };

  const onWithdrawPress = async () => {
    try {
      setProcessing && setProcessing(true);
      await onWithdraw(item);
    } catch {
      setProcessing && setProcessing(false);
    }
  };

  const onStakePress = () => {
    onStake && onStake(item);
  };

  const onChangeWifiPress = () => {
    navigation.navigate(routeNames.NodeUpdateWifi, {
      device: item
    });
  };

  const onUnStakePress = () => {
    onUnstake && onUnstake(item);
  };

  const getVNodeInfo = () => {
    dispatch(updateVNodeItem(item));
  };

  const getPNodeInfo = () => {
    dispatch(actionUpdatePNodeItem(item?.ProductId));
  };

  const onRefreshNodeItem = () => {
    if (isLoading) return;
    dispatch(getNodesInfoFromApi());
    dispatch(checkWithdrawTxs());
    item.IsVNode
      ? getVNodeInfo()
      : getPNodeInfo();
  };

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,

          onHelpPress,
          onImportAccountPress,
          onWithdrawPress,
          onStakePress,
          onChangeWifiPress,
          onUnStakePress,
          onRefresh: onRefreshNodeItem
        }}
      />
    </ErrorBoundary>
  );
};


export default compose(
  nodeItemDetailEnhanceData,
  withEnhance,
);