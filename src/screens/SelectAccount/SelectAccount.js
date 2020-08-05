import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { accountSeleclor } from '@src/redux/selectors';
import PropTypes from 'prop-types';
import {
  actionSwitchAccount,
  actionSwitchAccountFetching,
  actionSwitchAccountFetched,
} from '@src/redux/actions/account';
import Header, { useSearchBox } from '@src/components/Header';
import { withLayout_2 } from '@src/components/Layout';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import {
  defaultAccountNameSelector,
  switchAccountSelector,
} from '@src/redux/selectors/account';
import { Toast, TouchableOpacity } from '@src/components/core';
import { ExHandler } from '@src/services/exception';
import includes from 'lodash/includes';
import debounce from 'lodash/debounce';
import { styled, itemStyled } from './SelectAccount.styled';

const AccountItem = ({ accountName, PaymentAddress }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const onSelect = useNavigationParam('onSelect');
  const defaultAccountName = useSelector(defaultAccountNameSelector);
  const switchingAccount = useSelector(switchAccountSelector);
  if (!accountName) {
    return null;
  }
  const onSelectAccount = async () => {
    try {
      if (switchingAccount) {
        return;
      }

      if (!onSelect) {
        navigation.goBack();
      } else {
        onSelect();
      }

      await dispatch(actionSwitchAccountFetching());
      if (accountName === defaultAccountName) {
        Toast.showInfo(`Your current account is "${accountName}"`);
        return;
      }
      dispatch(actionSwitchAccount(accountName));
    } catch (e) {
      new ExHandler(
        e,
        `Can not switch to account "${accountName}", please try again.`,
      ).showErrorToast();
    } finally {
      dispatch(actionSwitchAccountFetched());
    }
  };
  const Component = () => (
    <View style={itemStyled.container}>
      <Text style={itemStyled.name} numberOfLines={1}>
        {accountName}
      </Text>
      <Text style={itemStyled.address} numberOfLines={1} ellipsizeMode="middle">
        {PaymentAddress}
      </Text>
    </View>
  );
  if (!switchingAccount) {
    return (
      <TouchableOpacity onPress={debounce(onSelectAccount, 100)}>
        <Component />
      </TouchableOpacity>
    );
  }
  return <Component />;
};

const ListAccount = ({ ignoredAccounts }) => {
  const listAccount = useSelector(accountSeleclor.listAccountSelector);
  const [result, keySearch] = useSearchBox({
    data: listAccount,
    handleFilter: () => [
      ...listAccount.filter(
        (account) =>
          !(ignoredAccounts.includes(account?.name.toLowerCase()) ||
            ignoredAccounts.includes(account?.accountName.toLowerCase())) &&
          (includes(account?.accountName.toLowerCase(), keySearch) ||
          includes(account?.name.toLowerCase(), keySearch)),
      ),
    ],
  });
  return (
    <ScrollView style={styled.scrollview} showsVerticalScrollIndicator={false}>
      {result.map((item) => (
        <AccountItem key={item?.accountName} {...item} />
      ))}
    </ScrollView>
  );
};

const SelectAccount = () => {
  const ignoredAccounts = useNavigationParam('ignoredAccounts') || [];
  return (
    <View style={styled.container}>
      <Header
        title="Search keychains"
        titleStyled={styled.titleStyled}
        canSearch
      />
      <ListAccount ignoredAccounts={ignoredAccounts} />
    </View>
  );
};

AccountItem.propTypes = {
  accountName: PropTypes.string.isRequired,
  PaymentAddress: PropTypes.string.isRequired,
};

ListAccount.propTypes = {
  ignoredAccounts: PropTypes.array.isRequired,
};

export default withLayout_2(SelectAccount);
