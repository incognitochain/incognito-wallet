import { Row } from '@src/components';
import {StarStrokeIcon, TokenVerifiedIcon, StarFillIcon} from '@src/components/Icons';
import React from 'react';
import { View, Text } from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  actionToggleFollowingPool,
  getDataByPoolIdSelector,
} from '@screens/PDexV3/features/Pools';
import PropTypes from 'prop-types';
import { TouchableOpacity } from '@src/components/core';
import { styled } from './Pool.styled';

export const PoolItem = React.memo(({ poolId, onPressPool, style }) => {
  const dispatch = useDispatch();
  const data = useSelector(getDataByPoolIdSelector)(poolId);
  if (!data) {
    return null;
  }
  const {
    isVerify,
    apy,
    volumeToAmount,
    isFollowed,
    poolTitle,
  } = data || {};
  return (
    <TouchableOpacity
      onPress={() => typeof onPressPool === 'function' && onPressPool(poolId)}
      style={[styled.container, style]}
    >
      <Row spaceBetween>
        <View style={styled.wrapperFirstSection}>
          <Row style={styled.rowName}>
            <Text style={styled.name}>
              {poolTitle}
            </Text>
            {!!isVerify && <TokenVerifiedIcon />}
          </Row>
          <Text style={styled.subText}>{`Vol: ${volumeToAmount}$`}</Text>
        </View>
        <View style={styled.wrapperSecondSection}>
          <Text style={styled.apy}>{`${apy}%`}</Text>
        </View>
        <TouchableOpacity
          style={styled.wrapperThirdSection}
          onPress={() => dispatch(actionToggleFollowingPool(poolId))}
        >
          {isFollowed ? (<StarFillIcon />) : (<StarStrokeIcon />)}
        </TouchableOpacity>
      </Row>
    </TouchableOpacity>
  );
});

PoolItem.defaultProps = {
  onPressPool: null,
  style: null,
};

PoolItem.propTypes = {
  poolId: PropTypes.string.isRequired,
  onPressPool: PropTypes.func,
  style: PropTypes.object,
};

export default React.memo(PoolItem);
