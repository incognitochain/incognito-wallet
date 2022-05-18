import { View } from '@components/core';
import { actionChangeTab } from '@components/core/Tabs/Tabs.actions';
import { withLayout_2 } from '@components/Layout';
import { TokenFollow } from '@components/Token';
import MarketList from '@components/Token/Token.marketList';
import routeNames from '@routers/routeNames';
import { headerStyled } from '@screens/MainTabBar/features/Market/Market.styled';
import {
  actionInit,
  actionSetPoolSelected,
} from '@screens/PDexV3/features/OrderLimit';
import {
  ROOT_TAB_TRADE,
  TAB_BUY_LIMIT_ID,
} from '@screens/PDexV3/features/Trade/Trade.constant';
import { actionLogEvent } from '@screens/Performance';
import { Header } from '@src/components';
import PropTypes from 'prop-types';
import React, { memo, useState } from 'react';
import { useNavigation } from 'react-navigation-hooks';
import { batch, useDispatch } from 'react-redux';
import { compose } from 'recompose';

const MarketSearchCoins = (props) => {
  const { ...rest } = props;
  const dispatch = useDispatch();
  const [keySearch, setKeySearch] = useState('');
  const navigation = useNavigation();
  const onOrderPress = (item) => {
    const poolId = item.defaultPoolPair;
    navigation.navigate(routeNames.Trade, { tabIndex: 0 });
    dispatch(
      actionLogEvent({
        desc: 'POOL-SELECTED-Market-' + JSON.stringify(poolId || ''),
      }),
    );
    if (poolId) {
      batch(() => {
        dispatch(actionSetPoolSelected(poolId));
        dispatch(
          actionChangeTab({
            rootTabID: ROOT_TAB_TRADE,
            tabID: TAB_BUY_LIMIT_ID,
          }),
        );
        setTimeout(() => {
          dispatch(actionInit());
        }, 200);
      });
    }
  };
  return (
    <>
      <Header
        title="Search privacy coins"
        canSearch
        autoFocus
        titleStyled={headerStyled.title}
        isNormalSearch
        onTextSearchChange={(value) => {
          setKeySearch(value);
        }}
      />
      <View fullFlex borderTop style={{ overflow: 'hidden', paddingTop: 0 }}>
        <MarketList
          {...rest}
          keySearch={keySearch}
          renderItem={({ item }) => (
            <TokenFollow
              item={item}
              key={item.tokenId}
              hideStar
              onPress={() => onOrderPress(item)}
            />
          )}
        />
      </View>
    </>
  );
};

MarketSearchCoins.propTypes = {
  handleToggleFollowToken: PropTypes.func.isRequired,
};

export default compose(withLayout_2)(memo(MarketSearchCoins));
