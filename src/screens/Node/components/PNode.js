import { Text, TouchableOpacity, View } from '@components/core';
import PropTypes from 'prop-types';
import React from 'react';
import BtnStatus from '@src/components/Button/BtnStatus';
import BtnWithBlur from '@src/components/Button/BtnWithBlur';
import NavigationService from '@src/services/NavigationService';
import routeNames from '@src/router/routeNames';
import PRVRewards from '@screens/Node/components/PRVRewards';
import { parseNodeRewardsToArray } from '@screens/Node/utils';
import styles, {nodeItemStyle} from './style';
import Loader from './Loader';

class PNode extends React.Component {
  render() {
    const {
      item,
      isFetching,
      allTokens,
      onImportAccount,
      onStake,
      onUnstake,
      onWithdraw,
    } = this.props;

    const labelName     = item.Name;
    const unstakedPNode = item.IsFundedUnstaked;
    const hasStaked     = item.IsStaked;
    const hasAccount    = item?.AccountName;
    const colorStatus   = item.StatusColor;

    return (
      <View>
        {isFetching ? <Loader /> : (
          <>
            <TouchableOpacity
              style={[styles.row]}
              onPress={() => NavigationService.navigate(routeNames.NodeItemDetail,
                {
                  allTokens: allTokens,
                  onUnstake: onUnstake,
                  onWithdraw: onWithdraw,
                  colorStatus: colorStatus,
                  onStake: onStake,
                  item: item,
                  rewardsList: parseNodeRewardsToArray(item?.Rewards || [], allTokens),
                  onImport: onImportAccount,
                })}
            >
              <View>
                <View style={nodeItemStyle.wrapperRaw}>
                  <BtnStatus backgroundColor={colorStatus} />
                  <Text style={[styles.itemLeft]} numberOfLines={1}>{labelName || '-'}</Text>
                </View>
                <View style={{marginLeft: 30}}>
                  <PRVRewards isDefault item={item} rewards={item.Rewards} />
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
  onImportAccount: PropTypes.func.isRequired,
  onStake: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

export default PNode;

