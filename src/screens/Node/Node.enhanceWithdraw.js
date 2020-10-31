import React, {useMemo, useState} from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import {MESSAGES} from '@src/constants';
import {useSelector} from 'react-redux';
import {nodeSelector} from '@screens/Node/Node.selector';
import {Toast} from '@components/core';
import APIService from '@services/api/miner/APIService';
import NodeService from '@services/NodeService';
import {ExHandler} from '@services/exception';
import _ from 'lodash';
import accountService from '@services/wallet/accountService';
import {getTransactionByHash} from '@services/wallet/RpcClientService';
import {onClickView} from '@utils/ViewUtil';

const enhanceWithdraw = WrappedComp => props => {
  const { listDevice, noRewards }
    = useSelector(nodeSelector);
  const wallet
    = useSelector(state => state.wallet);

  const [withdrawTxs, setWithdrawTxs] = useState({});
  const [withdrawing, setWithdrawing] = useState(false);

  const withdrawable = useMemo(() => {
    const validNodes = listDevice.filter(device => device.AccountName &&
      !_.isEmpty(device?.Rewards) &&
      _.some(device.Rewards, value => value),
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
    setWithdrawing(true);
    // dispatch(actionUpdateWithdrawing(true));
    for (const device of listDevice) {
      try {
        await handleWithdraw(device, false);
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
          checkWithdrawTxsStatus,
          handleWithdrawAll,
          handlePressWithdraw,

          withdrawing,
          withdrawable,
          noRewards
        }}
      />
    </ErrorBoundary>
  );
};

export default enhanceWithdraw;