import accountKey from '@assets/images/icons/account_key.png';
import unfollowTokenIcon from '@assets/images/icons/unfollowToken.png';
import withdrawBlack from '@assets/images/icons/withdraw_black.png';
import { ActivityIndicator, Button, Image, Text, TouchableOpacity, View } from '@components/core';
import Toast from '@components/core/Toast/Toast';
import OptionMenu from '@components/OptionMenu/OptionMenu';
import firmwareIcon from '@src/assets/images/icons/firmware.png';
import convert from '@utils/convert';
import moreIcon from '@src/assets/images/icons/more_icon.png';
import { COLORS } from '@src/styles';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { MESSAGES } from '@src/constants';
import BtnStatus from '@src/components/Button/BtnStatus';
import BtnWithBlur from '@src/components/Button/BtnWithBlur';
import NavigationService from '@src/services/NavigationService';
import routeNames from '@src/router/routeNames';
import styles from './style';
import Rewards from './Rewards';
import Loader from './Loader';

class PNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showUpdateFirmware: false,
    };
    this.removeDevice = _.debounce(props.onRemoveDevice, 100);

  }
  componentDidMount() {
  }

  getDescriptionStatus = () => {
    const { item, isFetching, onImportAccount, onStake } = this.props;

    if (isFetching) {
      return null;
    }

    const account = item.AccountName;
    let text = `Account: ${account}`;

    if (!account) {
      return (
        <View style={[styles.row, styles.desc, styles.centerAlign]}>
          <View style={[styles.row, styles.centerAlign]}>
            <Image source={accountKey} style={[styles.icon, styles.disabled]} />
            <Text style={styles.greyText}>{MESSAGES.ACCOUNT_NOT_FOUND}</Text>
          </View>
          <View style={styles.itemRight}>
            <Button
              title="Import"
              buttonStyle={styles.stakeButton}
              onPress={onImportAccount}
            />
          </View>
        </View>
      );
    }

    const isUnstaking = item.StakerAddress ? item.IsUnstaking : (item.Staked && item.Unstaking);
    if (isUnstaking) {
      return (
        <View style={styles.row}>
          <Text style={[styles.desc]}>{text} ({MESSAGES.UNSTAKING})</Text>
        </View>
      );
    }


    const unstakedPNode = item.Unstaked;
    const hasStaked = item.Staked;

    if (!hasStaked && unstakedPNode) {
      return (
        <View style={[styles.row, styles.desc, styles.centerAlign]}>
          <View style={[styles.row, styles.centerAlign]}>
            <Image source={accountKey} style={[styles.icon]} />
            <Text>{text}</Text>
          </View>
          <View style={styles.itemRight}>
            <Button title="Stake" buttonStyle={styles.stakeButton} onPress={() => onStake(item)} />
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.row, styles.centerAlign, styles.desc]}>
        <Image source={accountKey} style={[styles.icon]} />
        <Text>{text}</Text>
      </View>
    );
  };

  showIp = () => {
    const { item } = this.props;
    Toast.showInfo(item.Host);
  };

  renderMenu() {
    const { isFetching, item, onWithdraw, onUnstake } = this.props;
    const menu = [];

    if (isFetching) {
      return null;
    }

    menu.push({
      id: 'update',
      icon: <Image source={firmwareIcon} style={{ width: 25, height: 25, resizeMode: 'contain' }} />,
      label: (
        <View style={styles.withdrawMenuItem}>
          <Text style={styles.withdrawText}>Update firmware</Text>
        </View>
      ),
      desc: 'Get Node perform better',
      handlePress: null,
    });

    if (global.isDebug()) {
      menu.push({
        id: 'delete',
        icon: <Image source={unfollowTokenIcon} style={{ width: 25, height: 25, resizeMode: 'contain' }} />,
        label: 'Remove physical node',
        desc: 'Remove this node from your display.',
        handlePress: () => this.removeDevice(item),
      });
    }

    const rewards = item.Rewards;
    const pendingWithdraw = !item.IsWithdrawable;
    const isEmptyRewards = _.isEmpty(rewards) || !_.some(rewards, value => value > 0);
    let onClick = () => onWithdraw(item);
    let label = 'Withdraw earnings';
    let desc = 'Withdraw your rewards';
    if (pendingWithdraw || isEmptyRewards) {
      if (pendingWithdraw) {
        desc = 'This might take up to 24 hours';
      }
      onClick = null;
      label = (
        <View style={styles.withdrawMenuItem}>
          <Text style={styles.withdrawText}>{pendingWithdraw ? 'Withdrawal in process' : 'Withdraw earnings'}</Text>
        </View>
      );
    }

    menu.push({
      id: 'withdraw',
      icon: <Image source={withdrawBlack} style={{ width: 25, height: 25, resizeMode: 'contain' }} />,
      label: label,
      desc: desc,
      handlePress: onClick,
    });

    if (item.Account && !item.IsUnstaking && (item.StakerAddress || (item.Staked && item.IsAutoStake))) {
      menu.push({
        id: MESSAGES.PNODE_UNSTAKE_LABEL,
        icon: <Image source={withdrawBlack} style={{ width: 25, height: 25, resizeMode: 'contain' }} />,
        label: MESSAGES.PNODE_UNSTAKE_LABEL,
        desc: MESSAGES.PNODE_UNSTAKE_DESC,
        handlePress: () => onUnstake(item),
      });
    }

    return <OptionMenu data={menu} icon={<Image source={moreIcon} />} />;
  }
  // Only for test
  getColorStatus = (item) => {
    const isUnstaking = item?.StakerAddress && item?.StakerAddress != '' ? item?.IsUnstaking : (item?.Staked && item?.Unstaking);
    // Unstaking
    if (isUnstaking) {
      return COLORS.orange;
    }
    // Online
    if (item?.IsOnline && item?.IsWorking) {
      return COLORS.blue4;
    }
    // Offline
    if (!item?.IsOnline) {
      return COLORS.lightGrey1;
    }
    // Waiting - Default
    return COLORS.green;
  }

  getRewards = (rewards, allTokens) => {
    var rewardsList = [];
    const data = (_(Object.keys(rewards)) || [])
      .map(id => {
        const value = rewards[id];
        const token = allTokens.find(token => token.id === id) || {};
        return token && { ...token, balance: value, displayBalance: convert.toHumanAmount(value, token.pDecimals) };
      })
      .value();

    // Push to reward list
    data.forEach((element) => {
      let currentTokenExistingIndex = rewardsList?.map(function (e) { return e?.id; }).indexOf(element?.id);
      if (currentTokenExistingIndex === -1) {
        rewardsList.push(element);
      } else {
        let currentBalance = rewardsList[currentTokenExistingIndex].balance || 0;
        currentBalance = currentBalance + (element?.balance || 0);
        rewardsList[currentTokenExistingIndex].displayBalance = convert.toHumanAmount(currentBalance, element?.pDecimals || 0);
      }
    });
    return rewardsList;

  }

  render() {
    const { item, isFetching, allTokens, onImportAccount, onStake, onUnstake, onWithdraw } = this.props;
    const labelName = item.Name;

    // Check if device is unstaking, need to stake
    const unstakedPNode = item.Unstaked;

    const hasStaked = item.Staked;

    // Check account not imported
    const hasAccount = item?.AccountName;

    return (
      <View style={styles.container}>
        {isFetching ? <Loader /> : (
          <>
            <TouchableOpacity
              style={[styles.row]}
              onPress={() => NavigationService.navigate(routeNames.NodeItemDetail,
                {
                  stake: !hasStaked && unstakedPNode,
                  hasAccount: hasAccount,
                  allTokens: allTokens,
                  deviceName: item.Name,
                  ip: item.Host,
                  rewards: item.Rewards,
                  onUnstake: onUnstake,
                  onWithdraw: onWithdraw,
                  onStake: onStake,
                  item: item,
                  rewardsList: this.getRewards(item?.Rewards, allTokens),
                  isUnstaking: item?.StakerAddress && item?.StakerAddress != '' ? item?.IsUnstaking : (item?.Staked && item?.Unstaking),
                  withdrawable: item?.IsOnline && item?.IsWorking,
                  isOffline: !item?.IsOnline,
                  onImport: onImportAccount,
                })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ height: 20, justifyContent: 'center' }}>
                  <BtnStatus backgroundColor={this.getColorStatus(item)} />
                </View>
                <View>
                  <Text style={[styles.itemLeft]}>Node {labelName || '-'}</Text>
                  {isFetching ? <ActivityIndicator size="large" /> : <Rewards isDefault item={item} rewards={item.Rewards} allTokens={allTokens} />}
                </View>
              </View>
              <View style={styles.itemRight}>
                {!hasAccount ? <BtnWithBlur text='Import' onPress={onImportAccount} /> :
                  (!hasStaked && unstakedPNode) ? <BtnWithBlur text='Stake' onPress={() => onStake(item)} /> : null}
              </View>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }
}

PNode.propTypes = {
  item: PropTypes.object.isRequired,
  allTokens: PropTypes.array.isRequired,
  onWithdraw: PropTypes.func.isRequired,
  onUnstake: PropTypes.func.isRequired,
  onRemoveDevice: PropTypes.func.isRequired,
  onImportAccount: PropTypes.func.isRequired,
  onStake: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

export default PNode;

