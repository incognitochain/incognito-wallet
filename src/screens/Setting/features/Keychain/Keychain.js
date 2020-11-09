import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import { settingSelector } from '@screens/Setting/Setting.selector';
import AccountSection from '@screens/Setting/features/AccountSection';
import routeNames from '@src/router/routeNames';
import { SectionItem } from '@screens/Setting/features/Section';
import {
  currentMasterKeySelector,
  masterlessKeyChainSelector,
} from '@src/redux/selectors/masterKey';
import MainLayout from '@components/MainLayout/index';
import withKeychain from './Keychain.enhance';
import RightBtn from './RightBtn';
import BtnInfo from './BtnInfo';

const styled = StyleSheet.create({
  extra: {
    flex: 1,
    paddingHorizontal: 25,
  },
  wrapper: {
    flex: 1,
  },
});

const Keychain = () => {
  const navigation = useNavigation();
  const { devices } = useSelector(settingSelector);
  const masterKey = useSelector(currentMasterKeySelector);
  const masterlessKey = useSelector(masterlessKeyChainSelector);

  const isMasterless = masterKey === masterlessKey;

  const sectionItemFactories = [];

  if (!isMasterless) {
    sectionItemFactories.push({
      title: 'Create',
      desc: `Create a new keychain in ${masterKey?.name}`,
      handlePress: () => navigation.navigate(routeNames.CreateAccount),
    });
  }

  if (isMasterless) {
    sectionItemFactories.push({
      title: 'Import a keychain',
      desc: 'Using an existing private key',
      handlePress: () => navigation.navigate(routeNames.ImportAccount),
    });

    sectionItemFactories.push({
      title: 'Back up',
      desc: 'Back up all masterless private keys',
      handlePress: () => navigation.navigate(routeNames.BackupKeys),
    });
  } else {
    sectionItemFactories.push({
      title: `Back up ${masterKey.name}`,
      desc: `Get master key phrase to back up all ${masterKey.name} keychains`,
      handlePress: () => navigation.navigate(routeNames.MasterKeyPhrase, { data: { ...masterKey, isBackUp: true } }),
    });

    sectionItemFactories.push({
      title: 'Import a keychain',
      desc: 'Using an existing private key',
      handlePress: () => navigation.navigate(routeNames.ImportAccount),
    });
  }

  return (
    <MainLayout
      header="Keychain"
      scrollable
      rightHeader={<RightBtn title={masterKey.name} />}
      customHeaderTitle={<BtnInfo />}
      noPadding
    >
      <View style={styled.wrapper}>
        <AccountSection
          devices={devices}
          label={isMasterless ? 'Masterless keychains' : 'Your keychains'}
        />
        <View style={styled.extra}>
          {sectionItemFactories.map((item) => (
            <SectionItem data={item} key={item.PrivateKey} />
          ))}
        </View>
      </View>
    </MainLayout>
  );
};

Keychain.propTypes = {};

export default withKeychain(Keychain);
