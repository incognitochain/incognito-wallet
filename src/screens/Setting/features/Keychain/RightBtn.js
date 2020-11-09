import React from 'react';
import { StyleSheet } from 'react-native';
import { RoundCornerButton } from '@src/components/core';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import { COLORS, THEME } from '@src/styles';

const styled = StyleSheet.create({
  btn: {
    width: 100,
    backgroundColor: COLORS.lightGrey19,
    height: 40,
  },
  title: {
    ...THEME.text.mediumText,
    fontSize: 15,
  }
});

const RightBtn = ({ title }) => {
  const navigation = useNavigation();
  const handlePress = React.useCallback(() => {
    navigation.navigate(routeNames.MasterKeys);
  }, []);
  return (
    <RoundCornerButton
      style={styled.btn}
      title={title}
      titleStyle={styled.title}
      onPress={handlePress}
    />
  );
};

export default React.memo(RightBtn);
