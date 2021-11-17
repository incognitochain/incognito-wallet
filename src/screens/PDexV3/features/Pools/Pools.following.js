import { Row } from '@src/components';
import { LoadingContainer } from '@src/components/core';
import React from 'react';
import { View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Pool from '@screens/PDexV3/features/Pool';
import { isFetchingSelector, followPoolIdsSelector } from './Pools.selector';
import { actionFetchPools } from './Pools.actions';
import { styled, poolsListHeaderFollowingStyled } from './Pools.styled';

const HEADER_FACTORIES = [
  {
    text: 'Name / Vol',
    styled: [poolsListHeaderFollowingStyled.wrapperFirstSection],
    textStyle: null,
  },
  {
    text: 'APY',
    styled: [
      poolsListHeaderFollowingStyled.wrapperSecondSection,
      poolsListHeaderFollowingStyled.centerText,
    ],
  },
];

export const PoolsListHeader = React.memo(() => {
  return (
    <Row style={{ marginVertical: 15, justifyContent: 'space-between' }}>
      {HEADER_FACTORIES.map((item) => (
        <Text
          key={item.text}
          style={[poolsListHeaderFollowingStyled.text, item.styled]}
        >
          {item.text}
        </Text>
      ))}
    </Row>
  );
});

export const PoolsListFollowing = React.memo(({ handlePressPool }) => {
  const dispatch = useDispatch();
  const followIds = useSelector(followPoolIdsSelector) || [];
  const isFetching = useSelector(isFetchingSelector);
  const onPressPool = (poolId) => {
    typeof handlePressPool === 'function' && handlePressPool(poolId);
  };
  const renderItem = (poolId) => (
    <Pool
      key={poolId}
      poolId={poolId}
      swipable={followIds.length > 1}
      onPressPool={onPressPool}
      checkFollow={false}
    />
  );
  const renderContent = () => {
    if (isFetching) return <LoadingContainer />;
    return <View>{followIds.map(renderItem)}</View>;
  };
  React.useEffect(() => {
    dispatch(actionFetchPools());
  }, []);
  return renderContent();
});

const Pools = (props) => {
  const { handlePressPool } = props;
  return (
    <View style={styled.container}>
      <PoolsListHeader />
      <PoolsListFollowing handlePressPool={handlePressPool} />
    </View>
  );
};

Pools.propTypes = {
  handlePressPool: PropTypes.func.isRequired,
};

PoolsListFollowing.propTypes = {
  handlePressPool: PropTypes.func.isRequired,
};

export default React.memo(Pools);
