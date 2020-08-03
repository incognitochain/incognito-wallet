import { ScrollView, Text, View } from '@src/components/core';
import React from 'react';
import AppUpdater from '@components/AppUpdater/index';
import Header from '@src/components/Header';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { useSelector } from 'react-redux';
import PINSection from './features/PINSection';
import SeparatorSection from './features/SeparatorSection';
import DevSection from './features/DevSection';
import { settingStyle } from './Setting.styled';
import AddressBookSection from './features/AddressBookSection';
import { SectionItem } from './features/Section';
import { settingSelector } from './Setting.selector';
import { actionFetchServers } from './Setting.actions';
import withSetting from './Setting.enhance';
import DecimalDigitsSection from './features/DecimalDigitsSection';

const Setting = () => {
  const navigation = useNavigation();
  const { server } = useSelector(settingSelector);
  const sectionItemFactories = [
    {
      title: 'Network',
      desc: `${server?.name || 'Change default server'}`,
      subDesc: `${server?.address || '---'}`,
      handlePress: () =>
        navigation?.navigate(routeNames.NetworkSetting, {
          onReloadedNetworks: actionFetchServers,
        }),
    },
  ];

  return (
    <View style={settingStyle.container}>
      <Header title="Settings" style={settingStyle.header} />
      <ScrollView>
        <View style={settingStyle.extra}>
          {sectionItemFactories.map((item, id) => (
            <SectionItem data={item} key={id} />
          ))}
          <PINSection />
          <SeparatorSection />
          <DecimalDigitsSection />
          <AddressBookSection />
          {global.isDebug() && <DevSection />}
        </View>
        <Text style={settingStyle.textVersion}>
          {`v${AppUpdater.appVersion}`}
        </Text>
      </ScrollView>
    </View>
  );
};

Setting.propTypes = {};

export default withSetting(Setting);
