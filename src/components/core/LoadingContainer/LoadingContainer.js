import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from '@src/components/core';

const styled = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const LoadingContainer = (props) => {
  return (
    <View style={styled.container}>
      <ActivityIndicator size={props?.size} />
    </View>
  );
};

export default React.memo(LoadingContainer);
