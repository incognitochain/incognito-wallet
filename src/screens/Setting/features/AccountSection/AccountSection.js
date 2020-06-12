import {
  Alert,
  Text,
  Toast,
  TouchableOpacity,
  View,
} from '@src/components/core';
import { removeAccount, switchAccount } from '@src/redux/actions/account';
import { accountSeleclor } from '@src/redux/selectors';
import ROUTE_NAMES from '@src/router/routeNames';
import { ExHandler } from '@src/services/exception';
import { COLORS } from '@src/styles';
import { onClickView } from '@src/utils/ViewUtil';
import dexUtils from '@src/utils/dex';
import PropTypes from 'prop-types';
import React from 'react';
import Swipeout from 'react-native-swipeout';
import { connect, useSelector } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import { BtnExport } from '@src/components/Button';
import Section, { sectionStyle } from '@screens/Setting/features/Section';
import { isStakeAccount } from '@screens/Stake/stake.utils';
import { settingSelector } from '@screens/Setting/Setting.selector';
import { accountSection } from './AccountSection.styled';

let lastAccount;
let clickedTime = 0;

function isDev(account) {
  if (lastAccount !== account) {
    clickedTime = 0;
  }
  lastAccount = account;
  clickedTime++;

  if (clickedTime === 7) {
    global.isDEV = true;
  }
}

function isNodeAccount(name, devices) {
  return devices.find(
    (device) => device.IsPNode && device.AccountName === name,
  );
}

const createItem = (
  account,
  onSwitch,
  onExport,
  onDelete,
  isActive,
  lastChild = false,
) => (
  <Swipeout
    style={accountSection.swipeoutButton}
    right={[
      ...(onDelete
        ? [
          {
            text: 'Delete',
            backgroundColor: COLORS.red,
            onPress: () => onDelete(account),
          },
        ]
        : []),
    ]}
  >
    <View
      style={[
        sectionStyle.subItem,
        accountSection.subItem,
        lastChild && accountSection.lastSubItem,
      ]}
    >
      <TouchableOpacity
        style={accountSection.name}
        onPress={() => onSwitch(account) && isDev(account)}
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={[
            sectionStyle.desc,
            { marginTop: 0 },
            isActive && accountSection.nameTextActive,
          ]}
        >
          {account?.name}
        </Text>
      </TouchableOpacity>
      <BtnExport onPress={() => onExport(account)} />
    </View>
  </Swipeout>
);

const AccountSection = ({
  defaultAccount,
  listAccount,
  removeAccount,
  switchAccount,
}) => {
  const { devices } = useSelector(settingSelector);
  const navigation = useNavigation();
  const onHandleSwitchAccount = onClickView(async (account) => {
    try {
      if (defaultAccount?.name === account?.name) {
        Toast.showInfo(`Your current keychain is "${account?.name}"`);
        return;
      }

      await switchAccount(account?.name);

      Toast.showInfo(`Switched to keychain "${account?.name}"`);
    } catch (e) {
      new ExHandler(
        e,
        `Can not switch to keychain "${account?.name}", please try again.`,
      ).showErrorToast();
    }
  });

  const handleExportKey = (account) => {
    navigation.navigate(ROUTE_NAMES.ExportAccount, { account });
  };

  const handleDelete = (account) => {
    Alert.alert(
      `Delete keychain "${account?.name}"?`,
      'Do you want to delete this keychain?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK, delete it',
          onPress: async () => {
            try {
              await removeAccount(account);
              Toast.showSuccess('Keychain removed.');
            } catch (e) {
              new ExHandler(
                e,
                `Can not delete keychain ${account?.name}, please try again.`,
              ).showErrorToast();
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  const isDeletable = (account) =>
    listAccount.length > 1 &&
    !dexUtils.isDEXAccount(account?.name) &&
    !isNodeAccount(account?.name, devices) &&
    !isStakeAccount(account);

  return (
    <Section
      label="Your keychains"
      labelStyle={accountSection.labelStyle}
      customItems={listAccount?.map((account, index) => (
        <View key={account?.name} style={accountSection.itemWrapper}>
          {account?.name &&
            createItem(
              account,
              onHandleSwitchAccount,
              handleExportKey,
              isDeletable(account) ? handleDelete : null,
              account?.name === defaultAccount?.name,
              listAccount?.length - 1 === index,
            )}
        </View>
      ))}
    />
  );
};

AccountSection.propTypes = {
  defaultAccount: PropTypes.object.isRequired,
  listAccount: PropTypes.arrayOf(PropTypes.object).isRequired,
  switchAccount: PropTypes.func.isRequired,
  removeAccount: PropTypes.func.isRequired,
};

const mapState = (state) => ({
  defaultAccount: accountSeleclor.defaultAccount(state),
  listAccount: accountSeleclor.listAccount(state),
});

const mapDispatch = { removeAccount, switchAccount };

export default connect(
  mapState,
  mapDispatch,
)(AccountSection);
