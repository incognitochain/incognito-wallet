import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  actionSwitchAccountFetched,
  actionSwitchAccountFetching,
} from '@src/redux/actions/account';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import {
  defaultAccount,
  switchAccountSelector,
} from '@src/redux/selectors/account';
import { Toast, TouchableOpacity } from '@src/components/core';
import { ExHandler } from '@src/services/exception';
import debounce from 'lodash/debounce';
import Util from '@src/utils/Util';
import { COLORS, FONT } from '@src/styles';
import Row from '@components/Row';
import { switchMasterKey } from '@src/redux/actions/masterKey';
import { CheckBoxIcon } from '@components/Icons';

const itemStyled = StyleSheet.create({
  wrapper: {
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  selected: {
    borderColor: COLORS.blue5,
    borderWidth: 1,
  },
  container: {
    marginLeft: 10,
  },
  shadow: {
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.colorGrey4,
  },
  name: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 9,
    color: COLORS.black,
  },
  address: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
    color: COLORS.lightGrey36,
    marginTop: 4,
  },
});

const AccountItem = React.memo(
  ({
    accountName,
    PrivateKey,
    PaymentAddress,
    MasterKeyName,
    handleSelectedAccount,
  }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const onSelect = useNavigationParam('onSelect');
    const account = useSelector(defaultAccount);
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
        if (PrivateKey === account.PrivateKey) {
          Toast.showInfo(`Your current account is "${accountName}"`);
          return;
        }
        await dispatch(switchMasterKey(MasterKeyName, accountName));
      } catch (e) {
        new ExHandler(
          e,
          `Can not switch to account "${accountName}", please try again.`,
        ).showErrorToast();
      } finally {
        await dispatch(actionSwitchAccountFetched());
        if (typeof handleSelectedAccount === 'function') {
          handleSelectedAccount();
        }
        await dispatch(actionSwitchAccountFetched());
      }
    };

    const isCurrentAccount = useMemo(() => PrivateKey === account.PrivateKey, [
      PrivateKey,
      account.PrivateKey,
    ]);

    // eslint-disable-next-line react/prop-types
    const Component = ({ style }) => (
      <Row style={[itemStyled.wrapper, itemStyled.shadow, style]}>
        <View style={itemStyled.container}>
          <Row centerVertical spaceBetween>
            <Text style={itemStyled.name} numberOfLines={1}>
              {accountName}
            </Text>
            <CheckBoxIcon active={isCurrentAccount} />
          </Row>
          <Text
            style={itemStyled.address}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {PaymentAddress}
          </Text>
        </View>
      </Row>
    );

    if (!switchingAccount) {
      return (
        <TouchableOpacity onPress={debounce(onSelectAccount, 100)}>
          <Component style={[isCurrentAccount ? itemStyled.selected : null]} />
        </TouchableOpacity>
      );
    }

    return <Component />;
  },
);

AccountItem.defaultProps = {
  handleSelectedAccount: null,
};

AccountItem.propTypes = {
  accountName: PropTypes.string.isRequired,
  PaymentAddress: PropTypes.string.isRequired,
  PrivateKey: PropTypes.string.isRequired,
  MasterKeyName: PropTypes.string.isRequired,
  handleSelectedAccount: PropTypes.func,
};

export default AccountItem;
