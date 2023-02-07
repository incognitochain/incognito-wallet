import React, { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getDataByShareIdSelector,
  listShareSelector
} from '@screens/PDexV3/features/Portfolio/Portfolio.selector';
import { FlatList } from '@components/core/FlatList';
import { RefreshControl } from '@components/core';
import { actionFetch } from '@screens/PDexV3/features/Portfolio/Portfolio.actions';
import { EmptyBookIcon } from '@components/Icons';
import { styled } from '@screens/PDexV3/features/Portfolio/Portfolio.styled';
import RewardItem from '@screens/PDexV3/features/Portfolio/Portfolio.rewardItem';
import orderBy from 'lodash/orderBy';
import withTransaction from '@screens/PDexV3/features/Liquidity/Liquidity.enhanceTransaction';
import { ACCOUNT_CONSTANT } from 'incognito-chain-web-js/build/wallet';
import uniq from 'lodash/uniq';
import PropTypes from 'prop-types';
import { validatePRVBalanceSelector } from '@src/redux/selectors/selectedPrivacy';
import { actionRefillPRVModalVisible } from '@src/screens/RefillPRV/RefillPRV.actions';
import { actionFaucetPRV } from '@src/redux/actions/token';
import FaucetPRVModal from '@src/components/Modal/features/FaucetPRVModal';

const PortfolioReward = ({ onCreateWithdrawFeeLP }) => {
  const dispatch = useDispatch();
  const data = useSelector(listShareSelector);
  const listShare = React.useMemo(() => {
    if (!data) return [];
    return orderBy(data, 'totalRewardAmount', 'desc').filter(item => item.withdrawable);
  }, [data]);
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

    if (isCurrentPRVBalanceExhausted) {
      dispatch(actionFaucetPRV(<FaucetPRVModal />));
      return;
    }

    if (!isEnoughtPRVNeededAfterBurn) {
      dispatch(actionRefillPRVModalVisible(true));
      return;
    }
    onCreateWithdrawFeeLP(params);
  };
  return (
    <FlatList
      data={listShare}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => dispatch(actionFetch())} />
      }
      renderItem={({ item, index }) => (
        <RewardItem
          data={item}
          onWithdrawFeeLP={onWithdrawFeeLP}
          isLast={index === data.length - 1}
        />
      )}
      keyExtractor={(item) => item?.shareId}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{ flexGrow: 1, paddingTop: 8 }]}
      ListEmptyComponent={
        <EmptyBookIcon message="Join a pool to start earning rewards." />
      }
      style={styled.list}
    />
  );
};

PortfolioReward.propTypes = {
  onCreateWithdrawFeeLP: PropTypes.func.isRequired
};

export default withTransaction(memo(PortfolioReward));
