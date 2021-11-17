import React, {memo} from 'react';
import Trade from '@screens/PDexV3/features/Trade';
import withTab from '@screens/MainTabBar/MainTabBar.enhanceTab';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import appConstant from '@src/constants/app';
import AppMaintain from '@components/AppMaintain';

const TabTrade = () => {
  const [_, isDisabled] = useFeatureConfig(appConstant.DISABLED.TRADE);
  if (isDisabled) {
    return <AppMaintain />;
  }
  return (
    <Trade hideBackButton />
  );
};

export default withTab(memo(TabTrade));
