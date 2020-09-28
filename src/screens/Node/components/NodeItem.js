import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import VirtualNodeService from '@services/VirtualNodeService';
import NodeService from '@services/NodeService';
import accountService from '@services/wallet/accountService';
import {PRV} from '@services/wallet/tokenService';
import {ExHandler} from '@services/exception';
import {PRV_ID} from '@screens/Dex/constants';
import {getUnstakePNodeStatus} from '@services/api/node';
import Device, { MAX_ERROR_COUNT, VALIDATOR_STATUS } from '@models/device';
import _ from 'lodash';
import { getPublicKeyFromPaymentAddress, getTransactionByHash } from '@services/wallet/RpcClientService';
import { COLORS } from '@src/styles';
import { View } from '@components/core';
import Swipeout from 'react-native-swipeout';
import PNode from './PNode';
import VNode from './VNode';
import styles from './style';

export const TAG = 'Node';

const MAX_RETRY = 5;
const TIMEOUT = 5; // 2 minutes

class NodeItem extends React.Component {
  state = { loading: false };

  componentDidUpdate(prevProps) {
    const { isFetching } = this.props;
    if (prevProps.isFetching && !isFetching) {
      this.getInfo();
    }
  }

  async getPNodeInfo(item) {
    const deviceData = await NodeService.fetchAndSavingInfoNodeStake(item);
    const device = Device.getInstance(deviceData);

    if (device.IsSetupViaLan) {
      const res = await NodeService.getLog(device);
      const log = res.Data;

      const { updatedAt, description } = log;

      let data;

      try {
        data = JSON.parse(description);
      } catch {
        // Ignore the error
      }

      if (updatedAt) {
        const startTime = moment(updatedAt);
        const endTime = moment();
        const duration = moment.duration(endTime.diff(startTime));
        const minutes = duration.asMinutes();

        if (minutes > TIMEOUT) {
          device.setIsOnline(Math.max(device.IsOnline - 1, 0));
        } else {
          device.setIsOnline(MAX_RETRY);
          device.Host = data?.ip?.lan;
        }
      }
    } else {
      const ip = await NodeService.pingGetIP(device);
      if (ip) {
        device.Host = ip;
        device.setIsOnline(MAX_RETRY);
      } else {
        device.Host = '';
        device.setIsOnline(Math.max(device.IsOnline - 1, 0));
      }
    }

    if (device.PaymentAddress) {
      const { wallet } = this.props;

      const listAccount = await wallet.listAccount();
      device.IsFundedStakeWithdrawable = await NodeService.isWithdrawable(device);
      device.FundedUnstakeStatus = await getUnstakePNodeStatus({ paymentAddress: device.PaymentAddress });
      device.Account = listAccount.find(item => item.PaymentAddress === device.PaymentAddress);

      if (device.Account) {
        device.ValidatorKey = device.Account.ValidatorKey;
        device.PublicKey = device.Account.PublicKeyCheckEncode;

        const listAccounts = await wallet.listAccountWithBLSPubKey();
        const account = listAccounts.find(item=> _.isEqual(item.AccountName, device.AccountName));

        device.PublicKeyMining = account.BLSPublicKey;
      }

      const { committees } = this.props;

      const autoStakingInfo = committees.AutoStaking.find(item => item.MiningPubKey.bls === device.PublicKeyMining);

      if (autoStakingInfo) {
        if (device.StakerAddress) {
          const stakerPublicKey = await getPublicKeyFromPaymentAddress(device.StakerAddress);

          if (autoStakingInfo.IncPubKey === stakerPublicKey) {
            device.IsFundedAutoStake = autoStakingInfo.IsAutoStake;
          }
        }

        device.IsAutoStake = autoStakingInfo.IsAutoStake;
      }

      if (device.IsFundedUnstakedRequestProcessed) {
        device.IsFundedStakeWithdrawable = true;
        device.StakerAddress = null;

        if (device.IsFundedUnstaked) {
          return this.getVNodeInfo(device, true);
        }
      }

      let ShardCommittee = Object.values(committees?.ShardCommittee) || [];
      let ShardCommitteeData = ShardCommittee[0] || [];

      device.Status = VALIDATOR_STATUS.WAITING;

      if (device.IsFundedUnstaked) {
        device.Status = '';
      }

      if (autoStakingInfo) {
        device.Status = VALIDATOR_STATUS.WAITING;
        for (let i = 0; i < ShardCommitteeData.length; i++) {
          if (device?.PublicKeyMining === ShardCommitteeData[i].MiningPubKey.bls) {
            device.Status = VALIDATOR_STATUS.WORKING;
            break;
          }
        }
      }
    }

    if (device.StakerAddress) {
      const actualRewards = {};
      const commission = device.CommissionFromServer;
      const rewards = await accountService.getRewardAmount('', device.StakerAddress, true);

      rewards[PRV.id] = rewards[PRV.symbol];
      delete rewards[PRV.symbol];

      Object.keys(rewards).forEach(key => {
        actualRewards[key] = Math.round(rewards[key] * commission);

        if (actualRewards[key] <= 0) {
          delete actualRewards[key];
        }
      });

      device.Rewards = actualRewards;
    }

    if (device.IsOnline && device.Host) {
      try {
        const version = await NodeService.checkVersion(device);
        const latestVersion = await NodeService.getLatestVersion();

        device.Firmware = version;

        if (version && version !== latestVersion) {
          NodeService.updateFirmware(device, latestVersion)
            .then(res => console.debug('UPDATE FIRMWARE SUCCESS', device.QRCode, res))
            .catch(e => console.debug('UPDATE FIRMWARE FAILED', device.QRCode, e));
        }
      } catch (e) {
        console.debug('CHECK VERSION ERROR', device.QRCode, e);
      }
    }

    return device;
  }

