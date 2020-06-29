import withdrawBlack from '@assets/images/icons/withdraw_black.png';
import { ActivityIndicator, Button, Image, Text, View, TouchableOpacity } from '@components/core';
import OptionMenu from '@components/OptionMenu/OptionMenu';
import FixModal from '@screens/Node/components/FixModal';
import accountKey from '@src/assets/images/icons/account_key.png';
import moreIcon from '@src/assets/images/icons/more_icon.png';
import wifiOffline from '@src/assets/images/icons/offline_wifi_icon.png';
import wifiOnline from '@src/assets/images/icons/online_wifi_icon.png';
import unfollowTokenIcon from '@src/assets/images/icons/unfollowToken.png';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import BtnStatus from '@src/components/Button/BtnStatus';
import NavigationService from '@src/services/NavigationService';
import routeNames from '@src/router/routeNames';
import BtnWithBlur from '@src/components/Button/BtnWithBlur';
import { COLORS } from '@src/styles';
import convert from '@src/utils/convert';
import styles from './style';
import Rewards from './Rewards';
import Loader from './Loader';

const MESSAGES = {
  ACCOUNT_NOT_FOUND: 'Missing account',
  STAKE_REQUIRED: 'Stake required',
  UNSTAKING: 'unstaking in process',
};

class VNode extends React.Component {
  constructor(props) {
    super(props);
    this.removeDevice = _.debounce(props.onRemoveDevice, 100);
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
  getDescriptionStatus = () => {
    const { item, isFetching, onStake, onImportAccount } = this.props;

    if (isFetching) {
      return null;
    }

    const account = item.AccountName;
    const isUnstaking = item.Unstaking;
    const hasStaked = item.Staked;
    let text = `Acc: ${account}`;

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
    } else if (isUnstaking) {
      return (
        <View style={styles.row}>
          <Text style={styles.desc}>{text} ({MESSAGES.UNSTAKING})</Text>
        </View>
      );
    } else if (!hasStaked) {
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

  renderMenu() {
    const menu = [];
    const { item, onUnstake, isFetching, onWithdraw } = this.props;

    if (isFetching) {
      return null;
    }

    const hasAccount = !!item.AccountName;

    menu.push({
      id: 'delete',
      icon: <Image source={unfollowTokenIcon} style={{ width: 25, height: 25, resizeMode: 'contain' }} />,
      label: 'Remove virtual node',
      desc: 'Remove this node from your display',
      handlePress: () => this.removeDevice(item),
    });

    if (item.Staked && !item.Unstaking && item.AccountName) {
      menu.push({
        id: 'unstake',
        icon: <Image source={withdrawBlack} style={{ width: 25, height: 25, resizeMode: 'contain' }} />,
        label: 'Unstake',
        desc: 'Stop staking and withdraw staked amount',
        handlePress: () => onUnstake(item),
      });
    }

    if (!isFetching && hasAccount) {
      const rewards = item.Rewards;
      const isEmptyRewards = _.isEmpty(rewards) || !_.some(rewards, value => value > 0);
      let onClick = () => onWithdraw(item);
      let label = 'Withdraw earnings';
      let desc = 'Withdraw your rewards';

      if (isEmptyRewards) {
        onClick = null;

        label = (
          <View style={styles.withdrawMenuItem}>
            <Text style={styles.withdrawText}>Withdraw earnings</Text>
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
    }

    return <OptionMenu data={menu} icon={<Image source={moreIcon} />} />;
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
    const { item, allTokens, isFetching, onImportAccount, onStake, onUnstake, onWithdraw, onImport } = this.props;
    const labelName = item.Name;
    // Check if device is unstaking, need to stake
    const hasStaked = item?.Staked;

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
                  stake: !hasStaked, 
                  hasAccount: hasAccount, 
                  allTokens: allTokens, 
                  deviceName: item.Name, 
                  ip: item.Host, 
                  rewards: item.Rewards, 
                  onUnstake: onUnstake, 
                  onWithdraw: onWithdraw,
                  onStake: onStake,
                  rewardsList: this.getRewards(item?.Rewards, allTokens),
                  item: item?.toJSON(),
                  onImport: onImportAccount,
                  isUnstaking: item?.StakerAddress && item?.StakerAddress != '' ? item?.IsUnstaking : (item?.Staked && item?.Unstaking),
                  withdrawable: item?.IsOnline && item?.IsWorking,
                  isOffline: !item?.IsOnline,
                })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <BtnStatus backgroundColor={this.getColorStatus(item)} />
                <View>
                  <Text style={[styles.itemLeft]}>Node {labelName || '-'}</Text>
                  {isFetching ? <ActivityIndicator size="large" /> : <Rewards isDefault item={item} rewards={item.Rewards} allTokens={allTokens} />}
                </View>
              </View>
              <View style={styles.itemRight}>
                {!hasAccount ? <BtnWithBlur text='Import' onPress={onImportAccount} /> :
                  !hasStaked ? <BtnWithBlur text='Stake' onPress={() => onStake(item)} /> : null}
              </View>
            </TouchableOpacity>
          </>
        )
        }
      </View>
    );
  }

}

VNode.propTypes = {
  item: PropTypes.object.isRequired,
  allTokens: PropTypes.array.isRequired,
  onRemoveDevice: PropTypes.func.isRequired,
  onImportAccount: PropTypes.func.isRequired,
  onStake: PropTypes.func.isRequired,
  onWithdraw: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  onUnstake: PropTypes.func.isRequired,
};

export default VNode;

