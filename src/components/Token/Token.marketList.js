import { View } from '@components/core';
import { useFuse } from '@components/Hoc/useFuse';
import { ListView } from '@components/Token/index';
import { MarketTabs } from '@screens/MainTabBar/features/Market/Market.header';
import { marketTabSelector } from '@screens/Setting';
import { getPTokenList } from '@src/redux/actions/token';
import { marketTokens as marketTokensSelector } from '@src/redux/selectors/shared';
import routeNames from '@src/router/routeNames';
import useDebounceSelector from '@src/shared/hooks/debounceSelector';
import { PRVIDSTR } from 'incognito-chain-web-js/build/wallet';
import orderBy from 'lodash/orderBy';
import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { useNavigation } from 'react-navigation-hooks';
import { useDispatch } from 'react-redux';

const MarketList = (props) => {
  const { renderItem, keySearch, filterField, orderField } = props;

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const currentRouteName = navigation?.state?.routeName;

  const availableTokens =
    props?.availableTokens || useDebounceSelector(marketTokensSelector);

  const activeTab = useDebounceSelector(marketTabSelector);

  // Get list verifiedToken list unVerifiedTokens from list all token
  const _verifiedTokens = availableTokens?.filter((token) => token?.isVerified);
  const _unVerifiedTokens = availableTokens?.filter(
    (token) => !token.isVerified,
  );

  const getMarketTokens = () => {
    let marketTokens = [];
    if (
      activeTab === MarketTabs.ALL ||
      currentRouteName === routeNames.MarketSearchCoins
    ) {
      marketTokens = _verifiedTokens
        .concat(_unVerifiedTokens.filter((item) => item.isFollowed))
        .filter((token) => !!token.defaultPoolPair);
    } else {
      marketTokens = _verifiedTokens
        .filter((item) => item.isFollowed || item.tokenId === PRVIDSTR)
        .concat(_unVerifiedTokens.filter((item) => item.isFollowed))
        .filter((token) => !!token.defaultPoolPair);
    }
    if (orderField === 'desc') {
      marketTokens = orderBy(
          marketTokens,
          (item) => Number(item[filterField] || '0'),
          [orderField],
      );
      marketTokens = orderBy(
          marketTokens,
          (item) => [
            item.isPRV,
            item.symbol === 'BTC' || item.externalSymbol === 'BTC',
            item.symbol === 'XMR' || item.externalSymbol === 'XMR',
            item.symbol === 'ETH' || item.externalSymbol === 'ETH',
            (item.symbol === 'BNB' || item.externalSymbol === 'BNB') && item.currencyType === 7], //BNB network BSC
          ['desc', orderField],
      );
    } else {
      marketTokens = orderBy(
          marketTokens,
          (item) => Number(item[filterField] || '0'),
          [orderField],
      );
    }

    return marketTokens;
  };

  const marketTokens = getMarketTokens();

  const [tokens, onSearchMarketTokens] = useFuse(marketTokens, {
    keys: ['displayName', 'name', 'symbol', 'pSymbol'],
    matchAllOnEmptyQuery: true,
    isCaseSensitive: false,
    findAllMatches: true,
    includeMatches: false,
    includeScore: true,
    useExtendedSearch: false,
    threshold: 0,
    location: 0,
    distance: 2,
    maxPatternLength: 32,
  });

  const [loading, setLoading] = React.useState(false);

  const onRefresh = () => {
    try {
      setLoading(true);
      dispatch(getPTokenList());
      setLoading(false);
    } catch (e) {
      console.log('MarketList: error');
      setLoading(false);
    }
  };

  const isLoading = React.useMemo(() => {
    return loading;
  }, [loading]);

  React.useEffect(() => {
    onSearchMarketTokens(keySearch);
  }, [keySearch]);

  return (
    <View style={{ flex: 1 }}>
      <ListView
        data={tokens}
        isRefreshing={isLoading}
        onRefresh={onRefresh}
        visible
        renderItem={renderItem}
      />
    </View>
  );
};

MarketList.defaultProps = {
  keySearch: '',
};

MarketList.propTypes = {
  tokensFactories: PropTypes.array.isRequired,
  onToggleUnVerifiedTokens: PropTypes.func.isRequired,
  toggleUnVerified: PropTypes.bool.isRequired,
  renderItem: PropTypes.func.isRequired,
  keySearch: PropTypes.string,
};

export default memo(MarketList);