  async getVNodeInfo(device, skipGetNewKey = false) {
    const { nodeRewards } = this.props;
    const { wallet, committees } = this.props;
    let publicKey = device.PublicKey;
    let blsKey = device.PublicKeyMining;

    if (!skipGetNewKey) {
      const newKey = await VirtualNodeService.getPublicKeyMining(device);
      if (newKey && blsKey !== newKey) {
        blsKey = newKey;
      }
      if (newKey) {
        device.setIsOnline(MAX_RETRY);
      } else {
        device.setIsOnline(Math.max(device.IsOnline - 1, 0));
      }
    }

    if (blsKey) {
      const nodeInfo = (committees.AutoStaking.find(node => node.MiningPubKey.bls === blsKey) || {});
      const isAutoStake = nodeInfo.IsAutoStake;
      const newPublicKey = nodeInfo.IncPubKey;

      if (
        JSON.stringify(committees.ShardPendingValidator).includes(blsKey) ||
        JSON.stringify(committees.CandidateShardWaitingForNextRandom).includes(blsKey) ||
        JSON.stringify(committees.CandidateShardWaitingForCurrentRandom).includes(blsKey)
      ) {
        device.Status = VALIDATOR_STATUS.WAITING;
      } else if (JSON.stringify(committees.ShardCommittee).includes(blsKey)) {
        device.Status = VALIDATOR_STATUS.WORKING;
      } else {
        device.Status = null;
      }

      device.PublicKeyMining = blsKey;
      device.IsAutoStake = isAutoStake;

      if (newPublicKey && newPublicKey !== publicKey) {
        publicKey = newPublicKey;
        device.Account = {};
        device.PublicKey = publicKey;
        device.StakeTx = null;
      }

      const listAccount = await wallet.listAccount();
      const rawAccount = await accountService.getAccountWithBLSPubKey(blsKey, wallet);
      device.Account = listAccount.find(item => item.AccountName === rawAccount?.name);

      if (device.Account) {
        device.ValidatorKey = device.Account.ValidatorKey;
      }
    }

    if (publicKey) {
      device.Rewards = nodeRewards[publicKey] || {};
    }

    if (device.SelfUnstakeTx) {
      console.debug('CHECK UNSTAKE TX STATUS', device.SelfUnstakeTx, device.Name);
      try {
        const res = await getTransactionByHash(device.SelfUnstakeTx);
        console.debug('CHECK UNSTAKE TX STATUS RESPONSE', res, device.Name);

        if (res.isInBlock && !device.IsAutoStake) {
          device.SelfUnstakeTx = null;
        } else if (res.err) {
          if (!_.isNumber(device.SelfUnstakeTxErrorCount)) {
            device.SelfUnstakeTxErrorCount = MAX_ERROR_COUNT;
          }

          if (device.SelfUnstakeTxErrorCount <= 0) {
            device.SelfUnstakeTx = null;
          } else {
            device.SelfUnstakeTxErrorCount = device.SelfUnstakeTxErrorCount - 1;
          }
        }
      } catch {
        device.SelfUnstakeTx = null;
      }
    }


    if (device.SelfStakeTx) {
      console.debug('CHECK STAKE TX STATUS', device.SelfStakeTx, device.Name);
      try {
        const res = await getTransactionByHash(device.SelfStakeTx);
        console.debug('CHECK STAKE TX STATUS RESPONSE', res, device.Name);
        if (res.isInBlock && device.IsAutoStake) {
          device.SelfStakeTx = null;
        } else if (res.err) {
          if (!_.isNumber(device.SelfStakeTxErrorCount)) {
            device.SelfStakeTxErrorCount = MAX_ERROR_COUNT;
          }

          if (device.SelfStakeTxErrorCount <= 0) {
            device.SelfStakeTx = null;
          } else {
            device.SelfStakeTxErrorCount = device.SelfStakeTxErrorCount - 1;
          }
        }
      } catch {
        device.SelfStakeTx = null;
      }
    }

    console.debug('DEVICE', device.SelfStakeTx, device.IsAutoStake);

    return device;
  }

