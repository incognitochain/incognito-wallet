import React from 'react';
import toLower from 'lodash/toLower';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { accountSelector } from '@src/redux/selectors';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { listAllMasterKeyAccounts } from '@src/redux/selectors/masterKey';
import { switchMasterKey } from '@src/redux/actions/masterKey';
import accountService from '@services/wallet/accountService';
import { WalletIcon } from './Icons';
import { TouchableOpacity } from './core';

const styled = StyleSheet.create({
  btnStyle: {},
});

const SelectAccountButton = ({
  ignoredAccounts,
  disabled,
  handleSelectedAccount,
}) => {
  const account = useSelector(accountSelector.defaultAccountSelector);
  const accounts = useSelector(listAllMasterKeyAccounts);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const onNavSelectAccount = () => {
    if (disabled) return;
    navigation.navigate(routeNames.SelectAccount, {
      ignoredAccounts,
      handleSelectedAccount,
    });
  };
  const checkAccount = async () => {
    try {
      if (ignoredAccounts.includes(toLower(account?.name))) {
        const accountNames = accounts.map((item) => item.accountName);
        const validAccounts = accountNames.filter(
          (name) => !ignoredAccounts.includes(toLower(name)),
        );
        if (validAccounts && validAccounts.length) {
          await dispatch(
            switchMasterKey(
              validAccounts[0].MasterKeyName,
              accountService.getAccountName(validAccounts[0]),
            ),
          );
        }
      }
    } catch (error) {
      console.log('CHECK ACCOUNT ERROR', error);
    }
  };
  React.useEffect(() => {
    checkAccount();
  }, []);
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onNavSelectAccount}
      style={styled.btnStyle}
    >
      <WalletIcon />
    </TouchableOpacity>
  );
};

SelectAccountButton.propTypes = {
  ignoredAccounts: PropTypes.array,
  disabled: PropTypes.bool,
  handleSelectedAccount: PropTypes.func,
};

SelectAccountButton.defaultProps = {
  ignoredAccounts: [],
  disabled: false,
};

export default SelectAccountButton;
