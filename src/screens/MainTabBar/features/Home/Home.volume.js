import React, {memo} from 'react';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {listPoolsVerifySelector} from '@screens/PDexV3/features/Pools';
import orderBy from 'lodash/orderBy';
import {Row} from '@src/components';
import PropTypes from 'prop-types';
import {homeStyled} from '@screens/MainTabBar/MainTabBar.styled';
import formatUtils from '@utils/format';

const Item = React.memo(({ item }) => {
  const { token1, token2, price, perChange24hColor, perChange24hToStr } = item;
  return (
    <View style={homeStyled.wrapMainVolume}>
      <Text style={[homeStyled.mediumBlack, { fontSize: 12 }]}>{`${token1.symbol} / ${token2.symbol}`}</Text>
      <Text style={[homeStyled.mediumBlack, { lineHeight: 24, color: perChange24hColor }]}>{formatUtils.toFixed(price, 4)}</Text>
      <Text style={[homeStyled.regularGray, { fontSize: 10, lineHeight: 15 }]}>{perChange24hToStr}</Text>
    </View>
  );
});

const BigVolume = () => {
  const pools = useSelector(listPoolsVerifySelector);
  const mainVolume = React.useMemo(() => {
    const sort = orderBy(pools, 'volume', 'desc');
    if (sort && sort.length > 2) {
      return sort.splice(0, 3);
    }
    return [];
  }, [pools]);

  const renderItem = (item) => <Item item={item} />;

  if (!mainVolume || mainVolume.length === 0) return undefined;
  return (
    <Row style={[homeStyled.mainVolume, homeStyled.shadow]} spaceBetween>
      {pools.map(renderItem)}
    </Row>
  );
};

Item.propTypes = {
  item: PropTypes.shape({
    token1: PropTypes.object.isRequired,
    token2: PropTypes.object.isRequired,
    price: PropTypes.number.isRequired,
    perChange24hColor: PropTypes.string.isRequired,
    perChange24hToStr: PropTypes.string.isRequired
  }).isRequired
};

export default memo(BigVolume);