  async getNodeInfo() {
    let { item: device } = this.props;

    if (device.IsVNode) {
      device = await this.getVNodeInfo(device);
    } else {
      device = await this.getPNodeInfo(device);
    }

    if (device.Rewards && Object.keys(device.Rewards).length > 0) {
      Object.keys(device.Rewards).forEach(id => {
        if (device.Rewards[id] === 0) {
          delete device.Rewards[id];
        }
      });
    }

    if (!device.Rewards || Object.keys(device.Rewards).length === 0) {
      device.Rewards = { [PRV_ID]: 0 };
    }

    return device;
  }

  getInfo() {
    const { onGetInfoCompleted, index } = this.props;
    this.setState({ loading: true });
    this.getNodeInfo()
      .then((device) => onGetInfoCompleted({ index, device }))
      .catch(e => {
        new ExHandler(e).showErrorToast(true);
        onGetInfoCompleted({ index });
      })
      .finally(() => this.setState({ loading: false }));
  }

  renderNode() {
    const {
      item,
      allTokens,
      onStake,
      onUnstake,
      onWithdraw,
      onImport,
      isFetching,
      withdrawTxs,
    } = this.props;
    const { loading } = this.state;

    if (item.IsPNode) {
      return (
        <PNode
          item={item}
          allTokens={allTokens}
          onImportAccount={onImport}
          onWithdraw={onWithdraw}
          onUnstake={onUnstake}
          onStake={onStake}
          isFetching={!!isFetching || !!loading}
        />
      );
    }

    return (
      <VNode
        item={item}
        allTokens={allTokens}
        onImportAccount={onImport}
        onStake={onStake}
        onUnstake={onUnstake}
        onWithdraw={onWithdraw}
        isFetching={!!isFetching || !!loading}
        withdrawTxs={withdrawTxs}
      />
    );
  }

  render() {
    const { onRemove, item } = this.props;
    return (
      <Swipeout
        style={[styles.container]}
        right={[{
          text: 'Remove',
          backgroundColor: COLORS.red,
          onPress: () => onRemove(item),
        }]}
      >
        <View style={{ paddingHorizontal: 25 }}>
          {this.renderNode()}
        </View>
      </Swipeout>
    );
  }
}

NodeItem.propTypes = {
  wallet: PropTypes.object.isRequired,
  committees: PropTypes.object.isRequired,
  nodeRewards: PropTypes.object.isRequired,
  allTokens: PropTypes.array.isRequired,
  item: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  onGetInfoCompleted: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onWithdraw: PropTypes.func.isRequired,
  onStake: PropTypes.func.isRequired,
  onUnstake: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  withdrawTxs: PropTypes.object.isRequired,
};

NodeItem.defaultProps = {};

export default NodeItem;
