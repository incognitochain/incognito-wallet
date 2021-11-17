import { Text, View } from '@src/components/core';
import React, { useState } from 'react';
import AppUpdater from '@components/AppUpdater/index';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { useSelector } from 'react-redux';
import CurrencySection from '@screens/Setting/features/CurrencySection/CurrencySection';
import RemoveStorage from '@screens/Setting/features/RemoveStorage/RemoveStorage';
import ConvertCoinsSection from '@screens/Setting/features/ConvertCoinsSection';
import DeviceInfo from 'react-native-device-info';
import { SafeAreaView, ScrollView } from 'react-native';
import { NetworkIcon, SecurityIcon } from '@components/Icons';
import { Header } from '@src/components';
import codePush from 'react-native-code-push';
import PINSection from './features/PINSection';
import SeparatorSection from './features/SeparatorSection';
import DevSection from './features/DevSection';
import UTXOSection from './features/UTXOSection';
import { settingStyle } from './Setting.styled';
import AddressBookSection from './features/AddressBookSection';
import { SectionItem } from './features/Section';
import { settingSelector } from './Setting.selector';
import { actionFetchServers } from './Setting.actions';
import withSetting from './Setting.enhance';
import DecimalDigitsSection from './features/DecimalDigitsSection';
import ExportCSVSection from './features/ExportCSVSection';
import RemoveBalanceCached from './features/RemoveBalanceCached';
import PayFeeByPRV from './features/PayFeeByPRV';

const Setting = () => {
  const navigation = useNavigation();
  const showHeader = useNavigationParam('showHeader');
  const { server } = useSelector(settingSelector);
  const [codepushVersion, setCodepushVersion] = useState('');
  const sectionItemFactories = [
    {
      title: 'Network',
      desc: `${server?.name || 'Change default server'}`,
      subDesc: `${server?.address || '---'}`,
      handlePress: () =>
        navigation?.navigate(routeNames.NetworkSetting, {
          onReloadedNetworks: actionFetchServers,
        }),
      icon: <NetworkIcon />,
    },
    {
      title: 'Tickets',
      desc: 'Manage your tickets',
      handlePress: () => navigation?.navigate(routeNames.NFTToken),
      icon: <SecurityIcon />,
    },
  ];

  const handlePressExportCSV = () => {
    navigation?.navigate(routeNames.ExportCSV);
  };

  const getCodePushVer = async () => {
    const { label } = (await codePush.getUpdateMetadata()) || {};
    if (label) {
      setCodepushVersion(label);
    }
  };

  React.useEffect(() => {
    getCodePushVer().then();
  }, []);

  return (
    <SafeAreaView>
      {!!showHeader && (
        <Header title="Setting" style={{ paddingHorizontal: 25 }} />
      )}
      <ScrollView
        style={{ paddingHorizontal: 25 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {sectionItemFactories.map((item) => (
            <SectionItem data={item} key={`${item.title} ${item.desc}`} />
          ))}
          <PayFeeByPRV />
          <PINSection />
          <SeparatorSection />
          <DecimalDigitsSection />
          <CurrencySection />
          <AddressBookSection />
          <ExportCSVSection handlePress={handlePressExportCSV} />
          <UTXOSection />
          <ConvertCoinsSection />
          <RemoveStorage />
          <RemoveBalanceCached />
          {global.isDebug() && <DevSection />}
        </View>
        <Text style={[settingStyle.textVersion]}>
          {`v${AppUpdater.appVersion}${
            global.isDebug() ? ` (${DeviceInfo.getBuildNumber()})` : ''
          }`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default withSetting(Setting);
