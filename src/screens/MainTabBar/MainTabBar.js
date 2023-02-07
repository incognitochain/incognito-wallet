import {
  AssetsIcon,
  LiquidityIcon,
  MarketIcon,
  MoreIcon,
  TradeIcon,
} from '@components/Icons';
import TabAssets from '@screens/MainTabBar/features/Assets';
import HomeLP from '@screens/MainTabBar/features/HomeLP';
import Market from '@screens/MainTabBar/features/Market';
import More from '@screens/MainTabBar/features/More';
import TabTrade from '@screens/MainTabBar/features/Trade';
import colors from '@src/styles/colors';
import { isIOS } from '@src/utils/platform';
import React from 'react';
import { Dimensions, Text } from 'react-native';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import { styled } from './MainTabBar.styled';

const { height } = Dimensions.get('window');

const isIPhoneHasDynamicIsland = isIOS && (height === 852 || height === 932);

const TabNavigator = createMaterialBottomTabNavigator(
  {
    Market: {
      screen: Market,
      navigationOptions: {
        tabBarIcon: ({ focused }) => <MarketIcon active={focused} />,
        tabBarLabel: <Text style={styled.label}>Markets</Text>,
      },
    },
    HomeLP: {
      screen: HomeLP,
      navigationOptions: {
        tabBarIcon: ({ focused }) => <LiquidityIcon active={focused} />,
        tabBarLabel: <Text style={styled.label}>Earn</Text>,
      },
    },
    Trade: {
      screen: TabTrade,
      navigationOptions: {
        tabBarIcon: ({ focused }) => <TradeIcon active={focused} />,
        tabBarLabel: <Text style={styled.label}>Trade</Text>,
      },
    },
    Assets: {
      screen: TabAssets,
      navigationOptions: {
        tabBarIcon: ({ focused }) => <AssetsIcon active={focused} />,
        tabBarLabel: <Text style={styled.label}>Wallet</Text>,
      },
    },
    // PrivacyApps: {
    //   screen: TabPrivacyApps,
    //   navigationOptions: {
    //     tabBarIcon: ({ focused }) => <PrivacyAppsIcon active={focused} />,
    //     tabBarLabel: <Text style={styled.label}>Apps</Text>,
    //   },
    // },
    More: {
      screen: More,
      navigationOptions: {
        tabBarIcon: ({ focused }) => <MoreIcon active={focused} />,
        tabBarLabel: <Text style={styled.label}>More</Text>,
      },
    },
  },
  {
    shifting: false,
    labeled: true,
    sceneAnimationEnabled: true,
    keyboardHidesNavigationBar: true,
    activeColor: colors.blue5,
    inactiveColor: colors.lightGrey36,
    barStyle: {
      borderTopWidth: 0,
      backgroundColor: '#1A1A1A',
      justifyContent: 'center',
      paddingBottom: isIPhoneHasDynamicIsland ? 34 : 0,
    },
  },
);

export default TabNavigator;
