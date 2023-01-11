import { Row } from '@src/components';
import React from 'react';
import { useDispatch } from 'react-redux';
import {
  actionToggleFollowingPool,
  getDataByPoolIdSelector,
} from '@screens/PDexV3/features/Pools';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity , View } from '@src/components/core';
import { BtnStar } from '@src/components/Button';
import TwoTokenImage from '@screens/PDexV3/features/Portfolio/Portfolio.image';
import { colorsSelector } from '@src/theme';
import useDebounceSelector from '@src/shared/hooks/debounceSelector';
import { styled } from './Pool.styled';


export const PoolItem = React.memo((props) => {
  const { poolId, onPressPool, style, isLast } = props;
  const data = useDebounceSelector(getDataByPoolIdSelector)(poolId);
  const colors = useDebounceSelector(colorsSelector);
  if (!data) {
    return null;
  }
  const {
    isFollowed,
    poolTitle,
    apyStr,
    token1,
    token2,
    networkPairStr,
    isPRVUSDTPair
  } = data || {};

  const dispatch = useDispatch();
  const handleToggleFollowingPool = () =>
    dispatch(actionToggleFollowingPool(poolId));

  const iconUrl1 = isPRVUSDTPair ? token2.iconUrl : token1.iconUrl;
  const iconUrl2 = isPRVUSDTPair ? token1.iconUrl : token2.iconUrl;

  return (
    <TouchableOpacity
      onPress={() => typeof onPressPool === 'function' && onPressPool(poolId)}
      style={[styled.container, { borderBottomWidth: 1, borderBottomColor: colors.border4 }, isLast && { marginBottom: 70, borderBottomWidth: 0 }, style]}
    >
      <Row centerVertical>
        <View style={{ marginTop: -12 }}>
          <TwoTokenImage iconUrl1={iconUrl1} iconUrl2={iconUrl2} />
        </View>
        <View fullFlex>
          <Row spaceBetween>
            <Text style={styled.name}>{poolTitle}</Text>
            <Row centerVertical>
              <Text style={styled.subText}>{`${apyStr}`}</Text>
              <View style={styled.block3}>
                <BtnStar onPress={handleToggleFollowingPool} isBlue={isFollowed} />
              </View>
            </Row>
          </Row>
          <Row spaceBetween style={{ marginTop: 4 }}>
            <Text style={[styled.network, { color: colors.text3 }]}>{networkPairStr}</Text>
            <Text style={styled.earnBtn}>Earn now</Text>
          </Row>
        </View>
      </Row>
    </TouchableOpacity>
  );
});

const Pool = (props) => {
  const { poolId, onPressPool, isLast } = props;
  if (!poolId) {
    return null;
  }
  return <PoolItem poolId={poolId} onPressPool={onPressPool} isLast={isLast} />;
};

Pool.defaultProps = {
  onPressPool: null,
  isLast: false,
};

Pool.propTypes = {
  poolId: PropTypes.string.isRequired,
  onPressPool: PropTypes.func,
  isLast: PropTypes.bool,
};

PoolItem.defaultProps = {
  onPressPool: null,
  style: null,
};

PoolItem.propTypes = {
  poolId: PropTypes.string.isRequired,
  onPressPool: PropTypes.func,
  style: PropTypes.object,
  isLast: PropTypes.bool.isRequired
};

export default React.memo(Pool);
