import React, {memo} from 'react';
import Wallet from '@screens/Wallet/features/Home/Wallet';
import withTab from '@screens/MainTabBar/MainTabBar.enhanceTab';
import withHome from '@screens/MainTabBar/features/Home/Home.enhance';
import {compose} from 'recompose';

const TabAssets = () => {
  return (
    <Wallet hideBackButton />
  );
};

export default compose(
  withHome,
  withTab
)(memo(TabAssets));
