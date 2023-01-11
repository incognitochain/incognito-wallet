import React, { useMemo } from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { MESSAGES } from '@src/constants';
import { Toast } from '@components/core';
import APIService from '@services/api/miner/APIService';
import NodeService from '@services/NodeService';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { onClickView } from '@utils/ViewUtil';
import { useDispatch, useSelector } from 'react-redux';
import {
  actionUpdateWithdrawing as updateWithdrawing,
  updateWithdrawTxs,
} from '@screens/Node/Node.actions';
import { getValidNodes, checkValidNode, findAccountFromListAccounts } from '@screens/Node/Node.utils';
import { listAllMasterKeyAccounts } from '@src/redux/selectors/masterKey';
import { MAX_FEE_PER_TX } from '@src/components/EstimateFee/EstimateFee.utils';
import { getPrivacyPRVInfo, validatePRVBalanceSelector } from '@src/redux/selectors/selectedPrivacy';
import BigNumber from 'bignumber.js';
import convert from '@src/utils/convert';
import { actionRefillPRVModalVisible } from '@src/screens/RefillPRV/RefillPRV.actions';

const enhanceWithdraw = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const listAccount = useSelector(listAllMasterKeyAccounts);
  const { feePerTx, prvBalanceOriginal, pDecimals, feePerTxToHumanStr, feeAndSymbol } = useSelector(getPrivacyPRVInfo);
  const validatePRVBalanceFn = useSelector(validatePRVBalanceSelector);
  
  const { listDevice, noRewards, withdrawTxs, withdrawing } = props;

  const withdrawable = useMemo(() => {
    const validNodes = getValidNodes(listDevice);
    const vNodes = validNodes.filter((device) => device.IsVNode);
    const pNodes = validNodes.filter((device) => device.IsPNode);
    const vNodeWithdrawable =
      vNodes.length && vNodes.length !== withdrawTxs?.length;
    const pNodeWithdrawable =
      pNodes.length && pNodes.some((item) => item.IsFundedStakeWithdrawable);
    return (!noRewards && vNodeWithdrawable) || pNodeWithdrawable;
  }, [withdrawTxs, listDevice, noRewards]);

  const showToastMessage = (message = '') => {
    message && Toast.showInfo(message, { duration: 10000 });
  };

  // Support withdraw VNode | PNode unstaked
  const sendWithdrawTx = async (paymentAddress, tokenIds) => {
    const _withdrawTxs = {};
    for (const tokenId of tokenIds) {
      const account = findAccountFromListAccounts({
        accounts: listAccount,
        address: paymentAddress
      });
      const res = await accountService.createAndSendWithdrawRewardTx({
        tokenID: tokenId,
        account,
        wallet: account.Wallet,
        fee: MAX_FEE_PER_TX,
      });
      _withdrawTxs[paymentAddress] = res?.txId;
    }
    dispatch(updateWithdrawTxs(Object.assign(withdrawTxs, _withdrawTxs)));
    return _withdrawTxs;
  };

  const handleWithdraw = async (device, showToast = true) => {
    try {
      const account = device.Account;
      const allRewards = device?.AllRewards;
      const {
        isEnoughtPRVNeededAfterBurn,
        isCurrentPRVBalanceExhausted,
      } = validatePRVBalanceFn(MAX_FEE_PER_TX);
      
      // Case withdraw VNode | PNode unstaked
      if (device.IsVNode || device.IsFundedUnstaked) {

        if (isCurrentPRVBalanceExhausted) {
          Toast.showError(`${feeAndSymbol} is required per node.` + '\n' + 'Insufficient PRV balance to cover network fee.', { duration: 10000 });
          return;
        }

        if (!isEnoughtPRVNeededAfterBurn) {
          dispatch(actionRefillPRVModalVisible(true));
          return;
        }

        const { PaymentAddress } = account || {};
        // get tokens can withdraw with PaymentAddress
        const tokenIds = allRewards.reduce((tokens, currentReward) => {
          let tokenIds = tokens;
          if (currentReward?.balance > 0) {
            tokenIds.push(currentReward?.id);
            return tokenIds;
          }
          return tokenIds;
        }, []);
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
          PaymentAddress: device.PaymentAddressFromServer,
        });
        device.IsFundedStakeWithdrawable = await NodeService.isWithdrawable(
          device,
        );
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

const validateNetworkFee = (listDevice) => {
  // console.log('listDevice ', listDevice);
  let isValid = false;
  const vNodeDeviceCount = listDevice.reduce((prev, curr) => {
    if (curr.IsVNode || curr.IsFundedUnstaked) {
      ++prev;
    }
    return prev;
  }, 0) || 1;

  const totalNetworkFeeForVNodes = vNodeDeviceCount * (feePerTx || MAX_FEE_PER_TX);

  let {
    isEnoughtPRVNeededAfterBurn,
    isCurrentPRVBalanceExhausted,
  } = validatePRVBalanceFn(totalNetworkFeeForVNodes);

  if (new BigNumber(prvBalanceOriginal).gt(totalNetworkFeeForVNodes)) {
    isValid = true;
  }

  const totalNetworkFeeForVNodesStr = convert.toHumanAmount(
    new BigNumber(totalNetworkFeeForVNodes),
    pDecimals,
  );
  return { isValid, isEnoughtPRVNeededAfterBurn, isCurrentPRVBalanceExhausted, totalNetworkFeeForVNodesStr };
};

  const handleWithdrawAll = async () => {

    const { isValid, isEnoughtPRVNeededAfterBurn, isCurrentPRVBalanceExhausted, totalNetworkFeeForVNodesStr } = validateNetworkFee(listDevice);

    if (!isValid) {
      Toast.showError(`${feeAndSymbol} is required per node.` + '\n' + 'Insufficient PRV balance to cover network fee.', { duration: 10000 });
      return;
    }

    if (!isEnoughtPRVNeededAfterBurn) {
      dispatch(actionRefillPRVModalVisible(true));
      return;
    }

    dispatch(updateWithdrawing(true));
    for (const device of listDevice) {
      try {
        if (checkValidNode(device)) {
          await handleWithdraw(device, false);
        }
      } catch {
        /*Ignore the error*/
      }
    }
    showToastMessage(MESSAGES.ALL_NODE_WITHDRAWAL);
  };

  const handlePressWithdraw = onClickView(handleWithdraw);

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
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
