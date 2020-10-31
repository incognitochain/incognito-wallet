import { Text, View, TouchableOpacity } from '@components/core';
import PropTypes from 'prop-types';
import React, {memo} from 'react';
import BtnStatus from '@src/components/Button/BtnStatus';
import routeNames from '@src/router/routeNames';
import BtnWithBlur from '@src/components/Button/BtnWithBlur';
import PRVRewards from '@screens/Node/components/PRVRewards';
import { parseNodeRewardsToArray } from '@screens/Node/utils';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import styles, { nodeItemStyle } from './style';

const VNode = memo((props) => {
  const navigation = useNavigation();

  const {
    item,
    allTokens,
    onImportAccount,
    onStake,
    onUnstake,
    onWithdraw,
    withdrawTxs,
    isFetching,
  } = props;

  const labelName   = item?.Name;
  const colorStatus = item?.StatusColor;
  const hasStaked   = item?.IsStaked;
  const hasAccount  = item?.AccountName;

  const renderStatusView = () => {
    if (isFetching) {
      return (
        <View style={nodeItemStyle.btnStyle}>
          <ActivityIndicator size='small' />
        </View>
      );
    }
    return (<BtnStatus backgroundColor={colorStatus} />);
  };

  const renderItemRight = () => {
    return (
      <View style={styles.itemRight}>
        {!hasAccount
          ? <BtnWithBlur text='Import' onPress={onImportAccount} />
          : !hasStaked
            ? <BtnWithBlur text='Stake' onPress={() => onStake(item)} />
            : null}
      </View>
    );
  };

  const onVNodePress = () => {
    navigation.navigate(routeNames.NodeItemDetail,
      {
        allTokens: allTokens,
        onUnstake: onUnstake,
        onWithdraw: onWithdraw,
        onStake: onStake,
        rewardsList: parseNodeRewardsToArray(item?.Rewards, allTokens),
        item: item,
        onImport: onImportAccount,
        withdrawTxs,
      });
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.row}
        onPress={onVNodePress}
      >
        <View>
          <View style={nodeItemStyle.wrapperRaw}>
            {renderStatusView()}
            <Text style={styles.itemLeft} numberOfLines={1} >
              {labelName || '-'}
            </Text>
          </View>
          <View style={{ marginLeft: 30 }}>
            <PRVRewards isDefault item={item} rewards={item.Rewards} />
          </View>
        </View>
        {renderItemRight()}
      </TouchableOpacity>
    </View>
  );

});

VNode.propTypes = {
  item: PropTypes.object.isRequired,
  allTokens: PropTypes.array.isRequired,
  onImportAccount: PropTypes.func.isRequired,
  onStake: PropTypes.func.isRequired,
  onWithdraw: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  onUnstake: PropTypes.func.isRequired,
  withdrawTxs: PropTypes.object.isRequired,
};

export default VNode;

