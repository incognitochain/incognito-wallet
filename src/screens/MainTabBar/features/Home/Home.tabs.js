import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Tabs, Text } from '@src/components/core';
import { TABS } from '@screens/MainTabBar/features/Home/Home.constant';
import { batch, useDispatch, useSelector } from 'react-redux';
import { listPoolsVerifySelector } from '@screens/PDexV3/features/Pools';
import { Row } from '@src/components';
import { homeStyled } from '@screens/MainTabBar/MainTabBar.styled';
import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';
import { actionInitSwapForm } from '@screens/PDexV3/features/Swap';
import { actionChangeTab } from '@components/core/Tabs/Tabs.actions';
import {
  ROOT_TAB_TRADE,
  TAB_SWAP_ID,
} from '@screens/PDexV3/features/Trade/Trade.constant';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import { COLORS } from '@src/styles';

const Item = React.memo(({ pool, onItemPress, popular }) => {
  const {
    priceStr,
    perChange24hToStr,
    perChange24hColor,
    poolTitle,
    volumeSuffix,
  } = pool;
  return (
    <TouchableOpacity onPress={() => onItemPress(pool)}>
      <Row centerVertical style={homeStyled.wrapPoolBox}>
        <Text style={[homeStyled.mediumBlack, homeStyled.itemBox]}>
          {poolTitle}
        </Text>
        <Text
          style={[
            homeStyled.mediumBlack,
            homeStyled.itemBox,
            homeStyled.right,
            { color: perChange24hColor },
          ]}
        >
          {priceStr}
        </Text>
        <View
          style={[
            !popular && homeStyled.percentBox,
            homeStyled.percentBoxWidth,
          ]}
        >
          <Text
            style={[
              homeStyled.mediumBlack,
              { color: perChange24hColor, textAlign: 'right' },
              popular && homeStyled.volText,
            ]}
            numberOfLines={0}
          >
            {popular ? volumeSuffix : perChange24hToStr}
          </Text>
        </View>
        {!popular && (
          <TouchableOpacity
            style={[homeStyled.btnTrade]}
            onPress={() => onItemPress(pool)}
          >
            <Text style={homeStyled.labelTrade}>Trade</Text>
          </TouchableOpacity>
        )}
      </Row>
    </TouchableOpacity>
  );
});

const Header = React.memo(({ popular }) => (
  <Row>
    <Text style={[homeStyled.itemBox, homeStyled.tabHeaderText]}>Name</Text>
    <Text
      style={[homeStyled.itemBox, homeStyled.tabHeaderText, homeStyled.right]}
    >
      Price
    </Text>
    <Text
      style={[
        homeStyled.percentBoxWidth,
        homeStyled.tabHeaderText,
        { textAlign: 'right' },
      ]}
    >
      {popular ? 'Vol(USD)' : 'Change'}
    </Text>
    {!popular && (
      <View style={[homeStyled.btnTrade, { backgroundColor: COLORS.white }]} />
    )}
  </Row>
));

const tabStyle = {
  titleStyled: homeStyled.mediumBlack,
  titleDisabledStyled: homeStyled.tabDisable,
};

const MainTab = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const pools = useSelector(listPoolsVerifySelector);
  const onItemPress = async (pool) => {
    navigation.navigate(routeNames.Trade, { tabIndex: 0 });
    batch(() => {
      dispatch(
        actionInitSwapForm({
          refresh: true,
          defaultPair: {
            selltoken: pool?.token1?.tokenId,
            buytoken: pool?.token2?.tokenId,
          },
        }),
      );
      dispatch(
        actionChangeTab({
          rootTabID: ROOT_TAB_TRADE,
          tabID: TAB_SWAP_ID,
        }),
      );
    });
  };
  const renderItem = (pool, popular) => (
    <Item
      pool={pool}
      key={pool.poolId}
      onItemPress={onItemPress}
      popular={popular}
    />
  );
  if (!pools || pools.length === 0) return null;
  return (
    <Tabs rootTabID={TABS.TAB_HOME_ID} useTab1 styledTabList={homeStyled.tab}>
      <View tabID={TABS.TAB_HOME_INCREASE_ID} label="Gainers" {...tabStyle}>
        <Header popular={false} />
        {orderBy(pools, 'priceChange24H', 'desc').map((item) =>
          renderItem(item, false),
        )}
      </View>
      <View tabID={TABS.TAB_HOME_REDUCE_ID} label="Losers" {...tabStyle}>
        <Header popular={false} />
        {orderBy(pools, 'priceChange24H', 'asc').map((item) =>
          renderItem(item, false),
        )}
      </View>
      <View tabID={TABS.TAB_HOME_POPULAR_ID} label="24h Vol" {...tabStyle}>
        <Header popular />
        {orderBy(pools, 'volume', 'desc').map((item) => renderItem(item, true))}
      </View>
    </Tabs>
  );
};

Item.propTypes = {
  pool: PropTypes.object.isRequired,
  onItemPress: PropTypes.func.isRequired,
  popular: PropTypes.bool.isRequired,
};

Header.propTypes = {
  popular: PropTypes.bool.isRequired,
};

export default memo(MainTab);
