import React, {memo} from 'react';
import {FlatList, View} from 'react-native';
import PropTypes from 'prop-types';
import withFetch from '@screens/PDexV3/features/Staking/Staking.enhanceFetch';
import {styled as mainStyle} from '@screens/PDexV3/PDexV3.styled';
import {useDispatch, useSelector} from 'react-redux';
import {stakingSelector} from '@screens/PDexV3/features/Staking';
import {HeaderRow, OneRowCoin, PortfolioItem} from '@screens/PDexV3/features/Staking/Staking.item';
import {RefreshControl} from '@components/core';
import {useNavigation} from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import {actionToggleModal} from '@components/Modal';
import ModalBottomSheet from '@components/Modal/features/ModalBottomSheet';
import {EmptyBookIcon} from '@components/Icons';

const StakingPortfolio = ({ handleFetchCoins }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const coins = useSelector(stakingSelector.stakingCoinsSelector);
  const isFetching = useSelector(stakingSelector.isFetchingCoinsSelector);
  const renderModelCell = (data) => <OneRowCoin token={data.token} valueText={data.rewardStr} />;
  const showDetailReward = (rewardsMerged) => {
    dispatch(actionToggleModal({
      data: (
        <ModalBottomSheet
          title='Rewards'
          headerView={<HeaderRow array={['Name', 'Amount']} />}
          contentView={<View style={{ marginTop: 24 }}>{rewardsMerged.map(renderModelCell)}</View>}
        />
      ),
      visible: true,
      shouldCloseModalWhenTapOverlay: true
    }));
  };
  const renderItem = (data) => (
    <PortfolioItem
      item={data.item}
      onPressArrow={showDetailReward}
      onPressItem={() => (
        navigation.navigate(routeNames.StakingDetail, { tokenId: data?.item?.tokenId })
      )}
    />
  );
  const renderContent = () => {
    return (
      <FlatList
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleFetchCoins} />
        }
        data={coins}
        renderItem={renderItem}
        keyExtractor={(item) => item.tokenId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={(
          <EmptyBookIcon message="You aren't staking any coins right now. Browse the list and find a yield you like." />
        )}
      />
    );
  };
  return (
    <View style={mainStyle.fullFlex}>
      <HeaderRow array={['Name', 'Amount']} style={{ marginTop: 10 }} />
      {renderContent()}
    </View>
  );
};

StakingPortfolio.propTypes = {
  handleFetchCoins: PropTypes.func.isRequired,
};

export default withFetch(memo(StakingPortfolio));
