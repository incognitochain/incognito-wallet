import React from 'react';
import {
  FlatList,
  KeyboardAwareScrollView,
  Text,
  RefreshControl,
} from '@src/components/core';
import { BaseTextInputCustom } from '@src/components/core/BaseTextInput';
import { FONT, COLORS } from '@src/styles';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Row } from '@src/components';
import Pool from '@screens/PDexV3/features/Pool';
import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';
import { actionFetchPools } from './Pools.actions';
import { handleFilterPoolByKeySeach } from './Pools.utils';
import { isFetchingSelector } from './Pools.selector';

const styled = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  headerText: {
    fontSize: FONT.SIZE.small,
    color: COLORS.colorGrey3,
    fontFamily: FONT.NAME.medium,
  },
});

const HEADER_FACTORIES = [
  {
    text: 'Name / Vol',
    style: {
      flex: 1,
      marginRight: 15,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
  },
  {
    text: 'APY',
    style: {
      width: 80,
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginRight: 5,
      textAlign: 'right',
    },
  },
  {
    text: ' ',
    style: {
      width: 30,
    },
  },
];

export const PoolsListHeader = React.memo(() => {
  return (
    <Row style={{ marginTop: 24, marginBottom: 16 }}>
      {HEADER_FACTORIES.map((item) => (
        <Text key={item.text} style={{ ...styled.headerText, ...item.style }}>
          {item.text}
        </Text>
      ))}
    </Row>
  );
});

export const PoolsList = React.memo(({ onPressPool, pools }) => {
  const refreshing = useSelector(isFetchingSelector);
  const dispatch = useDispatch();
  const onRefresh = () => dispatch(actionFetchPools());
  const data = React.useMemo(() => {
    return orderBy(pools, 'isFollowed', 'desc');
  }, [pools]);
  return (
    <KeyboardAwareScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <Pool
            poolId={item.poolId}
            onPressPool={() => {
              console.log(item.poolId);
              onPressPool(item.poolId, item);
            }}
          />
        )}
        keyExtractor={({ poolId }) => poolId}
        showsVerticalScrollIndicator={false}
      />
    </KeyboardAwareScrollView>
  );
});

const PoolsListContainer = (props) => {
  const { onPressPool, listPools, style } = props;
  const [text, setText] = React.useState(text);
  const [pools, setPools] = React.useState([]);
  const onChange = (text) => {
    setText(text);
    if (!text) {
      return setPools(listPools);
    }
    const tokens = handleFilterPoolByKeySeach({
      data: listPools,
      keySearch: text,
    });
    setPools(tokens);
  };
  React.useEffect(() => {
    setPools(listPools);
    setText('');
  }, [listPools]);
  return (
    <View style={[styled.container, style]}>
      <BaseTextInputCustom
        inputProps={{
          onChangeText: onChange,
          placeholder: 'Search coins',
          style: styled.input,
          autFocus: true,
        }}
      />
      <PoolsListHeader />
      <PoolsList onPressPool={onPressPool} pools={pools} />
    </View>
  );
};

PoolsList.propTypes = {
  onPressPool: PropTypes.func.isRequired,
  pools: PropTypes.array.isRequired,
};

PoolsListContainer.defaultProps = {
  style: undefined,
};

PoolsListContainer.propTypes = {
  onPressPool: PropTypes.func.isRequired,
  listPools: PropTypes.array.isRequired,
  style: PropTypes.any,
};

export default React.memo(PoolsListContainer);
