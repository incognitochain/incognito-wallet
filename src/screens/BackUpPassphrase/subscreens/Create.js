import React, { useEffect, useState } from 'react';
import { StyleSheet, BackHandler } from 'react-native';
import MainLayout from '@components/MainLayout/index';
import Input from '@screens/BackUpPassphrase/components/Input';
import Button from '@screens/BackUpPassphrase/components/Button';
import { Text, View, Image } from '@components/core';
import { COLORS, THEME } from '@src/styles';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import { useSelector } from 'react-redux';
import { masterKeysSelector } from '@src/redux/selectors/masterKey';
import { validateName } from '@screens/BackUpPassphrase/utils';
import { CheckBox } from 'react-native-elements';
import checkedIcon from '@assets/images/icons/checked-checkbox.png';
import uncheckedIcon from '@assets/images/icons/unchecked-checkbox.png';

const styles = StyleSheet.create({
  desc: {
    ...THEME.text.mediumText,
  },
  error: {
    ...THEME.text.regularTextMotto,
    color: COLORS.orange,
    marginBottom: 15,
    marginTop: -15,
    fontSize: 14,
  },
  checkboxWrapper: {
    marginTop: 25,
    marginLeft: -10,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginTop: -20,
  },
  checkboxTitle: {
    ...THEME.text.mediumTextMotto,
    fontWeight: '400',
    marginTop: 20,
  },
});

const CreateMasterKey = () => {
  const navigation = useNavigation();
  const masterKeys = useSelector(masterKeysSelector);
  const isInit = useNavigationParam('init');

  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');

  const handleImport = () => {
    try {
      const data = { name, isInit };
      validateName(name, masterKeys);
      navigation.navigate(isInit ?
        routeNames.InitMasterKeyPhrase :
        routeNames.MasterKeyPhrase,
      {data}
      );
    } catch (e) {
      setError(e.message);
    }
  };

  const handleBack = () => {
    if (isInit) {
      return true;
    }

    navigation.goBack();
  };

  useEffect(() => {
    setError('');
  }, [name]);

  return (
    <MainLayout
      header="Create master key"
      hideBackButton={isInit}
      scrollable
      onGoBack={handleBack}
    >
      <Input
        onChangeText={setName}
        label="Master key name"
        placeholder="Master"
        value={name}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Text style={styles.desc}>
        The next screen will contain 12 special words that will allow you to recover your funds.
        {('\n\n')}
        Be prepared to record them in a safe place. If anyone gains access to them, they will gain access to your funds.
      </Text>
      <View style={styles.checkboxWrapper}>
        <CheckBox
          title="I accept that if I lose these words, I will lose access to my funds."
          checked={checked}
          onPress={() => setChecked(!checked)}
          containerStyle={styles.checkbox}
          textStyle={styles.checkboxTitle}
          checkedIcon={<Image source={checkedIcon} />}
          uncheckedIcon={<Image source={uncheckedIcon} />}
          checkedColor='red'
        />
      </View>
      <Button
        label="I'm ready"
        onPress={handleImport}
        disabled={!checked}
      />
    </MainLayout>
  );
};

export default CreateMasterKey;
