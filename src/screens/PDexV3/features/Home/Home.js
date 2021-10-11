import React from 'react';
import {Header, Row} from '@src/components';
import { Tabs } from '@src/components/core';
import Portfolio from '@src/screens/PDexV3/features/Portfolio';
import { View } from 'react-native';
import { batch, useDispatch, useSelector } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { TradingVol24h } from '@screens/PDexV3/features/Share';
import { liquidityActions } from '@screens/PDexV3/features/Liquidity';
import {styled as mainStyle} from '@screens/PDexV3/PDexV3.styled';
import {AddGroupIcon} from '@components/Icons';
import {activedTabSelector} from '@components/core/Tabs';
import ReturnLP from '@screens/PDexV3/features/Share/Share.returnLP';
import {PoolsList} from '@screens/PDexV3/features/Pools';
import {NFTTokenBottomBar} from '@screens/PDexV3/features/NFTToken';
import withHome from './Home.enhance';
import { ROOT_TAB_HOME, TAB_POOLS_ID, TAB_PORTFOLIO_ID } from './Home.constant';
import { styled } from './Home.styled';

const TabPools = React.memo(() => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const onNavigateContribute = (poolId) => {
    batch(() => {
      dispatch(liquidityActions.actionSetContributePoolID({ poolId }));
      navigation.navigate(routeNames.ContributePool);
    });
  };
  return (
    <PoolsList onPressPool={onNavigateContribute} />
  );
});

const HeaderView = React.memo(() => {
  const activedTab = useSelector(activedTabSelector)(ROOT_TAB_HOME);
  const navigation = useNavigation();
  const renderContent = () => {
    if (activedTab === TAB_PORTFOLIO_ID) return (
      <Row spaceBetween style={styled.headerRow}>
        <ReturnLP />
      </Row>
    );
    return (
      <Row spaceBetween style={styled.headerRow}>
        <TradingVol24h />
        <AddGroupIcon onPress={() => navigation.navigate(routeNames.CreatePool)} />
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

const Home = () => {
  return (
    <>
      <View style={mainStyle.container}>
        <Header title="Pools" accountSelectable />
        <HeaderView />
        <Tabs rootTabID={ROOT_TAB_HOME} styledTabs={styled.tab}>
          <View tabID={TAB_POOLS_ID} label="Pools" {...tabStyled}>
            <TabPools />
          </View>
          <View tabID={TAB_PORTFOLIO_ID} label="Your portfolio" {...tabStyled}>
            <Portfolio />
          </View>
        </Tabs>
      </View>
      <NFTTokenBottomBar />
    </>
  );
};

Home.propTypes = {
};

export default withHome(React.memo(Home));
