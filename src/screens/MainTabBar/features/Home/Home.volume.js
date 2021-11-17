import React, {memo} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {batch, useDispatch, useSelector} from 'react-redux';
import {listPoolsVerifySelector} from '@screens/PDexV3/features/Pools';
import orderBy from 'lodash/orderBy';
import {Row} from '@src/components';
import PropTypes from 'prop-types';
import {homeStyled} from '@screens/MainTabBar/MainTabBar.styled';
import {PriceDownIcon, PriceUpIcon} from '@components/Icons/icon.arrowPrice';
import {actionChangeTab} from '@components/core/Tabs/Tabs.actions';
import {ROOT_TAB_TRADE, TAB_LIMIT_ID, TAB_SWAP_ID} from '@screens/PDexV3/features/Trade/Trade.constant';
import {actionInit, actionSetPoolSelected} from '@screens/PDexV3/features/OrderLimit';
import routeNames from '@routers/routeNames';
import {useNavigation} from 'react-navigation-hooks';
import {actionInitSwapForm} from '@screens/PDexV3/features/Swap';

const Item = React.memo(({ item, onItemPress }) => {
  const { token1, token2, priceStr, perChange24hColor, perChange24hToStr, priceChange24H, poolId } = item;
  return (
    <TouchableOpacity style={[homeStyled.wrapMainVolume, { flex: 1 }]} onPress={() => onItemPress(item)}>
      <Text style={[homeStyled.mediumBlack, { fontSize: 12 }]}>{`${token1.symbol} / ${token2.symbol}`}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[homeStyled.mediumBlack, { lineHeight: 24, color: perChange24hColor }]}>
          {priceStr}
        </Text>
      </View>
      <Row centerVertical>
        {!!priceChange24H && (
          <Row centerVertical style={{ marginRight: 2 }}>
            {priceChange24H > 0 ? <PriceUpIcon /> : <PriceDownIcon />}
          </Row>
        )}
        <Text style={[homeStyled.regularGray, { fontSize: 10, lineHeight: 15 }]}>{perChange24hToStr}</Text>
      </Row>
    </TouchableOpacity>
  );
});

const BigVolume = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const pools = useSelector(listPoolsVerifySelector);
  const mainVolume = React.useMemo(() => {
    const sort = orderBy(pools, 'volume', 'desc');
    if (sort && sort.length > 2) {
      return sort.splice(0, 3);
    }
    return [];
  }, [pools]);

  const onItemPress = (pool) => {
    navigation.navigate(routeNames.Trade, { tabIndex: 0 });
    setTimeout(() => {
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
    }, 200);
  };

  const renderItem = (item) => <Item item={item} key={item.poolId} onItemPress={onItemPress} />;

  if (!mainVolume || mainVolume.length === 0) return undefined;
  return (
    <Row style={[homeStyled.mainVolume, homeStyled.shadow]} spaceBetween>
      {mainVolume.map(renderItem)}
    </Row>
  );
};

Item.propTypes = {
  item: PropTypes.shape({
    token1: PropTypes.object.isRequired,
    token2: PropTypes.object.isRequired,
    priceStr: PropTypes.number.isRequired,
    perChange24hColor: PropTypes.string.isRequired,
    perChange24hToStr: PropTypes.string.isRequired,
    priceChange24H: PropTypes.number.isRequired,
    poolId: PropTypes.string.isRequired,
  }).isRequired,
  onItemPress: PropTypes.func.isRequired
};

export default memo(BigVolume);
