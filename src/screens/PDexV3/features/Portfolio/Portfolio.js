import { FlatList } from '@src/components/core/FlatList';
import React from 'react';
import { View } from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import PortfolioModal from '@screens/PDexV3/features/Portfolio/Portfolio.detail';
import withTransaction from '@screens/PDexV3/features/Liquidity/Liquidity.enhanceTransaction';
import {ACCOUNT_CONSTANT} from 'incognito-chain-web-js/build/wallet';
import {RefreshControl} from '@components/core';
import {actionFetch} from '@screens/PDexV3/features/Portfolio/Portfolio.actions';
import {EmptyBookIcon} from '@components/Icons';
import {
  getDataShareByPoolIdSelector,
  isFetchingSelector,
  listShareIDsSelector,
} from './Portfolio.selector';
import { styled } from './Portfolio.styled';
import PortfolioItem from './Portfolio.item';

const PortfolioList = withTransaction(React.memo(({ onCreateWithdrawFeeLP }) => {
  const isFetching = useSelector(isFetchingSelector);
  const dispatch = useDispatch();
  const data = useSelector(listShareIDsSelector);
  const getDataShare = useSelector(getDataShareByPoolIdSelector);
  const onWithdrawFeeLP = (poolId) => {
    const dataShare = getDataShare(poolId);
    if (!dataShare && typeof onCreateWithdrawFeeLP !== 'function') return;
    const { token1Reward, token2Reward, nftId, tokenId1, tokenId2 } = dataShare;
    const params = {
      fee: ACCOUNT_CONSTANT.MAX_FEE_PER_TX,
      withdrawTokenIDs: [tokenId1, tokenId2],
      poolPairID: poolId,
      nftID: nftId,
      amount1: token1Reward,
      amount2: token2Reward
    };
    onCreateWithdrawFeeLP(params);
  };
  return (
    <FlatList
      data={data}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={() => dispatch(actionFetch())} />
      }
      renderItem={({ item, index }) => (
        <PortfolioItem
          shareId={item}
          onWithdrawFeeLP={onWithdrawFeeLP}
          isLast={index === data.length - 1}
        />
      )}
      keyExtractor={(item) => item?.shareId}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      ListEmptyComponent={
        <EmptyBookIcon message="Your portfolio is empty" />
      }
      style={styled.list}
    />
  );
}));

const Portfolio = () => {
  return (
    <>
      <View style={styled.container}>
        <PortfolioList />
      </View>
      <PortfolioModal />
    </>
  );
};

export default React.memo(Portfolio);
