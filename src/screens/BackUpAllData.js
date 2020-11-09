import React, { useEffect, useState } from 'react';
import MainLayout from '@components/MainLayout';
import { LoadingContainer, RoundCornerButton, Text, Toast } from '@components/core';
import AsyncStorage from '@react-native-community/async-storage';
import { Clipboard, StyleSheet } from 'react-native';
import { THEME } from '@src/styles';

const styles = StyleSheet.create({
  text: {
    ...THEME.text.mediumTextMotto,
  },
  button: {
    marginTop: 50,
  }
});

const BackUpAllData = () => {
  const [data, setData] = useState('');

  const loadItems = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const newItems = [];
    for (const key of keys) {
      if (
        key.includes('-cached') ||
        key === 'Wallet' ||
        key === 'Wallet_Clone' ||
        key.includes('mainnet') ||
        key.includes('streamline') ||
        key.includes('persist')
      ) {
        continue;
      }

      const data = await AsyncStorage.getItem(key);

      newItems.push({
        key,
        data,
      });
    }

    const newData = JSON.stringify((newItems));
    setData(newData);
  };

  const handleCopy = async () => {
    Clipboard.setString(data);
    Toast.showInfo('Copied');
  };

  useEffect(() => {
    loadItems();
  }, []);

  if (!data) {
    return <LoadingContainer />;
  }

  return (
    <MainLayout header="Back up all" scrollable>
      <Text style={styles.text}>
        {data.length} bytes
      </Text>
      <RoundCornerButton
        style={styles.button}
        title="Copy"
        onPress={handleCopy}
      />
    </MainLayout>
  );
};

export default BackUpAllData;
