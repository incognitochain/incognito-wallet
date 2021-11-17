import React, {memo} from 'react';
import Shield from '@screens/Shield';
import withTab from '@screens/MainTabBar/MainTabBar.enhanceTab';
import AppMaintain from '@components/AppMaintain';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import appConstant from '@src/constants/app';

const TabShield = () => {
  const [_, isDisabled] = useFeatureConfig(appConstant.DISABLED.SHIELD);
  if (isDisabled) {
    return  <AppMaintain />;
  }
  return (
    <Shield hideBackButton />
  );
};

export default withTab(memo(TabShield));
