/* eslint-disable react/prop-types */
import { Text, View, TouchableOpacity, ScrollView, RoundCornerButton } from '@components/core';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Header from '@src/components/Header';
import theme from '@src/styles/theme';
import NavigationService from '@src/services/NavigationService';
import routeNames from '@src/router/routeNames';
import BtnMoreInfo from '@src/components/Button/BtnMoreInfo';
import NodeStatus from '@screens/Node/components/NodeStatus';
import Rewards from '@screens/Node/components/Rewards';
import styles from './style';

class NodeItemDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
    };
  }

  handleWithdraw = async () => {
    const { navigation } = this.props;
    const {
      item,
      onWithdraw
    } = navigation.state.params;
    try {
      this.setState({ processing: true });
      await onWithdraw(item);
    } catch {
      this.setState({ processing: false });
    }
  };

  renderItemText = (text, value) => {
    return (
      <View style={[styles.balanceContainer, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }]}>
        <Text style={[theme.text.boldTextStyleMedium]}>{text}</Text>
        <Text style={[theme.text.boldTextStyleMedium, { maxWidth: 200 }]} numberOfLines={1}>{value || ''}</Text>
      </View>
    );
  };

  renderUnstake = (onPress) => {
    return (
      <TouchableOpacity style={{ marginBottom: 30 }} onPress={onPress}>
        <Text style={[styles.text, styles.bold, styles.bigText]}>Unstake this Node</Text>
      </TouchableOpacity>
    );
  };

  renderNodeSettings = () => {
    const { navigation } = this.props;
    const {
      item,
    } = navigation.state.params;
    return (
      <TouchableOpacity
        onPress={() => NavigationService.navigate(routeNames.NodeUpdateWifi, { device: item })}
      >
        <Text style={[styles.text, styles.bold, styles.bigText]}>Change Wi-Fi</Text>
      </TouchableOpacity>
    );
  };

  renderBtn = (title, onPress, disabled = false) => {
    return (
      <RoundCornerButton
        disabled={disabled}
        onPress={onPress}
        title={title}
        style={[{ flex: 1, margin: 2 }, theme.BUTTON.BLUE_TYPE]}
      />
    );
  };

  renderRewards = () => {
    const { navigation } = this.props;
    const { rewardsList } = navigation.state.params;
    if (rewardsList && rewardsList.length > 0) {
      return (<Rewards rewards={rewardsList} />);
    }
    return null;
  };

  render() {
    const { navigation } = this.props;
    const { processing } = this.state;
    const {
      onUnstake,
      onStake,
      item,
      onImport,
      withdrawTxs,
      rewardsList
    } = navigation.state.params;

    const ip         = item.Host;
    const name       = item.Name;
    const hasAccount = !!item?.AccountName;

    let shouldShowWithdraw = false;

    if (rewardsList && rewardsList.length > 0) {
      rewardsList.forEach(element => {
        if (element?.balance > 0) {
          shouldShowWithdraw = true;
        }
      });
    }

    const shouldRenderUnstake = item.IsUnstakable;
    let withdrawable;

    if (item.IsPNode && !item.IsFundedUnstaked && !item.IsFundedUnstaking) {
      withdrawable = !processing && item.IsFundedStakeWithdrawable;
    } else {
      withdrawable = !(processing || !!_.get(withdrawTxs, item.PaymentAddress));
    }

    if (item.IsPNode && item.IsFundedUnstaking) {
      shouldShowWithdraw = false;
    }

    const shouldShowStake = item.IsUnstaked && !item.IsUnstaking;

    return (
      <View style={styles.containerDetail}>
        <Header
          title="Node details"
          rightHeader={<BtnMoreInfo onPress={()=>NavigationService.navigate(routeNames.NodeItemsHelp)} />}
        />
        <ScrollView>
          {this.renderRewards()}
          <View style={[{ flexDirection: 'row' }, theme.MARGIN.marginBottomDefault]}>
            {!hasAccount ? this.renderBtn('Import a keychain', onImport) : (
              <>
                {shouldShowStake && shouldShowWithdraw ? this.renderBtn(processing || !withdrawable ? 'Withdrawing...' : 'Withdraw', this.handleWithdraw, !withdrawable) : null}
                {!shouldShowStake && shouldShowWithdraw ? this.renderBtn(processing || !withdrawable ? 'Withdrawing rewards...' : 'Withdraw rewards', this.handleWithdraw, !withdrawable) : null}
                {shouldShowStake ? this.renderBtn(shouldShowWithdraw ? 'Stake' : 'Stake required', () => onStake(item)) : null}
              </>
            )}
          </View>
          <View style={{ marginTop: 50 }}>
            {this.renderItemText('Keychain', name)}
            {this.renderItemText('IP', ip)}
            { item.IsPNode && this.renderItemText('Version', item.Firmware) }
            <NodeStatus item={item} />
          </View>
          {(!!shouldRenderUnstake || !!item.IsPNode) && (
            <View style={{ marginTop: 50 }}>
              {!!shouldRenderUnstake && this.renderUnstake(() => onUnstake(item))}
              {!!item.IsPNode && (global.isDebug() || !!item.AccountName) && this.renderNodeSettings()}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

NodeItemDetail.propTypes = {
  item: PropTypes.object.isRequired,
  onWithdraw: PropTypes.func.isRequired,
  onUnstake: PropTypes.func.isRequired,
  onStake: PropTypes.func.isRequired,
  rewardsList: PropTypes.array.isRequired,
};

export default NodeItemDetail;

