import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import _ from 'lodash';
import MainLayout from '@components/MainLayout';
import Input from '@screens/BackUpPassphrase/components/Input';
import Button from '@screens/BackUpPassphrase/components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { importMasterKey } from '@src/redux/actions/masterKey';
import routeNames from '@routers/routeNames';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { BtnScanQrCode } from '@components/Button/index';
import { openQrScanner } from '@components/QrCodeScanner/QrCodeScanner';
import {
  validateMnemonic,
  validateName,
  validateMnemonicWithOtherKeys,
} from '@screens/BackUpPassphrase/utils';
import { masterKeysSelector } from '@src/redux/selectors/masterKey';
import { COLORS, THEME } from '@src/styles';
import { Text } from '@components/core/index';

const styles = StyleSheet.create({
  input: {
    marginBottom: 0,
  },
  btn: {
    marginTop: 15,
  },
  error: {
    ...THEME.text.regularTextMotto,
    color: COLORS.orange,
    marginTop: 15,
    fontSize: 14,
  },
});

const ImportMasterKey = () => {
  const navigation = useNavigation();
  const redirect = useNavigationParam('redirect');
  const masterKeys = useSelector(masterKeysSelector);

  const [name, setName] = useState('');
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState('');
  const [incorrect, setIncorrect] = useState(false);
  const [importing, setImporting] = useState(false);

  const dispatch = useDispatch();

  const handleNext = async () => {
    try {
      const trimmedPhrase = _.trim(phrase);
      const trimmedName = _.trim(name);
      if (!validateMnemonic(trimmedPhrase)) {
        return setIncorrect(true);
      }

      setImporting(true);
      handleImport(trimmedPhrase, trimmedName, masterKeys);
    } catch (e) {
      setError(e.message);
      setImporting(false);
    }
  };

  const handleImport = useCallback(_.debounce(async (trimmedPhrase, trimmedName, masterKeys) => {
    try {
      validateMnemonicWithOtherKeys(trimmedPhrase, masterKeys);
      validateName(trimmedName, masterKeys);
      await dispatch(importMasterKey({
        name: trimmedName,
        mnemonic: trimmedPhrase.replace(/typical/g, '\ttypical'),
      }));
      navigation.navigate(redirect || routeNames.MasterKeys);
    } catch (e) {
      setError(e.message);
    } finally {
      setImporting(false);
    }
  }, 1000), []);

  useEffect(() => {
    setError('');
    setIncorrect(false);
  }, [phrase, name]);

  return (
    <MainLayout header="Import master key" scrollable>
      <Input
        onChangeText={setName}
        label="Master key name"
        placeholder="Master"
        value={name}
      />
      <Input
        onChangeText={setPhrase}
        label="Recovery phrase"
        placeholder="cat dog make ..."
        value={phrase}
        style={styles.input}
        autoCapitalize="none"
        rightComponent={(
          <BtnScanQrCode
            style={styles.btn}
            onPress={() => {
              openQrScanner(setPhrase);
            }}
          />
        )}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button
        label={incorrect ? 'Incorrect phrase' : importing ? 'Importing...' : 'Import'}
        onPress={handleNext}
        disabled={
          !!error ||
          importing ||
          incorrect ||
          _.trim(name || '').length === 0 ||
          _.trim(phrase || '').length === 0
        }
      />
    </MainLayout>
  );
};

export default ImportMasterKey;
