import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import _ from 'lodash';
import MainLayout from '@components/MainLayout';
import { Text, TouchableOpacity } from '@components/core';
import { THEME } from '@src/styles';
import AsyncStorage from '@react-native-community/async-storage';
import Row from '@components/Row';

const styles = StyleSheet.create({
  item: {
    ...THEME.text.mediumTextStyle,
    marginBottom: 20,
  },
});

const ManageStorage = () => {
  const [items, setItems] = useState([]);

  const loadItems = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const newItems = [];
    for (const key of keys) {
      const data = await AsyncStorage.getItem(key);
      newItems.push({
        key,
        data: data?.length,
      });
    }

    setItems(_.orderBy(newItems, item => item.data, 'desc'));
  };

  const handleRemove = (key) => {
    AsyncStorage.removeItem(key);

    const newItems = _.remove(items, item => item.key !== key);
    setItems(newItems);
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <MainLayout header="Manage storage" scrollable>
      {items.map(item => (
        <Row spaceBetween center style={styles.item}>
          <Text>{item.key} ({item.data})</Text>
          <TouchableOpacity onPress={() => handleRemove(item.key)}>
            <Text>Remove</Text>
          </TouchableOpacity>
        </Row>
      ))}
    </MainLayout>
  );
};

export default ManageStorage;
