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
import { validatePRVBalanceSelector } from '@src/redux/selectors/selectedPrivacy';
import { actionRefillPRVModalVisible } from '@src/screens/RefillPRV/RefillPRV.actions';
import {
  getDataByShareIdSelector,
  listShareIDsSelector,
} from './Portfolio.selector';
import { styled } from './Portfolio.styled';
import PortfolioItem from './Portfolio.item';

const PortfolioList = withTransaction(React.memo(({ onCreateWithdrawFeeLP }) => {
  const dispatch = useDispatch();
  const data = useSelector(listShareIDsSelector);
  const getDataShare = useSelector(getDataByShareIdSelector);
  const {
    isEnoughtPRVNeededAfterBurn,
    isCurrentPRVBalanceExhausted,
  } = useSelector(validatePRVBalanceSelector)(ACCOUNT_CONSTANT.MAX_FEE_PER_TX);

  const onWithdrawFeeLP = ({ poolId, shareId }) => {
    const dataShare = getDataShare(shareId);
    if (!dataShare && typeof onCreateWithdrawFeeLP !== 'function') return;
    const { nftId, tokenId1, tokenId2, rewards, orderRewards } = dataShare;
    let tokenIDs = [tokenId1, tokenId2].concat(Object.keys(rewards || {})).concat(Object.keys(orderRewards || {}));
    tokenIDs = uniq(tokenIDs.map(tokenID => tokenID.toLowerCase()));
    const params = {
      fee: ACCOUNT_CONSTANT.MAX_FEE_PER_TX,
      withdrawTokenIDs: tokenIDs,
      poolPairID: poolId,
      nftID: nftId,
      amount1: String(0),
      amount2: String(0)
    };
    if (!isEnoughtPRVNeededAfterBurn) {
      dispatch(actionRefillPRVModalVisible(true));
      return;
    }
    onCreateWithdrawFeeLP(params);
  };
  return (
    <FlatList
      data={data}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => dispatch(actionFetch())} />
      }
      renderItem={({ item, index }) => (
        <PortfolioItem
          shareId={item}
          onWithdrawFeeLP={onWithdrawFeeLP}
          isLast={index === data.length - 1}
        />
      )}
      keyExtractor={(item) => item}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{ flexGrow: 1 }]}
      ListEmptyComponent={
        <EmptyBookIcon message="Join a pool to contribute liquidity and earn rewards." />
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
