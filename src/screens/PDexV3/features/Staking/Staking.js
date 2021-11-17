import React, {memo} from 'react';
import {SafeAreaView, View} from 'react-native';
import {styled as mainStyle} from '@screens/PDexV3/PDexV3.styled';
import {Header, Row} from '@src/components';
import {Tabs} from '@components/core';
import routeNames from '@routers/routeNames';
import {useNavigation} from 'react-navigation-hooks';
import {homeStyle, tabStyle} from '@screens/PDexV3/features/Staking/Staking.styled';
import {STAKING_MESSAGES, TABS} from '@screens/PDexV3/features/Staking/Staking.constant';
import AmountGroup from '@components/core/AmountGroup';
import {CalendarClockIcon as CalendarIcon} from '@components/Icons';
import StakingPools from '@screens/PDexV3/features/Staking/Staking.pools';
import {BTNBorder} from '@components/core/Button';
import StakingPortfolio from '@screens/PDexV3/features/Staking/Staking.portfolio';
import PropTypes from 'prop-types';
import withFetch from '@screens/PDexV3/features/Staking/Staking.enhanceFetch';
import {useSelector} from 'react-redux';
import {defaultAccountSelector} from '@src/redux/selectors/account';
import {stakingSelector} from '@screens/PDexV3/features/Staking';
import {NFTTokenBottomBar} from '@screens/PDexV3/features/NFTToken';
import {compose} from 'recompose';
import withLazy from '@components/LazyHoc/LazyHoc';

const Reward = React.memo(() => {
  const navigation = useNavigation();
  const { rewardUSDStr, rewardPRVStr } = useSelector(stakingSelector.stakingRewardSelector);
  const isFetching = useSelector(stakingSelector.isFetchingCoinsSelector);
  return (
    <Row center style={{ marginTop: 27 }}>
      <AmountGroup
        amountStr={rewardUSDStr}
        subAmountStr={rewardPRVStr}
        loading={isFetching}
      />
      <CalendarIcon
        btnStyle={{ paddingLeft: 15, position: 'absolute', right: 0, top: 0 }}
        onPress={() => navigation.navigate(routeNames.StakingHistories)}
      />
    </Row>
  );
});

const tabStyled = {
  titleStyled: tabStyle.title,
  titleDisabledStyled: tabStyle.disabledText,
  tabStyledEnabled: tabStyle.tabEnable,
};

const Staking = ({ handleFetchData, onFreeData }) => {
  const navigation = useNavigation();
  const account = useSelector(defaultAccountSelector);
  const isStaking = useSelector(stakingSelector.isExistStakingSelector);
  const onStakingMore = () => navigation.navigate(routeNames.StakingMoreCoins);
  React.useEffect(() => {
    setTimeout(() => {
      typeof handleFetchData === 'function' && handleFetchData();
    }, 300);
    return () => {
      onFreeData();
    };
  }, [account.paymentAddress]);

  const TabPools = React.useMemo(() => (
    <View tabID={TABS.TAB_COINS} label={STAKING_MESSAGES.listCoins} {...tabStyled}>
      <StakingPools />
    </View>
  ), []);

  const TabPortfolio = React.useMemo(() => (
    <View tabID={TABS.TAB_PORTFOLIO} label={STAKING_MESSAGES.portfolio} {...tabStyled}>
      <StakingPortfolio />
    </View>
  ), []);

  return (
    <>
      <View style={mainStyle.container}>
        <Header title={STAKING_MESSAGES.staking} accountSelectable />
        <Reward />
        <View style={homeStyle.wrapper}>
          <Tabs rootTabID={TABS.ROOT_ID} styledTabList={{ padding: 0 }} defaultTabIndex={1}>
            {TabPools}
            {TabPortfolio}
          </Tabs>
        </View>
        <SafeAreaView>
          <BTNBorder
            title={isStaking ? STAKING_MESSAGES.stakeMore : STAKING_MESSAGES.stakeNow}
            onPress={onStakingMore}
          />
        </SafeAreaView>
      </View>
      <NFTTokenBottomBar />
    </>
  );
};

Staking.propTypes = {
  handleFetchData: PropTypes.func.isRequired,
  onFreeData: PropTypes.func.isRequired,
};

export default compose(
  withLazy,
  withFetch
)(memo(Staking));
