import React, { memo } from 'react';
import { Header } from '@src/components';
import { TABS } from '@screens/SelectAccount/SelectAccount.constant';
import { Tabs , View } from '@components/core';
import MasterKeys from '@screens/SelectAccount/SelectAccount.masterkeys';
import Masterless from '@screens/SelectAccount/SelectAccount.masterless';
import BtnInfo from '@screens/Setting/features/Keychain/BtnInfo';
import { View2 } from '@components/core/View';
import globalStyled from '@src/theme/theme.styled';
import withLazy from '@components/LazyHoc/LazyHoc';

const SelectAccount = () => {
  return (
    <View2 fullFlex>
      <Header title="Keychain" customHeaderTitle={<BtnInfo />} />
      <Tabs
        rootTabID={TABS.TAB_SELECT_ACCOUNT_ID}
        borderTop={false}
        styledTabs={globalStyled.defaultPadding4}
      >
        <View tabID={TABS.TAB_SELECT_ACCOUNT_MASTER_KEY_ID} label="Master keys">
          <MasterKeys />
        </View>
        <View tabID={TABS.TAB_SELECT_ACCOUNT_MASTER_LESS_ID} label="Masterless">
          <Masterless />
        </View>
      </Tabs>
    </View2>
  );
};

export default withLazy(memo(SelectAccount));
