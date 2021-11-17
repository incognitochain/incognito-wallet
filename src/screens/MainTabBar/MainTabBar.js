import React from 'react';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import { COLORS } from '@src/styles';
import More from '@screens/MainTabBar/features/More';
import TabAssets from '@screens/MainTabBar/features/Assets';
import TabTrade from '@screens/MainTabBar/features/Trade';
import TabHomeLP from '@screens/MainTabBar/features/HomeLP';
import {
  MoreIcon,
  TradeIcon,
  LiquidityIcon,
  AssetsIcon,
} from '@components/Icons';
import { View, Text } from 'react-native';
import { styled } from './MainTabBar.styled';

const TabNavigator = createMaterialBottomTabNavigator(
  {
    Assets: {
      screen: TabAssets,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => (
          <View style={styled.wrapBar}>
            <AssetsIcon active={focused} />
            <Text style={[styled.label, { color: tintColor }]}>Portfolio</Text>
          </View>
        ),
        activeColor: COLORS.colorBlue,
        inactiveColor: COLORS.lightGrey34,
      },
    },
    Trade: {
      screen: TabTrade,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => (
          <View style={styled.wrapBar}>
            <View style={{ height: 24 }}>
              <TradeIcon active={focused} />
            </View>
            <Text style={[styled.label, { color: tintColor }]}>Trade</Text>
          </View>
        ),
      },
    },
    Liquidity: {
      screen: TabHomeLP,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => (
          <View style={styled.wrapBar}>
            <LiquidityIcon active={focused} />
            <Text style={[styled.label, { color: tintColor }]}>Earn</Text>
          </View>
        ),
      },
    },
    More: {
      screen: More,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => (
          <View style={styled.wrapBar}>
            <MoreIcon active={focused} />
            <Text style={[styled.label, { color: tintColor }]}>More</Text>
          </View>
        ),
      },
    }
  },
  {
    initialRouteName: 'Assets',
    activeColor: COLORS.colorBlue,
    inactiveColor: COLORS.lightGrey34,
    barStyle: {
      backgroundColor: COLORS.white,
    },
    shifting: false,
    labeled: false,
  },
);

export default TabNavigator;
