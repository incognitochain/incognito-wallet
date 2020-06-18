import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '@src/components/Header';
import { ScrollView } from '@src/components/core';
import { useSelector } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import { settingSelector } from '@screens/Setting/Setting.selector';
import AccountSection from '@screens/Setting/features/AccountSection';
import routeNames from '@src/router/routeNames';
import { SectionItem } from '@screens/Setting/features/Section';
import withKeychain from './Keychain.enhance';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  extra: {
    flex: 1,
    paddingHorizontal: 25,
  },
  header: {
    paddingHorizontal: 25,
  },
  wrapper: {
    marginTop: 22,
    flex: 1,
  },
});

const Keychain = () => {
  const navigation = useNavigation();
  const { devices } = useSelector(settingSelector);
  const sectionItemFactories = [
    {
      title: 'Create',
      desc: 'Create a new keychain',
      handlePress: () => navigation.navigate(routeNames.CreateAccount),
    },
    {
      title: 'Import',
      desc: 'Import an existing keychain',
      handlePress: () => navigation.navigate(routeNames.ImportAccount),
    },
    {
      title: 'Back up',
      desc: 'Back up your private keys',
      handlePress: () => navigation.navigate(routeNames.BackupKeys),
    },
  ];
  return (
    <View style={styled.container}>
      <Header title="Keychain" style={styled.header} />
      <ScrollView>
        <View style={styled.wrapper}>
          <AccountSection devices={devices} />
          <View style={styled.extra}>
            {sectionItemFactories.map((item, id) => (
              <SectionItem data={item} key={id} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

Keychain.propTypes = {};

export default withKeychain(Keychain);
