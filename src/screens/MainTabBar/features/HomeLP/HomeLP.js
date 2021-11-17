import React, {memo} from 'react';
import Home from '@screens/PDexV3/features/Home';
import withTab from '@screens/MainTabBar/MainTabBar.enhanceTab';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import appConstant from '@src/constants/app';
import AppMaintain from '@components/AppMaintain';

const TabHomeLP = () => {
  const [_, isDisabled] = useFeatureConfig(appConstant.DISABLED.LIQUIDITY);
  if (isDisabled) {
    return <AppMaintain />;
  }
  return (
    <Home hideBackButton />
  );
};

export default withTab(memo(TabHomeLP));
