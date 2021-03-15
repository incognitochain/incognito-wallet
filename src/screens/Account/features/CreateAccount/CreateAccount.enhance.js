/* eslint-disable import/no-cycle */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'recompose';
import { withLayout_2 } from '@src/components/Layout';
import { useNavigation } from 'react-navigation-hooks';
import useAccount from '@src/components/Account/Account.useEffect';
import { actionFetchCreateAccount } from '@src/redux/actions/account';
import trim from 'lodash/trim';
import { ExHandler, CustomError, ErrorCode } from '@src/services/exception';
import { Keyboard } from 'react-native';
import { logEvent, Events } from '@services/firebase';
import { accountSeleclor } from '@src/redux/selectors';
import { formCreateAccount } from './CreateAccount';

const enhance = (WrappedComponent) => (props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isFormValid, getAccountValidator, isAccountExist } = useAccount({
    form: formCreateAccount,
  });
  const disabledForm = !isFormValid;
  const listAccount = useSelector(accountSeleclor.listAccountSelector);
  const handleCreateAccount = async ({ accountName }) => {
    try {
      Keyboard.dismiss();
      if (disabledForm) {
        return;
      }
      if (isAccountExist) {
        throw new CustomError(ErrorCode.createAccount_existed_name);
      }
      await dispatch(
        actionFetchCreateAccount({ accountName: trim(accountName) }),
      );
      /**
      *  Log event when user create new keychain
      */
      logEvent(Events.create_new_keychain, {
        order_number_of_keychain: listAccount && listAccount.length ? listAccount.length + 1 : 1
      });
      navigation.pop();
    } catch (e) {
      new ExHandler(
        e,
        'Keychain was not created! Please try again.',
      ).showErrorToast();
    }
  };
  return (
    <WrappedComponent
      {...{ ...props, disabledForm, getAccountValidator, handleCreateAccount }}
    />
  );
};

enhance.propTypes = {};

export default compose(
  withLayout_2,
  enhance,
);
