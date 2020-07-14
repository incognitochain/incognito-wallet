/* eslint-disable react/prop-types */
import accountKey from '@assets/images/icons/account_key.png';
import unfollowTokenIcon from '@assets/images/icons/unfollowToken.png';
import withdrawBlack from '@assets/images/icons/withdraw_black.png';
import { Button, Image, Text, View, TouchableOpacity } from '@components/core';
import Toast from '@components/core/Toast/Toast';
import OptionMenu from '@components/OptionMenu/OptionMenu';
import firmwareIcon from '@src/assets/images/icons/firmware.png';
import moreIcon from '@src/assets/images/icons/more_icon.png';
import { COLORS, FONT } from '@src/styles';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { MESSAGES } from '@src/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LogManager from '@src/services/LogManager';
import Header from '@src/components/Header';
import linkingService from '@src/services/linking';
import Swiper from 'react-native-swiper';
import convert from '@utils/convert';
import theme from '@src/styles/theme';
import Device from '@src/models/device';
import { Platform } from 'react-native';
import BtnInformation from '@src/components/Button/BtnInformation';
import NavigationService from '@src/services/NavigationService';
import routeNames from '@src/router/routeNames';
import BtnMoreInfo from '@src/components/Button/BtnMoreInfo';
import Reward from './Reward';
import styles from './style';

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
  shouldComponentUpdate() {
    return true;
  }

  getRewards = () => {
    const { navigation } = this.props;
    const { params } = navigation.state;
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

    this.setState({ rewards: rewardsList }, () => {
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
 
  renderItemText = (text, value) => {
    return (
      <View style={[styles.balanceContainer, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }]}>
        <Text style={[theme.text.boldTextStyleMedium]}>{text}</Text>
        <Text style={[theme.text.boldTextStyleMedium]}>{value || ''}</Text>
      </View>
    );
  }
  renderStatus = (text, value, color) => {
    const { canDropDown } = this.state;
    return (
      <View style={[styles.balanceContainer, theme.MARGIN.marginBottomDefault, { flexDirection: 'row', justifyContent: 'space-between' }]}>
        <Text style={[theme.text.boldTextStyleMedium]}>{text}</Text>
        <TouchableOpacity
          style={[{ flexDirection: 'row' }, styles.balanceContainer]}
          onPress={() => {
            this.setState({ canDropDown: !canDropDown });
          }}
        >
          <View style={{width: 12, height: 12, marginEnd: 5, borderRadius: 6, backgroundColor: color || 'white'}} />
          <Text style={[theme.text.boldTextStyleMedium, theme.MARGIN.marginRightDefault]}>{value || ''}</Text>
          <Ionicons name={canDropDown ? 'ios-arrow-up' : 'ios-arrow-down'} size={25} color={COLORS.colorPrimary} />
        </TouchableOpacity>
      </View>
    );
  }
  renderOffline = (ip, isVnode) => {
    if (isVnode) {
      return (
        <View style={[theme.MARGIN.marginBottomDefault]}>
          <Text style={[theme.text.regularTextMotto]}>{`1. Make sure your VPS at IP ${ip} is running`}</Text>
          <Text style={[theme.text.regularTextMotto]}>{'2. SSH into your VPS and enter this command “sudo docker ps” to check if “inc_mainnet” and “eth_mainnet” are up. If you don’t see any of them, restart the Node with this command “sudo bash run.sh”. \n\nIf this issue persists, reach out to us at go@incognito.org'}</Text>
        </View>
      );
    } 
    return (
      <View style={[theme.MARGIN.marginBottomDefault]}>
        <Text style={[theme.text.regularTextMotto]}>1. Make sure the blue light is on</Text>
        <Text style={[theme.text.regularTextMotto]}>2. Make sure that your home WiFi is connected</Text>
        <Text style={[theme.text.regularTextMotto]}>3. Power cycle the Node and wait a few minutes</Text>
        <Text style={[theme.text.regularTextMotto]}>{'\nIf this issue persists, reach out to us at go@incognito.org'}</Text>
      </View>
    );
  }
  renderWaiting = () => { 
    return (
      <View style={[theme.MARGIN.marginBottomDefault]}>
        <Text style={[theme.text.regularTextMotto]}>This Node is currently waiting to be selected to produce blocks and earn rewards. All Nodes have an equal chance of selection. Numbers may vary in the short-term, but will even out over time through random uniform distribution.</Text>
        <TouchableOpacity onPress={()=>linkingService.openUrl('https://incognito.org/t/lifecycle-of-a-validator-explanation/957')}>
          <Text style={{color: COLORS.blue6, marginTop: 20}}>{'Learn more about the validator lifecycle here>'}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  renderUnstaking = () => { 
    return (
      <View style={[theme.MARGIN.marginBottomDefault]}>
        <Text style={[theme.text.regularTextMotto]}>This Node will complete the unstaking process the next time it is randomly selected to work. As such, unstaking times will vary. This may take anywhere between 4 hours to 21 days.</Text>
        <TouchableOpacity onPress={()=>linkingService.openUrl('https://incognito.org/t/the-waiting-time-of-unstaking-process/933')}>
          <Text style={{color: COLORS.blue6, marginTop: 20}}>{'Learn more about unstaking here >'}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  renderWorking = () => { 
    return (
      <View style={[theme.MARGIN.marginTopDefault]}>
        <Text style={[theme.text.regularTextMotto]}>This Node is now working to validate transactions, create blocks, and earn rewards. It will continue to work and earn for at least 1 epoch (4 hours).</Text>
        <TouchableOpacity onPress={()=>linkingService.openUrl('https://incognito.org/t/lifecycle-of-a-validator-explanation/957')}>
          <Text style={{color: COLORS.blue6, fontFamily: FONT.NAME.semiBold, marginTop: 20}}>{'Learn more about the validator lifecycle here >'}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  renderUnstake = (onPress) => {
    return (
      <TouchableOpacity style={[theme.MARGIN.marginBottomDefault, {position: 'absolute', bottom: 20, left: 20}]} onPress={onPress}>
        <Text style={[theme.text.mediumTextMotto]}>Unstake this Node</Text>
      </TouchableOpacity>
    );
  }
  renderBtn = (title, onPress) => {
    return (
      <Button onPress={onPress} title={title} buttonStyle={[{ flex: 1, margin: 2 }, theme.BUTTON.BLUE_TYPE]} />
    );
  }
  // Only for test
  getColorStatus = (item) => {
    const isUnstaking = item?.StakerAddress && item?.StakerAddress != '' ? item?.IsUnstaking : (item?.Staked && item?.Unstaking);
    const unstakedPNode = item.Unstaked;
    // Unstaking
    if (isUnstaking) {
      return COLORS.orange;
    }
    
    // Offline
    if (!item?.IsOnline || item?.IsOnline === 0 || (!item.Staked && unstakedPNode)) {
      return COLORS.lightGrey1;
    }
    
    // Online
    if (item?.IsWorking && item?.IsOnline && item?.IsOnline > 0) {
      return COLORS.blue;
    }
    
    // Waiting - Default
    return COLORS.green;
  }

  renderStatusNode = (item) => {
    const isUnstaking = item?.StakerAddress && item?.StakerAddress != '' ? item?.IsUnstaking : (item?.Staked && item?.Unstaking);
    const unstakedPNode = item.Unstaked;
    let isOffline  = (!item?.IsOnline || item?.IsOnline === 0 || (!item.Staked && unstakedPNode));
    const isOnline = (item?.IsWorking && item?.IsOnline && item?.IsOnline > 0);
    const {canDropDown} = this.state;

    const hasStaked = item.Staked;
    const noNeedToShowForUnstaked = item?.IsVNode && !hasStaked || !item?.IsVNode && !hasStaked && unstakedPNode;
    
    if (noNeedToShowForUnstaked) {
      return (
        null
      );
    }
    if (isOffline) {
      return (
        <>
          {this.renderStatus('Status', 'Offline', 'grey')}
          {!canDropDown && this.renderOffline(item?.Host, item?.IsVNode)}
        </>
      );
    }
    if (isOnline) {
      return (
        <>
          {this.renderStatus('Status', 'Working', COLORS.blue)}
          {canDropDown && this.renderWorking(item?.Host, item?.IsVNode)}
        </>
      );
    }
    if (isUnstaking) {
      return (
        <>
          {this.renderStatus('Status', 'Unstaking', 'orange')}
          {canDropDown && this.renderUnstaking()}
        </>
      );
    }
    return (
      <>
        {this.renderStatus('Status', 'Waiting', 'green')}
        {canDropDown && this.renderWaiting()}
      </>
    );
  }
  render() {
    const { navigation } = this.props;
    const { deviceName, ip, withdrawable,
      rewardsList,
      onWithdraw,
      onUnstake,
      onStake,
      item,
      name,
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
    let device = Device.getInstance(item);
    console.log(device.toJSON());
    // const isUnstaking = item?.StakerAddress && item?.StakerAddress != '' ? item?.IsUnstaking : (item?.Staked && item?.Unstaking);
    const unstakedPNode = item.Unstaked;
    const isUnstaking = device.StakerAddress ? device.IsUnstaking : (device.Staked && device.Unstaking);
    return (
      <View style={styles.containerDetail}>
        <Header
          title="Node detail"
          rightHeader={<BtnMoreInfo onPress={()=>NavigationService.navigate(routeNames.NodeItemsHelp)} />}
        />
        <View style={styles.balanceList}>
          <Swiper
            dotStyle={styles.dot}
            activeDotStyle={styles.activeDot}
            showsPagination
            loop={false}
            paginationStyle={{ top: Platform.OS === 'android' ? 50 : 30}}
            horizontal
            removeClippedSubviews={false}
            key={new Date().getTime()}
          >
            {
              rewardsList.map(({ id, pDecimals, balance, symbol, isVerified }) => (
                <Reward
                  key={new Date().getTime()}
                  tokenId={id}
                  containerItemStyle={styles.balanceContainer}
                  balanceStyle={styles.balanceUpdate}
                  pDecimals={pDecimals}
                  symbol={symbol}
                  idDefault
                  balance={balance}
                  isVerified={isVerified}
                />
              ))
            }
          </Swiper>
        </View>
        <View style={[{ flexDirection: 'row' }, theme.MARGIN.marginTopAvg, theme.MARGIN.marginBottomDefault]}>
          {!hasAccount ? this.renderBtn('Import a keychain', () => onImport()) : (
            <>
              {shouldShowWithdraw ? this.renderBtn('Withdraw', () => onWithdraw(device)) : null}
              {stake && !isUnstaking ? this.renderBtn(shouldShowWithdraw ? 'Stake' : 'Stake required', () => onStake(device)) : null}
            </>
          )}
        </View>
        <View style={[theme.MARGIN.marginTopAvg]}>
          {this.renderItemText('Keychain', name)}
          {this.renderItemText('IP', ip)}
          {this.renderStatusNode(device)}
        </View>
        {!stake && hasAccount && !isUnstaking ? this.renderUnstake(() => onUnstake(device)) : null}
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

