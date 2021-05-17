import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { accountSelector } from '@src/redux/selectors';
import { COLORS, FONT } from '@src/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { ButtonBasic } from '@src/components/Button';
import { listAllMasterKeyAccounts } from '@src/redux/selectors/masterKey';
import { switchMasterKey } from '@src/redux/actions/masterKey';
import accountService from '@services/wallet/accountService';

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

const SelectAccountButton = ({ ignoredAccounts }) => {
  const account = useSelector(accountSelector.defaultAccountSelector);
  const accounts = useSelector(listAllMasterKeyAccounts);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const onNavSelectAccount = () =>
    navigation.navigate(routeNames.SelectAccount, {
      ignoredAccounts,
    });

  const checkAccount = async () => {
    if (ignoredAccounts.includes(account.name.toLowerCase())) {
      const accountNames = accounts.map(item => item.accountName);
      const validAccounts = accountNames.filter(name => !ignoredAccounts.includes(name.toLowerCase()));
      if (validAccounts && validAccounts.length) {
        await dispatch(switchMasterKey(validAccounts[0].MasterKeyName, accountService.getAccountName(validAccounts[0])));
      }
    }
  };

  React.useEffect(() => {
    checkAccount();
  }, []);

  return (
    <View style={styled.container}>
      <ButtonBasic
        onPress={onNavSelectAccount}
        customContent={(
          <View style={styled.hook}>
            <Text numberOfLines={1} style={styled.name} ellipsizeMode="tail">
              {account?.accountName}
            </Text>
            <Ionicons name="ios-arrow-down" color={COLORS.black} size={13} />
          </View>
        )}
        btnStyle={styled.btnStyle}
      />
    </View>
  );
};

SelectAccountButton.propTypes = {
  ignoredAccounts: PropTypes.array,
};

SelectAccountButton.defaultProps = {
  ignoredAccounts: []
};

export default SelectAccountButton;
