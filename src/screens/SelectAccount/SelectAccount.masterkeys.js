import React, { memo } from 'react';
import { ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { RefreshControl } from '@src/components/core';
import {
  groupMasterKeys,
  isLoadingAllMasterKeyAccountSelector,
} from '@src/redux/selectors/masterKey';
import GroupItem from '@screens/SelectAccount/SelectAccount.groupItem';
import AccountItem from '@screens/SelectAccount/SelectAccount.item';
import { loadAllMasterKeyAccounts } from '@src/redux/actions/masterKey';
import { useNavigationParam } from 'react-navigation-hooks';
import useDebounceSelector from '@src/shared/hooks/debounceSelector';
import { defaultAccount } from '@src/redux/selectors/account';

const MasterKeys = () => {
  const groupAccounts = useDebounceSelector(groupMasterKeys);
  const loading = useDebounceSelector(isLoadingAllMasterKeyAccountSelector);
  const account = useDebounceSelector(defaultAccount);
  const handleSelectedAccount = useNavigationParam('handleSelectedAccount');
  const dispatch = useDispatch();
  const handleLoadAllMasterKeyAccounts = React.useCallback(() =>
    dispatch(loadAllMasterKeyAccounts()), []);
  const renderItem = React.useCallback((account) => (
    <AccountItem
      key={account?.ValidatorKey}
      accountName={account.AccountName}
      PaymentAddress={account.PaymentAddress}
      PrivateKey={account.PrivateKey}
      MasterKeyName={account.MasterKeyName}
      handleSelectedAccount={handleSelectedAccount}
    />
  ), []);

  const renderGroupAccounts = React.useCallback((item, index) => {
    const isDefaultExpand = (item.child || []).some(({ OTAKey }) => {
      return OTAKey === account.OTAKey;
    });
    return (
      <GroupItem
        name={item.name}
        key={item.name}
        isDefaultExpand={isDefaultExpand}
        isLast={index === groupAccounts.length - 1}
        child={item.child.map(renderItem)}
      />
    );
  }, [account.OTAKey]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={(
        <RefreshControl
          refreshing={loading}
          onRefresh={handleLoadAllMasterKeyAccounts}
        />
      )}
      contentContainerStyle={{ paddingHorizontal: 25 }}
    >
      {groupAccounts.map(renderGroupAccounts)}
    </ScrollView>
  );
};

MasterKeys.propTypes = {};

export default memo(MasterKeys);
