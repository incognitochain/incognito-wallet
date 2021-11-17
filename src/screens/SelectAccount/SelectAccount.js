import React, { memo } from 'react';
import { View } from 'react-native';
import { Header } from '@src/components';
import { TABS } from '@screens/SelectAccount/SelectAccount.constant';
import { Tabs } from '@components/core';
import MasterKeys from '@screens/SelectAccount/SelectAccount.masterkeys';
import Masterless from '@screens/SelectAccount/SelectAccount.masterless';
import Setting from '@screens/Setting';
import BtnInfo from '@screens/Setting/features/Keychain/BtnInfo';

const SelectAccount = () => {
  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Keychain"
        style={{ paddingHorizontal: 24 }}
        customHeaderTitle={<BtnInfo />}
      />
      <Tabs
        rootTabID={TABS.TAB_SELECT_ACCOUNT_ID}
        useTab1
        styledTabs={{ paddingHorizontal: 24 }}
      >
        <View tabID={TABS.TAB_SELECT_ACCOUNT_MASTER_KEY_ID} label="Master keys">
          <MasterKeys />
        </View>
        <View tabID={TABS.TAB_SELECT_ACCOUNT_MASTER_LESS_ID} label="Masterless">
          <Masterless />
        </View>
        <View tabID={TABS.TAB_SETTING_ID} label="Settings">
          <Setting />
        </View>
      </Tabs>
    </View>
  );
};

export default memo(SelectAccount);
