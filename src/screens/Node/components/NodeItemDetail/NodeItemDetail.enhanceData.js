import React, {useState} from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import {useNavigationParam} from 'react-navigation-hooks';
import { useSelector } from 'react-redux';
import {checkLoadingNodeByProductId, getDeviceByProductId} from '@screens/Node/Node.selector';
import { get } from 'lodash';

const nodeItemDetailEnhanceData = WrappedComp => props => {
  const onUnstake   = useNavigationParam('onUnstake');
  const onStake     = useNavigationParam('onStake');
  const productId   = useNavigationParam('productId');
  const onImport    = useNavigationParam('onImport');
  const onWithdraw  = useNavigationParam('onWithdraw');
  const withdrawTxs = useNavigationParam('withdrawTxs');

  const [processing, setProcessing] = useState(false);

  const device      = useSelector(getDeviceByProductId)(productId);
  const isLoading   = useSelector(checkLoadingNodeByProductId)(productId);
  const ip          = device?.Host;
  const name        = device?.Name;
  const hasAccount  = !!device?.AccountName;
  const rewardsList = device?.AllRewards;

  let shouldShowWithdraw = false;

  if (rewardsList && rewardsList.length > 0) {
    rewardsList.forEach(element => {
      if (element?.balance > 0) {
        shouldShowWithdraw = true;
      }
    });
  }

  const shouldRenderUnstake = device?.IsUnstakable;
  let withdrawable;

  if (device?.IsPNode && !device?.IsFundedUnstaked && !device?.IsFundedUnstaking) {
    withdrawable = !processing && device?.IsFundedStakeWithdrawable;
  } else {
    withdrawable = !(processing || !!get(withdrawTxs, device?.PaymentAddress));
  }

  if (device?.IsPNode && device?.IsFundedUnstaking) {
    shouldShowWithdraw = false;
  }

  const shouldShowStake = device?.IsUnstaked && !device?.IsUnstaking;

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          isLoading,
          item: device,
          rewardsList,
          name,
          ip,
          withdrawable,
          hasAccount,
          shouldShowStake,
          shouldShowWithdraw,
          processing,
          setProcessing,
          shouldRenderUnstake,
          withdrawTxs,

          onUnstake,
          onStake,
          onImport,
          onWithdraw
        }}
      />
    </ErrorBoundary>
  );
};

export default nodeItemDetailEnhanceData;
