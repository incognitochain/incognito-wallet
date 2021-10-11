import {FlatList} from '@src/components/core';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  actionSetSearchText,
  isFetchingSelector,
  searchPoolSelector,
} from '@screens/PDexV3/features/Pools';
import Pool from '@screens/PDexV3/features/Pool';
import PropTypes from 'prop-types';
import {BaseTextInputCustom} from '@components/core/BaseTextInput';
import {actionRefresh} from '@screens/PDexV3/features/Home';
import { styled as generalStyled } from './Pools.styled';

const styled = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 14
  },
  input: {
    height: 40,
    marginBottom: 24
  }
});

export const PoolsList = React.memo(({ onPressPool, poolIds }) => {
  const isFetching = useSelector(isFetchingSelector);
  const dispatch = useDispatch();
  return (
    <FlatList
      refreshing={isFetching}
      onRefresh={() => {
        dispatch(actionRefresh());
      }}
      data={poolIds}
      renderItem={({ item }) => (
        <Pool poolId={item} onPressPool={() => onPressPool(item)} />
      )}
      keyExtractor={(poolId) => poolId}
      showsVerticalScrollIndicator={false}
      style={generalStyled.listPools}
    />
  );
});

const PoolsListContainer = ({ onPressPool }) => {
  const dispatch = useDispatch();
  const poolIds = useSelector(searchPoolSelector);
  return (
    <View style={styled.container}>
      <BaseTextInputCustom
        style={styled.input}
        inputProps={{
          onChangeText: (text) => {
            dispatch(actionSetSearchText({ searchText: text }));
          },
          placeholder: 'Search coins',
          autFocus: true,
        }}
      />
      <PoolsList onPressPool={onPressPool} poolIds={poolIds} />
    </View>
  );
};

PoolsList.propTypes = {
  onPressPool: PropTypes.func.isRequired,
  poolIds: PropTypes.array.isRequired,
};

PoolsListContainer.propTypes = {
  onPressPool: PropTypes.func.isRequired,
};

export default React.memo(PoolsListContainer);
