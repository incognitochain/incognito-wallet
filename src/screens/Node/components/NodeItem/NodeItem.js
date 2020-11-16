import React, { memo } from 'react';
import { View } from 'react-native';
import { withNodeItemEnhance } from '@screens/Node/components/NodeItem';
import styles from '@screens/Node/components/style';
import { COLORS } from '@src/styles';
import Swipeout from 'react-native-swipeout';
import PropTypes from 'prop-types';
import PNode from '@screens/Node/components/PNode';
import VNode from '@screens/Node/components/VNode';
import string from '@src/constants/string';

const NodeItem = (props) => {
  const {
    item,
    loading,
    withdrawTxs,

    // Actions
    onStake,
    onUnstake,
    onRemove,
    onImport,
    onWithdraw,
  } = props;

  const renderNode = () => {
    if (item.IsPNode) {
      return (
        <PNode
          item={item}
          isFetching={loading}
          onImportAccount={onImport}
          onUnstake={onUnstake}
          onStake={onStake}
          onWithdraw={onWithdraw}
          withdrawTxs={withdrawTxs}
        />
      );
    }

    return (
      <VNode
        item={item}
        isFetching={loading}
        onImportAccount={onImport}
        onStake={onStake}
        onUnstake={onUnstake}
        onWithdraw={onWithdraw}
        withdrawTxs={withdrawTxs}
      />
    );
  };

  return (
    <Swipeout
      style={styles.container}
      right={[{
        text: string.remove,
        backgroundColor: COLORS.red,
        onPress: () => onRemove(item),
      }]}
    >
      <View style={{ paddingHorizontal: 25 }}>
        {renderNode()}
      </View>
    </Swipeout>
  );
};

NodeItem.propTypes = {
  item:         PropTypes.object.isRequired,
  loading:      PropTypes.bool.isRequired,
  onImport:     PropTypes.func.isRequired,
  onStake:      PropTypes.func.isRequired,
  onUnstake:    PropTypes.func.isRequired,
  onRemove:     PropTypes.func.isRequired,
  onWithdraw:   PropTypes.func.isRequired,
  withdrawTxs:  PropTypes.object.isRequired,
};


export default withNodeItemEnhance(memo(NodeItem));