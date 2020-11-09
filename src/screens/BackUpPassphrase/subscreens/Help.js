import React from 'react';
import { StyleSheet } from 'react-native';
import MainLayout from '@components/MainLayout';
import { Text, View } from '@components/core';
import { COLORS, FONT, THEME } from '@src/styles';

const styles = StyleSheet.create({
  content: {
    marginTop: 25,
  },
  title: {
    ...THEME.text.boldTextStyleMedium,
    lineHeight: 25,
  },
  desc: {
    ...THEME.text.regularSizeMediumFontGrey,
    lineHeight: 25,
  },
  bold: {
    ...FONT.STYLE.bold,
    color: COLORS.black,
  },
});

const content = [
  {
    title: 'Master key',
    desc:
  <Text style={styles.desc}>
    A master key will allow you to recover all associated keychains and their keys, using a secret 12 words phrase. You <Text style={[styles.desc, styles.bold]}>must</Text> keep the master key phrase safe – it’s the only way to ensure no one but you can access your funds.
  </Text>,
  },
  {
    title: 'Keychain',
    desc: 'Each keychain is comprised of several essential keys, much like your car key or house key. The payment key allows you to receive funds, the validator key allows you to run a Node, and the private key – the most important key in any keychain – allows you to recover all other keys in that keychain.\n\nIf you need more than one payment address, or want to run more than one Node, simply generate new keychains.',
  },
  {
    title: 'Be safe',
    desc: 'A private key will restore its keychain, and a master key phrase will restore all its associated keychains. Anyone who gains access to these, gains access to your funds. So keep them safe.',
  }
];

const KeysExplained = () => {
  return (
    <MainLayout header="Keys explained" scrollable>
      <Text style={styles.desc}>
        Different keys enable different access and actions.
      </Text>
      {content.map(item => (
        <View style={styles.content} key={item.title}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.desc}</Text>
        </View>
      ))}
    </MainLayout>
  );
};

export default KeysExplained;
