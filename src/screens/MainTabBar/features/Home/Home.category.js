import React, {memo} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import routeNames from '@routers/routeNames';
import {Row} from '@src/components';
import {homeStyled} from '@screens/MainTabBar/MainTabBar.styled';
import {
  CircleArrowIcon,
  ShieldIcon,
  TradeIcon,
  StakeIcon,
  ExplorerIcon,
  FaucetIcon,
  MintIcon,
  KeyChainIcon, PowerIcon, ProvideIcon, CommunityIcon
} from '@components/Icons';
import PropTypes from 'prop-types';
import appConstant from '@src/constants/app';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import {useNavigation} from 'react-navigation-hooks';
import {CONSTANT_CONFIGS} from '@src/constants';
import {useSelector} from 'react-redux';
import {defaultAccountSelector} from '@src/redux/selectors/account';

const MainCategories = [
  {
    route: routeNames.Shield,
    label: routeNames.Shield,
    desc: 'Anonymize coins',
    icon: ShieldIcon,
    key: appConstant.DISABLED.SHIELD,
  },
  {
    route: routeNames.Trade,
    label: routeNames.Trade,
    desc: 'Buy & sell privately',
    style: { marginLeft: 8 },
    icon: TradeIcon,
    key: appConstant.DISABLED.TRADE
  }
];

const Categories = [
  [
    {
      route: routeNames.Staking,
      label: routeNames.Staking,
      icon: StakeIcon,
      key: appConstant.DISABLED.STAKING_PDEX3
    },
    {
      route: routeNames.PoolV2,
      label: 'Provide',
      icon: ProvideIcon,
      key: appConstant.DISABLED.PROVIDE
    },
    {
      route: routeNames.Node,
      label: routeNames.Node,
      icon: PowerIcon,
      key: appConstant.DISABLED.NODE
    },
    {
      route: routeNames.Keychain,
      label: routeNames.Keychain,
      icon: KeyChainIcon,
      key: appConstant.DISABLED.KEY_CHAIN
    }
  ],
  [
    {
      route: routeNames.CreateToken,
      label: 'Mint',
      icon: MintIcon,
      key: appConstant.DISABLED.MINT
    },
    {
      route: routeNames.WebView,
      label: 'Faucet',
      icon: FaucetIcon,
      key: appConstant.DISABLED.FAUCET
    },
    {
      route: routeNames.pApp,
      label: 'Explorer',
      icon: ExplorerIcon,
      key: appConstant.DISABLED.EXPLORER,
      params: {
        url: CONSTANT_CONFIGS.EXPLORER_CONSTANT_CHAIN_URL
      },
    },
    {
      route: routeNames.Community,
      label: routeNames.Community,
      icon: CommunityIcon,
      key: appConstant.DISABLED.COMMUNITY,
      params: {
        showHeader: true
      },
    }
  ]
];

const MainItem = ({ item }) => {
  const navigation = useNavigation();
  const onButtonPress = () => navigation.navigate(item.route);
  const [onFeaturePress, isDisabled] = useFeatureConfig(item.key, onButtonPress);
  const Icon = item.icon;
  return (
    <TouchableOpacity
      style={[homeStyled.mainCategory, homeStyled.shadow, item.style, isDisabled && { opacity: 0.7 }]}
      onPress={onFeaturePress}
    >
      <Text style={homeStyled.mediumBlack}>{item.label}</Text>
      <Text style={homeStyled.regularGray}>{item.desc}</Text>
      <Row style={homeStyled.rowImg} spaceBetween>
        <Icon size={41} active />
        <CircleArrowIcon />
      </Row>
    </TouchableOpacity>
  );
};

const CategoryItem = ({ item }) => {
  const account = useSelector(defaultAccountSelector);
  const navigation = useNavigation();
  let params;
  const onButtonPress = () => {
    switch (item.key) {
    case appConstant.DISABLED.FAUCET:
      params = {
        url: CONSTANT_CONFIGS.FAUCET_URL + `address=${account.paymentAddress}`
      };
      break;
    default:
      params = item.params;
    }
    return navigation.navigate(item.route, params);
  };
  const [onFeaturePress, isDisabled] = useFeatureConfig(item.key, onButtonPress);
  const Icon = item.icon;
  return (
    <TouchableOpacity
      style={[homeStyled.category, isDisabled && { opacity: 0.7 }]}
      onPress={onFeaturePress}
    >
      <View style={{ height: 32 }}>
        <Icon />
      </View>
      <Text style={homeStyled.regularBlack}>{item.label}</Text>
    </TouchableOpacity>
  );
};

const Category = () => {
  const renderMainCategory = (item) => <MainItem item={item} key={item.label} />;
  const renderCategory = (item) => <CategoryItem item={item} key={item.label} />;
  const renderSections = (categories, index) => (
    <Row style={[index !== 0 && homeStyled.paddingTopCategory]} key={`category-${index}`}>
      {categories.map(renderCategory)}
    </Row>
  );
  return (
    <View>
      <Row>
        {MainCategories.map(renderMainCategory)}
      </Row>
      <View style={[homeStyled.shadow, homeStyled.wrapCategory]}>
        {Categories.map(renderSections)}
      </View>
    </View>
  );
};

MainItem.propTypes = {
  item: PropTypes.object.isRequired
};

CategoryItem.propTypes = {
  item: PropTypes.object.isRequired
};

export default memo(Category);
