import React, { memo } from 'react';
import withEnhance from '@screens/Node/components/NodeItemDetail/NodeItemDetail.enhance';
import PropTypes from 'prop-types';
import styles from '@screens/Node/components/style';
import Header from '@components/Header';
import BtnMoreInfo from '@components/Button/BtnMoreInfo';
import Rewards from '@screens/Node/components/Rewards';
import {
  Text,
  View,
  ScrollView,
  RoundCornerButton,
  TouchableOpacity,
} from '@components/core';
import { RefreshControl } from 'react-native';
import theme from '@src/styles/theme';
import NodeStatus from '@screens/Node/components/NodeStatus';

const NodeItemDetail = memo(({
  isLoading,
  item,
  rewardsList,
  name,
  ip,
  hasAccount,
  shouldShowStake,
  shouldShowWithdraw,
  processing,
  withdrawable,
  shouldRenderUnstake,

  onHelpPress,
  onImportAccountPress,
  onWithdrawPress,
  onStakePress,
  onChangeWifiPress,
  onUnStakePress,
  onRefresh
}) => {

  const renderRewards = () => {
    if (rewardsList && rewardsList.length > 0) {
      return (<Rewards rewards={rewardsList} />);
    }
    return null;
  };

  const renderBtn = (title, onPress, disabled = false) => {
    return (
      <RoundCornerButton
        disabled={disabled}
        onPress={onPress}
        title={title}
        style={[{ flex: 1, margin: 2 }, theme.BUTTON.BLUE_TYPE]}
      />
    );
  };

  const renderButton = () => (
    <View style={[{ flexDirection: 'row' }, theme.MARGIN.marginBottomDefault]}>
      {!hasAccount ? renderBtn('Import a keychain', onImportAccountPress) : (
        <>
          {
            shouldShowStake
            && shouldShowWithdraw
              ? renderBtn(processing || !withdrawable
                ? 'Withdrawing...'
                : 'Withdraw', onWithdrawPress, !withdrawable)
              : null
          }
          {
            !shouldShowStake
            && shouldShowWithdraw
              ? renderBtn(processing || !withdrawable
                ? 'Withdrawing rewards...'
                : 'Withdraw rewards', onWithdrawPress, !withdrawable)
              : null
          }
          {
            shouldShowStake
              ? renderBtn(shouldShowWithdraw
                ? 'Stake'
                : 'Stake required', onStakePress)
              : null
          }
        </>
      )}
    </View>
  );

  const renderItemText = (text, value) => {
    return (
      <View style={[styles.balanceContainer, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }]}>
        <Text style={[theme.text.boldTextStyleMedium]}>{text}</Text>
        <Text style={[theme.text.boldTextStyleMedium, { maxWidth: 200 }]} numberOfLines={1}>{value || ''}</Text>
      </View>
    );
  };

  const renderNodeSettings = () => {
    return (
      <TouchableOpacity
        onPress={onChangeWifiPress}
      >
        <Text style={[styles.text, styles.bold, styles.bigText]}>
          Change Wi-Fi
        </Text>
      </TouchableOpacity>
    );
  };

  const renderUnstake = (onPress) => {
    return (
      <TouchableOpacity style={{ marginBottom: 30 }} onPress={onPress}>
        <Text style={[styles.text, styles.bold, styles.bigText]}>
          Unstake this Node
        </Text>
      </TouchableOpacity>
    );
  };

  const renderStakeInfo = () => (
    <>
      {(!!shouldRenderUnstake || !!item?.IsPNode) && (
        <View style={{ marginTop: 50 }}>
          {
            !!shouldRenderUnstake
            && renderUnstake(onUnStakePress)
          }
          {
            !!item?.IsPNode
            && (global.isDebug() || !!item?.AccountName)
            && renderNodeSettings()
          }
        </View>
      )}
    </>
  );

  const renderRefreshControl = () => (
    <RefreshControl
      refreshing={isLoading}
      onRefresh={onRefresh}
    />
  );

  return (
    <View style={styles.containerDetail}>
      <Header
        title="Node details"
        rightHeader={<BtnMoreInfo onPress={onHelpPress} />}
      />
      <ScrollView
        refreshControl={renderRefreshControl()}
      >
        {renderRewards()}
        {renderButton()}
        <View style={{ marginTop: 50 }}>
          {renderItemText('Keychain', name)}
          {renderItemText('IP', ip)}
          { item?.IsPNode && renderItemText('Version', item?.Firmware) }
          { !!item && (<NodeStatus isLoading={isLoading} item={item} />) }
        </View>
        {renderStakeInfo()}
      </ScrollView>
    </View>
  );
});

NodeItemDetail.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  ip: PropTypes.string.isRequired,
  rewardsList: PropTypes.array.isRequired,
  hasAccount: PropTypes.bool.isRequired,
  shouldShowStake: PropTypes.bool.isRequired,
  shouldShowWithdraw: PropTypes.bool.isRequired,
  processing: PropTypes.bool.isRequired,
  withdrawable: PropTypes.bool.isRequired,
  shouldRenderUnstake: PropTypes.bool.isRequired,
  onHelpPress: PropTypes.func.isRequired,
  onImportAccountPress: PropTypes.func.isRequired,
  onWithdrawPress: PropTypes.func.isRequired,
  onStakePress: PropTypes.func.isRequired,
  onChangeWifiPress: PropTypes.func.isRequired,
  onUnStakePress: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default withEnhance(NodeItemDetail);