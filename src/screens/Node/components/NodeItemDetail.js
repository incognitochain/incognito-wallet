/* eslint-disable react/prop-types */
import accountKey from '@assets/images/icons/account_key.png';
import unfollowTokenIcon from '@assets/images/icons/unfollowToken.png';
import withdrawBlack from '@assets/images/icons/withdraw_black.png';
import { Button, Image, Text, View, TouchableOpacity } from '@components/core';
import Toast from '@components/core/Toast/Toast';
import OptionMenu from '@components/OptionMenu/OptionMenu';
import firmwareIcon from '@src/assets/images/icons/firmware.png';
import moreIcon from '@src/assets/images/icons/more_icon.png';
import { COLORS } from '@src/styles';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { MESSAGES } from '@src/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LogManager from '@src/services/LogManager';
import Header from '@src/components/Header';
import Swiper from 'react-native-swiper';
import convert from '@utils/convert';
import theme from '@src/styles/theme';
import Device from '@src/models/device';
import styles from './style';
import Reward from './Reward';

class NodeItemDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUpdateFirmware: false,
      rewards: [],
      canDropDown: false,
    };
  }
  componentDidMount = () => {
    this.getRewards(); 
  }
  shouldComponentUpdate(){
    return true;
  }

  getRewards = () => {
    const {navigation} = this.props;
    const {params} = navigation.state;
    const { allTokens, rewards } = params;
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
    
    this.setState({ rewards: rewardsList }, ()=>{
    });

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
    const isUnstaking = item?.StakerAddress ? item?.IsUnstaking : (item?.Staked && item?.Unstaking);
    // Unstaking
    if (isUnstaking) {
      return COLORS.orange;
    }
    // Online
    if (item?.IsWorking) {
      return COLORS.blue4;
    }
    // Offline
    if (!item?.IsOnline) {
      return COLORS.lightGrey1;
    }
    // Waiting - Default
    return COLORS.green;
  }

  renderItemText = (text, value) => {
    return (
      <View style={[styles.balanceContainer, theme.MARGIN.marginBottomDefault, {flexDirection: 'row', justifyContent: 'space-between'}]}>
        <Text style={[theme.text.boldTextStyleMedium]}>{text}</Text>
        <Text style={[theme.text.boldTextStyleMedium]}>{value || ''}</Text>
      </View>
    );
  }
  renderStatus = (text, value) => {
    const { canDropDown } = this.state;
    return (
      <View style={[styles.balanceContainer, theme.MARGIN.marginBottomDefault, {flexDirection: 'row', justifyContent: 'space-between'}]}>
        <Text style={[theme.text.boldTextStyleMedium]}>{text}</Text>
        <TouchableOpacity
          style={[{ flexDirection: 'row'}, styles.balanceContainer]}
          onPress={() => {
            this.setState({ canDropDown: !canDropDown });
          }}
        >
          <Text style={[theme.text.boldTextStyleMedium, theme.MARGIN.marginRightDefault]}>{value || ''}</Text>
          <Ionicons name={canDropDown ? 'ios-arrow-up' : 'ios-arrow-down'} size={25} color={COLORS.colorPrimary} />
        </TouchableOpacity>
      </View>
    );
  }
  renderHint = (ip) => {
    return (
      <View style={[theme.MARGIN.marginBottomDefault]}>
        <Text style={[theme.text.regularTextMotto]}>{`1. Make sure your VPS at IP ${ip} is running`}</Text>
        <Text style={[theme.text.regularTextMotto]}>{'2. Ssh into your VPS and run \'sudo docker ps\' to check if docker is running'}</Text>
      </View>
    );
  }
  renderUnstake = (onPress) => {
    return (
      <TouchableOpacity style={[theme.MARGIN.marginBottomDefault]} onPress={onPress}>
        <Text style={[theme.text.mediumTextMotto]}>Unstake this Node</Text>
      </TouchableOpacity>
    );
  }
  renderBtn = (title, onPress) => {
    return (
      <Button onPress={onPress} title={title} buttonStyle={[{ flex: 1, margin: 2 }, theme.BUTTON.BLUE_TYPE]} />
    );
  }
  render() {
    const { navigation } = this.props;
    const { deviceName, ip, withdrawable,
      onWithdraw,
      onUnstake,
      onStake,
      item,
      hasAccount,
      stake,
      onImport,
      isOffline } = navigation.state.params;
      
    let { rewards, canDropDown } = this.state;
    let shouldShowWithdraw = false;
    rewards.forEach(element => {
      if (element?.balance > 0) {
        shouldShowWithdraw = true;
      }
    });
    return (
      <View style={styles.containerDetail}>
        <Header
          title="Node detail"
        />
        <View style={{ width: '100%', marginTop: 30, height: 70 }}>
          <Swiper
            dotStyle={styles.dot}
            activeDotStyle={styles.activeDot}
            showsPagination
            loop
            horizontal
            key={`${new Date().getTime()}`}
          >
            {
              (rewards).map(({ id, pDecimals, balance, symbol, isVerified }) => (
                <Reward
                  key={`${new Date().getTime()}`}
                  tokenId={id}
                  containerItemStyle={styles.balanceContainer}
                  balanceStyle={styles.balanceUpdate}
                  pDecimals={pDecimals}
                  symbol={symbol}
                  balance={balance}
                  isVerified={isVerified}
                />
              ))
            }
          </Swiper>
        </View>
        <View style={[{ flexDirection: 'row' }, theme.MARGIN.marginTopAvg, theme.MARGIN.marginBottomDefault]}>
          {shouldShowWithdraw ? this.renderBtn('Withdraw', ()=>onWithdraw(Device.getInstance(item))) : null}
          {!hasAccount ? this.renderBtn('Import a keychain', ()=>onImport()) : 
            stake? this.renderBtn('Stake', ()=>onStake(Device.getInstance(item))) : this.renderBtn('Stake required', ()=>onStake(Device.getInstance(item)))}
        </View>
        <View style={[theme.MARGIN.marginTopAvg]}>
          {this.renderItemText('Keychain', deviceName)}
          {this.renderItemText('IP', ip)}
          {isOffline ? this.renderStatus('Status', 'Offline') : null}
          {isOffline && canDropDown ? this.renderHint(ip) : null}
          {stake ? this.renderUnstake(()=>onUnstake(item)) : null}
        </View>
      </View>
    );
  }
}

NodeItemDetail.propTypes = {
  item: PropTypes.object.isRequired,
  allTokens: PropTypes.array.isRequired,
  onWithdraw: PropTypes.func.isRequired,
  onUnstake: PropTypes.func.isRequired,
  onRemoveDevice: PropTypes.func.isRequired,
  onImportAccount: PropTypes.func.isRequired,
  onStake: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

export default NodeItemDetail;

