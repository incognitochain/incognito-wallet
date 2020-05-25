import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { accountSeleclor } from '@src/redux/selectors';
import { COLORS, FONT } from '@src/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { ButtonBasic } from '@src/components/Button';

const styled = StyleSheet.create({
  container: {
    backgroundColor: COLORS.colorGrey,
    paddingHorizontal: 11,
    height: 40,
  },
  name: {
    marginRight: 5,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.NORMALIZE(FONT.FONT_SIZES.regular - 1),
    color: COLORS.black,
    maxWidth: 100,
  },
  hook: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const BtnSelectAccount = () => {
  const account = useSelector(accountSeleclor.defaultAccountSelector);
  const navigation = useNavigation();
  const onNavSelectAccount = () =>
    navigation.navigate(routeNames.SelectAccount);
  return (
    <ButtonBasic
      onPress={onNavSelectAccount}
      customContent={(
        <View style={styled.hook}>
          <Text numberOfLines={1} style={styled.name}>
            {account?.accountName}
          </Text>
          <Ionicons name="ios-arrow-down" color={COLORS.black} size={13} />
        </View>
      )}
      btnStyle={styled.container}
    />
  );
};

BtnSelectAccount.propTypes = {};

export default BtnSelectAccount;
