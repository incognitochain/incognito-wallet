import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import MainLayout from '@components/MainLayout';
import { BaseTextInput, RoundCornerButton } from '@components/core';
import AsyncStorage from '@react-native-community/async-storage';
import RNRestart from 'react-native-restart';

const styles = StyleSheet.create({
  button: {
    marginTop: 50,
  }
});

const RestoreAll = () => {
  const [data, setData] = useState([]);

  const handleRemove = (cb) => {
    AsyncStorage.clear(cb);
  };

  const handleAdd = () => {
    const items = JSON.parse(data);
    AsyncStorage.multiSet(items.map(item => [
      item.key,
      item.data,
    ]), () => {
      RNRestart.Restart();
    });
  };

  const handleRestore = async () => {
    const items = JSON.parse(data);

    if (items.length > 0) {
      handleRemove(handleAdd);
    }
  };

  return (
    <MainLayout header="Restore all" scrollable>
      <BaseTextInput
        onChangeText={setData}
      />
      <RoundCornerButton
        style={styles.button}
        title="Restore"
        onPress={handleRestore}
      />
    </MainLayout>
  );
};

export default RestoreAll;
