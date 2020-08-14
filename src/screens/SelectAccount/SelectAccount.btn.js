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
    minWidth: 80,
    maxWidth: 120,
  },
  btnStyle: {
    backgroundColor: COLORS.colorGrey,
    height: 40,
    paddingHorizontal: 15,
    width: '100%',
  },
  name: {
    fontFamily: FONT.NAME.medium,
    fontSize: 15,
    lineHeight: 19,
    color: COLORS.black,
    marginRight: 5,
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
    <View style={styled.container}>
      <ButtonBasic
        onPress={onNavSelectAccount}
        customContent={
          <View style={styled.hook}>
            <Text numberOfLines={1} style={styled.name} ellipsizeMode="tail">
              {account?.accountName}
            </Text>
            <Ionicons name="ios-arrow-down" color={COLORS.black} size={13} />
          </View>
        }
        btnStyle={styled.btnStyle}
      />
    </View>
  );
};

BtnSelectAccount.propTypes = {};

export default BtnSelectAccount;
