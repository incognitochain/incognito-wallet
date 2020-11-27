import React, { useMemo } from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { MESSAGES } from '@src/constants';
import { Toast } from '@components/core';
import APIService from '@services/api/miner/APIService';
import NodeService from '@services/NodeService';
import { ExHandler } from '@services/exception';
import { isEmpty, some } from 'lodash';
import accountService from '@services/wallet/accountService';
import { onClickView } from '@utils/ViewUtil';
import { useDispatch } from 'react-redux';
import {
  actionUpdateWithdrawing as updateWithdrawing,
  updateWithdrawTxs
} from '@screens/Node/Node.actions';

const enhanceWithdraw = WrappedComp => props => {
  const dispatch = useDispatch();
  const { listDevice, noRewards, wallet, withdrawTxs, withdrawing } = props;

  const withdrawable = useMemo(() => {
    const validNodes = listDevice.filter(device => device.AccountName &&
      !isEmpty(device?.Rewards) &&
      some(device.Rewards, value => value),
    );
    const vNodes = validNodes.filter(device => device.IsVNode);
    const pNodes = validNodes.filter(device => device.IsPNode);
    const vNodeWithdrawable = vNodes.length && vNodes.length !== withdrawTxs?.length;
    const pNodeWithdrawable = pNodes.length && pNodes.some(item => item.IsFundedStakeWithdrawable);
    return (!noRewards && vNodeWithdrawable || pNodeWithdrawable);
  }, [withdrawTxs, listDevice, noRewards]);

  const showToastMessage = (message = '') => {
    message && Toast.showInfo(message, { duration: 10000 });
  };

  // Support withdraw VNode | PNode unstaked
  const sendWithdrawTx = async (paymentAddress, tokenIds) => {
    const _withdrawTxs = {};
    const listAccount = await wallet.listAccount();
    for (const tokenId of tokenIds) {
      const account = listAccount.find(item => item.PaymentAddress === paymentAddress);
      await accountService.createAndSendWithdrawRewardTx(tokenId, account, wallet)
        .then((res) => _withdrawTxs[paymentAddress] = res?.txId)
        .catch(() => null);
    }
    dispatch(updateWithdrawTxs(Object.assign(withdrawTxs, _withdrawTxs)));
    return _withdrawTxs;
  };

  const handleWithdraw = async (device, showToast = true) => {
    try {
      const account = device.Account;
      const rewards = device.Rewards;
      // Case withdraw VNode | PNode unstaked
      if ((device.IsVNode) || (device.IsFundedUnstaked)) {
        const { PaymentAddress } = (account || {});
        const tokenIds = Object.keys(rewards)
          .filter(id => rewards[id] > 0);
        const txs = await sendWithdrawTx(PaymentAddress, tokenIds);
        console.debug('Handle withdraw', txs);
        const message = MESSAGES.VNODE_WITHDRAWAL;

        if (showToast) {
          showToastMessage(message);
        }
        return txs;
      } else {
        // PNode requesting withdraw rewards
        if (device.IsPNode && !device?.IsFundedStakeWithdrawable) {
          return true;
        }
        // Case withdraw PNode
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
    dispatch(updateWithdrawing(true));
    for (const device of listDevice) {
      try {
        if (device.AccountName && some(device.Rewards, reward => reward > 0)) {
          await handleWithdraw(device, false);
        }
      } catch {/*Ignore the error*/}
    }
    showToastMessage(MESSAGES.ALL_NODE_WITHDRAWAL);
  };

  const handlePressWithdraw = onClickView(handleWithdraw);

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          wallet,
          withdrawing,
          withdrawable,
          noRewards,
          withdrawTxs,

          handleWithdrawAll,
          handlePressWithdraw,
        }}
      />
    </ErrorBoundary>
  );
};

export default enhanceWithdraw;
