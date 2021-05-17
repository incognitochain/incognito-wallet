/* eslint-disable import/no-cycle */
import { Toast } from '@src/components/core';
import React, { useState } from 'react';
import { CustomError, ErrorCode, ExHandler } from '@src/services/exception';
import { compose } from 'recompose';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import trim from 'lodash/trim';
import { useDispatch, useSelector } from 'react-redux';
import useAccount from '@src/components/Account/Account.useEffect';
import { change } from 'redux-form';
import { accountSelector } from '@src/redux/selectors';
import handleRandomName from '@src/utils/randomName';
import { Keyboard } from 'react-native';
import { actionFetchImportAccount } from '@src/redux/actions/account';
import {
  actionClearListNodes as clearListNodes
} from '@screens/Node/Node.actions';
import routeNames from '@routers/routeNames';
import { noMasterLessSelector } from '@src/redux/selectors/masterKey';
import accountService from '@services/wallet/accountService';
import { formImportAccount } from './ImportAccount';

const enhance = (WrappedComponent) => (props) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const accountList = useSelector(accountSelector.listAccountSelector);
  const onGoBack = useNavigationParam('onGoBack');
  const redirect = useNavigationParam('redirect');
  const [useRandomName, setUseRandomName] = React.useState({
    toggle: true,
    randomName: '',
  });
  const [wantImport, setWantImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [name, setName] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const { toggle, randomName } = useRandomName;
  const {
    isFormValid,
    getAccountValidator,
    getPrivateKeyValidator,
    isAccountExist,
    isPrivateKeyExist,
    isAccountExistInMasterKeys,
  } = useAccount({
    form: formImportAccount,
  });
  const disabledForm = !isFormValid;
  const masterKeys = useSelector(noMasterLessSelector);
  const genRandomName = () => {
    const excludeNameList = accountList.map(
      (account) => account?.accountName || account?.name,
    );
    return handleRandomName({ excludes: excludeNameList });
  };

  const handleConfirm = () => {
    handleImportAccount({ privateKey, accountName: name });
  };

  const hasImportedMasterKey = async (privateKey) => {
    if (importing) {
      return;
    }

    for (const masterKey of masterKeys) {
      const isCreated = await masterKey.wallet.hasCreatedAccount(privateKey);
      if (isCreated) {
        return masterKey;
      }
    }

    return null;
  };

  const handleCheckPrivateKey = async (data) => {
    const { privateKey } = data;
    const accountName = data.accountName || randomName;

    try {
      setChecking(true);
      Keyboard.dismiss();
      if (disabledForm) {
        return;
      }
      if (isPrivateKeyExist || isAccountExistInMasterKeys) {
        throw new CustomError(ErrorCode.importAccount_existed);
      }

      const isValid = accountService.validatePrivateKey(privateKey);

      if (!isValid) {
        throw new CustomError(ErrorCode.web_js_import_invalid_key_2);
      }

      const masterKey = await hasImportedMasterKey(privateKey);
      if (masterKey) {
        const isExisted = masterKey.wallet.MasterAccount.child
          .find(item => item.name.toLowerCase() === accountName.toLowerCase());

        if (isExisted) {
          throw new CustomError(ErrorCode.web_js_import_invalid_key_2);
        }

        await handleImportAccount({ privateKey, accountName });
      } else {
        if (isAccountExist) {
          throw new CustomError(ErrorCode.importAccount_existed);
        }

        setWantImport(true);
        setPrivateKey(privateKey);
        setName(accountName);
      }
    } catch (error) {
      new ExHandler(
        error,
        'Import keychain failed, please try again.',
      ).showErrorToast();
      setChecking(false);
    }
  };

  const handleImportAccount = async ({ privateKey, accountName }) => {
    try {
      setImporting(true);
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
      setImporting(false);
    }
  };
  const handleImportMasterKey = () => {
    if (!importing) {
      navigation.navigate(routeNames.ImportMasterKey, {redirect: redirect || routeNames.Keychain});
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
        handleImportAccount: handleCheckPrivateKey,
        handleImportMasterKey,
        genRandomName,
        toggle,
        randomName,
        handleChangeRandomName,
        isAccountExist,
        isPrivateKeyExist,
        disabledForm,
        onConfirm: handleConfirm,
        wantImport,
        importing,
        checking,
      }}
    />
  );
};

export default compose(
  enhance,
);
