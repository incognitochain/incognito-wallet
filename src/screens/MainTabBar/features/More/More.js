import React, { memo } from 'react';
import withTab from '@screens/MainTabBar/MainTabBar.enhanceTab';
import { TouchableOpacity, View } from 'react-native';
import { moreStyled, styled } from '@screens/MainTabBar/MainTabBar.styled';
import { useSelector, useDispatch } from 'react-redux';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { useNavigation } from 'react-navigation-hooks';
import appConstant from '@src/constants/app';
import { CONSTANT_CONFIGS } from '@src/constants';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import routeNames from '@routers/routeNames';
import {
  CommunityIcon,
  ExplorerIcon,
  FaucetIcon,
  KeyChainIcon,
  MintIcon,
  PowerIcon,
  ProvideIcon,
  ReportIcon,
  ConsolidateIcon, UTubeIcon,
  MailIcon
} from '@components/Icons';
import { Header, Row } from '@src/components';
import { ScrollViewBorder, Text, View5 } from '@src/components/core';
import PropTypes from 'prop-types';
import { VectorSettingColor } from '@components/Icons/icon.setting';
import { compose } from 'recompose';
import { withLayout_2 } from '@components/Layout';
import { actionConditionConsolidate } from '@screens/Streamline';

const Categories = [
  {
    data: [
      {
        route: routeNames.PoolV2,
        label: 'Provide',
        icon: ProvideIcon,
        key: appConstant.DISABLED.PROVIDE,
      },
      {
        route: routeNames.Node,
        label: 'Power',
        icon: PowerIcon,
        key: appConstant.DISABLED.NODE,
      },
      {
        route: routeNames.CreateToken,
        label: 'Mint',
        icon: MintIcon,
        key: appConstant.DISABLED.MINT,
      },
      {
        route: routeNames.Community,
        label: routeNames.Community,
        icon: CommunityIcon,
        key: appConstant.DISABLED.COMMUNITY,
        params: {
          showHeader: true,
        },
      },
      {
        route: routeNames.Keychain,
        label: routeNames.Keychain,
        icon: KeyChainIcon,
        key: appConstant.DISABLED.KEY_CHAIN,
      },
      {
        route: routeNames.Setting,
        label: routeNames.Setting,
        icon: VectorSettingColor,
        key: appConstant.DISABLED.SETTING,
        params: {
          showHeader: true,
        },
      },
      {
        route: routeNames.ExportCSV,
        label: 'CSV Export',
        icon: ReportIcon,
        key: appConstant.DISABLED.EXPORT_CSV,
        params: {
          showHeader: true,
        },
      },
      {
        route: routeNames.SelectTokenStreamline,
        label: 'Consolidate',
        icon: ConsolidateIcon,
        key: appConstant.DISABLED.CONSOLIDATE,
        params: {
          showHeader: true,
        },
      },
      {
        route: routeNames.Tutorial,
        label: 'Tutorial',
        icon: UTubeIcon,
      },
      {
        route: routeNames.pApp,
        label: 'Explorer',
        icon: ExplorerIcon,
        key: appConstant.DISABLED.EXPLORER,
        params: {
          url: CONSTANT_CONFIGS.EXPLORER_CONSTANT_CHAIN_URL,
        },
      },
      // {
      //   route: routeNames.WebView,
      //   label: 'Faucet',
      //   icon: FaucetIcon,
      //   key: appConstant.DISABLED.FAUCET,
      // },
      {
        route: routeNames.WebView,
        label: 'Support',
        icon: MailIcon,
        key: appConstant.DISABLED.SUPPORT,
      },
    ],
  },
];

const CategoryItem = ({ item }) => {
  const dispatch = useDispatch();
  const account = useSelector(defaultAccountSelector);
  const navigation = useNavigation();
  let params;
  const onButtonPress = () => {
    switch (item.key) {
      case appConstant.DISABLED.FAUCET:
        params = {
          url:
            CONSTANT_CONFIGS.FAUCET_URL + `address=${account.paymentAddress}`,
        };
        break;
      case appConstant.DISABLED.CONSOLIDATE:
        dispatch(actionConditionConsolidate());
        break;
      case appConstant.DISABLED.SUPPORT:
        params = {
          url: 'https://we.incognito.org/g/support',
        };
        break;
      default:
        params = item.params;
    }
    return navigation.navigate(item.route, params);
  };
  const [onFeaturePress, isDisabled] = useFeatureConfig(
    item.key,
    onButtonPress,
  );
  const Icon = item.icon;
  return (
    <TouchableOpacity
      style={[moreStyled.category, isDisabled && { opacity: 0.7 }]}
      onPress={onFeaturePress}
    >
      <View5 style={moreStyled.wrapIcon}>
        <Icon />
      </View5>
      <Text style={moreStyled.regularBlack}>{item.label}</Text>
    </TouchableOpacity>
  );
};

const TabAssets = () => {
  const renderCategory = (item) => (
    <CategoryItem item={item} key={item.label} />
  );
  const renderSections = (item) => (
    <View style={moreStyled.wrapCategory} key={item.label}>
      <Row style={{ flexWrap: 'wrap' }}>{item.data.map(renderCategory)}</Row>
    </View>
  );
  return (
    <>
      <Header
        title="Privacy Services"
        hideBackButton
        titleStyled={moreStyled.title}
      />
      <ScrollViewBorder>{Categories.map(renderSections)}</ScrollViewBorder>
    </>
  );
};

CategoryItem.propTypes = {
  item: PropTypes.object.isRequired,
};

export default compose(withTab, withLayout_2)(memo(TabAssets));
