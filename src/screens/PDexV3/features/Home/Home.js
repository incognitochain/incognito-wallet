import React from 'react';
import {BottomView, Header, Row} from '@src/components';
import { Tabs } from '@src/components/core';
import Portfolio from '@src/screens/PDexV3/features/Portfolio';
import { View } from 'react-native';
import { batch, useDispatch, useSelector } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { TradingVol24h } from '@screens/PDexV3/features/Share';
import { liquidityActions } from '@screens/PDexV3/features/Liquidity';
import {styled as mainStyle} from '@screens/PDexV3/PDexV3.styled';
import {activedTabSelector} from '@components/core/Tabs';
import ReturnLP from '@screens/PDexV3/features/Share/Share.returnLP';
import {listPoolsSelector, PoolsList} from '@screens/PDexV3/features/Pools';
import {NFTTokenBottomBar} from '@screens/PDexV3/features/NFTToken';
import PropTypes from 'prop-types';
import {nftTokenDataSelector} from '@src/redux/selectors/account';
import withHome from './Home.enhance';
import { ROOT_TAB_HOME, TAB_POOLS_ID, TAB_PORTFOLIO_ID } from './Home.constant';
import { styled } from './Home.styled';

const TabPools = React.memo(() => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const listPools = useSelector(listPoolsSelector);
  const onNavigateContribute = (poolId) => {
    batch(() => {
      dispatch(liquidityActions.actionSetContributeID({ poolId, nftId: '' }));
      navigation.navigate(routeNames.ContributePool);
    });
  };
  return (
    <>
      <PoolsList onPressPool={onNavigateContribute} listPools={listPools} />
      <BottomView
        title="Create liquidity +"
        onPress={() => {
          navigation.navigate(routeNames.CreatePool);
        }}
      />
    </>
  );
});

const HeaderView = React.memo(() => {
  const activedTab = useSelector(activedTabSelector)(ROOT_TAB_HOME);
  const renderContent = () => {
    if (activedTab === TAB_PORTFOLIO_ID) return (
      <Row spaceBetween style={styled.headerRow}>
        <ReturnLP />
      </Row>
    );
    return (
      <Row spaceBetween style={styled.headerRow}>
        <TradingVol24h />
      </Row>
    );
  };
  return renderContent();
});

const tabStyled = {
  titleStyled: styled.title,
  titleDisabledStyled: styled.disabledText,
  tabStyledEnabled: styled.tabEnable,
};

const Home = ({ hideBackButton }) => {
  const navigation = useNavigation();
  const { titleStr } = useSelector(nftTokenDataSelector);
  const _TabPools = React.useMemo(() => (
    <View tabID={TAB_POOLS_ID} label="Pools" {...tabStyled}>
      <TabPools />
    </View>
  ), []);
  const _TabPortfolio = React.useMemo(() => (
    <View tabID={TAB_PORTFOLIO_ID} label="My Portfolio" {...tabStyled}>
      <Portfolio />
      {!titleStr && (
        <BottomView
          title="History"
          onPress={() => {
            navigation.navigate(routeNames.LiquidityHistories);
          }}
        />
      )}
    </View>
  ), [titleStr]);
  return (
    <>
      <View style={mainStyle.container}>
        <Header title="Earn" accountSelectable hideBackButton={hideBackButton} />
        <HeaderView />
        <Tabs rootTabID={ROOT_TAB_HOME} styledTabs={styled.tab} defaultTabIndex={1}>
          {_TabPools}
          {_TabPortfolio}
        </Tabs>
      </View>
      <NFTTokenBottomBar />
    </>
  );
};

Home.defaultProps = {
  hideBackButton: false
};

Home.propTypes = {
  hideBackButton: PropTypes.bool
};

export default withHome(React.memo(Home));
