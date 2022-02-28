import React, {memo} from 'react';
import { ScrollView } from 'react-native';
import {groupMasterless} from '@src/redux/selectors/masterKey';
import GroupItem from '@screens/SelectAccount/SelectAccount.groupItem';
import AccountItem from '@screens/SelectAccount/SelectAccount.item';
import {useNavigationParam} from 'react-navigation-hooks';
import {EmptyBookIcon} from '@components/Icons';
import useDebounceSelector from '@src/shared/hooks/debounceSelector';

const Masterless = () => {
  const groupAccounts = useDebounceSelector(groupMasterless);
  const handleSelectedAccount = useNavigationParam('handleSelectedAccount');
  if (!groupAccounts || groupAccounts.length === 0) return <EmptyBookIcon message="You don't have any masterless keychains on this device. To create or import a keychain, please tap the More icon on the navigation bar and select Keychain." />;
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
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 25 }}>
      {groupAccounts.map((item, index) => (
        <GroupItem
          name={item.name}
          key={item.name}
          isDefaultExpand
          isLast={index === (groupAccounts.length - 1)}
          child={item.child.map(renderItem)}
        />
      ))}
    </ScrollView>
  );
};

Masterless.propTypes = {};

export default memo(Masterless);
