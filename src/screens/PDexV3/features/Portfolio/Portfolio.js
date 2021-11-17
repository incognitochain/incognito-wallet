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
import uniq from 'lodash/uniq';
import {
  getDataByShareIdSelector,
  isFetchingSelector,
  listShareIDsSelector,
} from './Portfolio.selector';
import { styled } from './Portfolio.styled';
import PortfolioItem from './Portfolio.item';

const PortfolioList = withTransaction(React.memo(({ onCreateWithdrawFeeLP }) => {
  const isFetching = useSelector(isFetchingSelector);
  const dispatch = useDispatch();
  const data = useSelector(listShareIDsSelector);
  const getDataShare = useSelector(getDataByShareIdSelector);
  const onWithdrawFeeLP = ({ poolId, shareId }) => {
    const dataShare = getDataShare(shareId);
    if (!dataShare && typeof onCreateWithdrawFeeLP !== 'function') return;
    const { nftId, tokenId1, tokenId2, rewards } = dataShare;
    const params = {
      fee: ACCOUNT_CONSTANT.MAX_FEE_PER_TX,
      withdrawTokenIDs: uniq([tokenId1, tokenId2].concat(Object.keys(rewards))),
      poolPairID: poolId,
      nftID: nftId,
      amount1: String(0),
      amount2: String(0)
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
    <View style={styled.container}>
      <PortfolioList />
    </View>
  );
};

export default React.memo(Portfolio);
