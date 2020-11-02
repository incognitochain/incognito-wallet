import React, {memo} from 'react';
import { FlatList, View } from 'react-native';
import nodeEnhance from '@screens/Node/Node.enhance';
import DialogLoader from '@components/DialogLoader';
import PropTypes from 'prop-types';
import style from '@screens/Node/style';
import ModalMissingSetup from '@screens/Node/components/ModalMissingSetup/ModalMissingSetup';
import WelcomeFirstTime from '@screens/Node/components/WelcomeFirstTime';
import WelcomeNodes from '@screens/Node/components/Welcome';
import { isEmpty } from 'lodash';
import Rewards from '@screens/Node/components/Rewards';
import { ActivityIndicator, RoundCornerButton } from '@components/core';
import theme from '@src/styles/theme';
import {SuccessModal} from '@src/components';
import NodeItem from '@screens/Node/components/NodeItem/NodeItem';

const Node = (props) => {
  const {
    wallet,  // value from @enhanceWithdraw
    refreshData,
    nodeRewards,
    loading, // creating account from @enhanceSignIn
    listDevice,
    showWelcome,
    isFetching,
    isRefreshing,
    removingDevice,
    onClearNetworkNextTime,
    handleAddVirtualNodePress,
    handleAddNodePress,
    noRewards,
    onBuyNodePress,
    handlePressStake,
    handlePressUnstake,
    handlePressRemoveDevice,
    importAccount,
    handleConfirmRemoveDevice,
    handleCancelRemoveDevice,

    // Withdraw
    withdrawable,
    withdrawing,
    withdrawTxs,
    handleWithdrawAll,
    handlePressWithdraw,
  } = props;

  const renderNode = ({ item, index }) => {
    return (
      <NodeItem
        wallet={wallet}
        item={item}
        isFetching={isFetching}
        index={index}
        onStake={handlePressStake}
        onUnstake={handlePressUnstake}
        onWithdraw={handlePressWithdraw}
        onRemove={handlePressRemoveDevice}
        onImport={importAccount}
        withdrawTxs={withdrawTxs}
      />
    );
  };

  const renderTotalRewards = () => {
    if (isRefreshing) return null;
    if (isFetching || !nodeRewards) {
      return (
        <View style={style.loading}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={{ paddingHorizontal: 25 }}>
        <Rewards rewards={nodeRewards} />
        { !noRewards &&
          <RoundCornerButton
            onPress={handleWithdrawAll}
            style={[theme.BUTTON.NODE_BUTTON, {marginBottom: 50}]}
            title={!withdrawable || withdrawing ? 'Withdrawing all rewards...' : 'Withdraw all rewards'}
            disabled={!withdrawable || withdrawing}
          />
        }
      </View>
    );
  };

  const renderModalActionsForNodePrevSetup = () => {
    return (
      <ModalMissingSetup />
    );
  };

  const renderContent = () => {
    if (showWelcome) {
      return (
        <View style={{ marginHorizontal: 25 }}>
          <WelcomeFirstTime onPressOk={onClearNetworkNextTime} />
        </View>
      );
    }

    if (!isFetching && isEmpty(listDevice)) {
      return (
        <View style={{ marginHorizontal: 25 }}>
          <WelcomeNodes
            onAddVNode={handleAddVirtualNodePress}
            onAddPNode={handleAddNodePress}
          />
        </View>
      );
    }

    return (
      <>
        {renderTotalRewards()}
        <View style={{ flex: 1 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[{ flexGrow: 1}]}
            style={style.list}
            data={listDevice}
            keyExtractor={item => String(item.ProductId)}
            renderItem={renderNode}
            onRefresh={refreshData}
            refreshing={isRefreshing}
          />
          <View style={{ marginHorizontal: 25 }}>
            <RoundCornerButton
              style={[style.buyButton, theme.BUTTON.BLACK_TYPE]}
              title="Get a Node Device"
              onPress={onBuyNodePress}
            />
          </View>
          <SuccessModal
            title="Remove from display"
            extraInfo={'Are you sure?\nYou can add this Node again later.'}
            visible={!!removingDevice}
            buttonTitle="Remove"
            closeSuccessDialog={handleConfirmRemoveDevice}
            onSuccess={handleCancelRemoveDevice}
            successTitle="Cancel"
            buttonStyle={theme.BUTTON.NODE_BUTTON}
          />
        </View>
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderContent()}
      {renderModalActionsForNodePrevSetup()}
      <DialogLoader loading={loading} />
    </View>
  );
};

Node.propTypes = {
  wallet: PropTypes.object.isRequired,
  nodeRewards: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  listDevice: PropTypes.array.isRequired,
  showWelcome: PropTypes.bool.isRequired,
  removingDevice: PropTypes.oneOfType([null, PropTypes.object]).isRequired,
  onClearNetworkNextTime: PropTypes.func.isRequired,
  handleAddVirtualNodePress: PropTypes.func.isRequired,
  handleAddNodePress: PropTypes.func.isRequired,
  handleWithdrawAll: PropTypes.func.isRequired,
  withdrawing: PropTypes.bool.isRequired,
  withdrawable: PropTypes.bool.isRequired,
  onBuyNodePress: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired,
  withdrawTxs: PropTypes.object.isRequired,
  handlePressStake: PropTypes.func.isRequired,
  handlePressUnstake: PropTypes.func.isRequired,
  handlePressWithdraw: PropTypes.func.isRequired,
  handlePressRemoveDevice: PropTypes.func.isRequired,
  importAccount: PropTypes.func.isRequired,
  noRewards: PropTypes.bool.isRequired,
  handleConfirmRemoveDevice: PropTypes.func.isRequired,
  handleCancelRemoveDevice: PropTypes.func.isRequired,
  isRefreshing: PropTypes.bool.isRequired
};

export default nodeEnhance(memo(Node));