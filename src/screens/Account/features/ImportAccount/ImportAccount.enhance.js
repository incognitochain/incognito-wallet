/* eslint-disable import/no-cycle */
import { Toast } from '@src/components/core';
import React from 'react';
import { CustomError, ErrorCode, ExHandler } from '@src/services/exception';
import { compose } from 'recompose';
import { withLayout_2 } from '@src/components/Layout';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import trim from 'lodash/trim';
import { useDispatch, useSelector } from 'react-redux';
import useAccount from '@src/components/Account/Account.useEffect';
import { change } from 'redux-form';
import { accountSeleclor } from '@src/redux/selectors';
import handleRandomName from '@src/utils/randomName';
import { Keyboard } from 'react-native';
import { actionFetchImportAccount } from '@src/redux/actions/account';
import {
  actionClearListNodes as clearListNodes
} from '@screens/Node/Node.actions';
import { formImportAccount } from './ImportAccount';

const enhance = (WrappedComponent) => (props) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const accountList = useSelector(accountSeleclor.listAccountSelector);
  const onGoBack = useNavigationParam('onGoBack');
  const [useRandomName, setUseRandomName] = React.useState({
    toggle: true,
    randomName: '',
  });
  const { toggle, randomName } = useRandomName;
  const {
    isFormValid,
    getAccountValidator,
    getPrivateKeyValidator,
    isAccountExist,
    isPrivateKeyExist,
  } = useAccount({
    form: formImportAccount,
  });
  const disabledForm = !isFormValid;
  const genRandomName = () => {
    const excludeNameList = accountList.map(
      (account) => account?.accountName || account?.name,
    );
    return handleRandomName({ excludes: excludeNameList });
  };

  const handleImportAccount = async ({ privateKey, accountName }) => {
    try {
      Keyboard.dismiss();
      if (disabledForm) {
        return;
      }
      if (isAccountExist || isPrivateKeyExist) {
        throw new CustomError(ErrorCode.importAccount_existed);
      }
      const isImported = await dispatch(
        actionFetchImportAccount({
          privateKey: trim(privateKey),
          accountName: trim(toggle ? randomName : accountName),
        }),
      );
      if (!isImported) throw new CustomError(ErrorCode.importAccount_failed);
      if (!onGoBack) {
        navigation.pop();
      } else {
        // In case import account from Node screen
        // Import success clear listNode devices from redux store
        // Reload all UI Node screen
        dispatch(clearListNodes());
        onGoBack();
      }

      Toast.showSuccess('Import successful.');
    } catch (error) {
      new ExHandler(
        error,
        'Import keychain failed, please try again.',
      ).showErrorToast();
    }
  };
  const handleChangeRandomName = async () => {
    await dispatch(
      change(
        formImportAccount.formName,
        formImportAccount.accountName,
        randomName,
      ),
    );
    await setUseRandomName(false);
  };
  React.useEffect(() => {
    setUseRandomName({ ...useRandomName, randomName: trim(genRandomName()) });
  }, []);
  return (
    <WrappedComponent
      {...{
        ...props,
        isFormValid,
        getAccountValidator,
        getPrivateKeyValidator,
        handleImportAccount,
        genRandomName,
        toggle,
        randomName,
        handleChangeRandomName,
        isAccountExist,
        isPrivateKeyExist,
        disabledForm,
      }}
    />
  );
};

export default compose(
  withLayout_2,
  enhance,
);
