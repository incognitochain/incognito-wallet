import {
  LoadingContainer,
} from '@src/components/core';
import { StyleSheet } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import MainLayout from '@components/MainLayout';
import storage from '@src/services/storage';
import WelcomeNewUser from '@screens/GetStarted/WelcomeNewUser';
import WelcomeOldUser from '@screens/GetStarted/WelcomeOldUser';
import BackupKeys from '@screens/BackupKeys';
import ConfirmBackUp from '@screens/GetStarted/ConfirmBackUpKeys';
import { loadWallet as loadWallet } from '@src/services/wallet/WalletService';
import { CONSTANT_CONFIGS } from '@src/constants';
import { useDispatch } from 'react-redux';
import { setNewUserTutorial } from '@src/redux/actions/settings';
import SplashScreen from 'react-native-splash-screen';

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
});

const Welcome = () => {
  const [showBackUpKeys, setShowBackUpKeys] = useState(false);
  const [showConfirmBackUpKeys, setShowConfirmBackUpKeys] = useState(false);
  const [isExisted, setIsExisted] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [isBackUp, setIsBackUp] = useState(false);
  const [listAccount, setListAccount] = useState([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const loadWalletData = useCallback(async () => {
    const data = await storage.getItem('Wallet');

    setIsExisted(!!data);

    if (data) {
      const wallet = await loadWallet(CONSTANT_CONFIGS.PASSPHRASE_WALLET_DEFAULT);
      const accounts = await wallet.listAccount();

      setListAccount(accounts);
    }

    setTimeout(() => {
      setLoadingWallet(false);
    }, 100);
  }, []);

  React.useEffect(() => {
    SplashScreen.hide();
  }, []);

  const handleShowBackUp = useCallback(() => {
    setShowBackUpKeys(true);
  }, []);

  const handleCopy = useCallback(() => {
    setShowConfirmBackUpKeys(true);
  }, []);

  const handleImport = () => {
    navigation.navigate(routeNames.InitImportMasterKey, { init: true });
  };

  const handleCreate = () => {
    navigation.navigate(routeNames.InitMasterKey , { init: true });
  };

  useEffect(() => {
    dispatch(setNewUserTutorial(true));
    loadWalletData();
  }, []);

  if (loadingWallet) {
    return <LoadingContainer />;
  }

  if (showBackUpKeys && !isBackUp && !showConfirmBackUpKeys) {
    return (
      <BackupKeys
        onNext={handleCopy}
        onBack={() => setShowBackUpKeys(false)}
        listAccount={listAccount}
      />
    );
  }

  if (!isBackUp && showConfirmBackUpKeys) {
    return (
      <ConfirmBackUp
        onNext={() => setIsBackUp(true)}
        onBack={() => setShowConfirmBackUpKeys(false)}
      />
    );
  }

  const renderContent = () => {
    return !isExisted ?
      <WelcomeNewUser onImport={handleImport} onCreate={handleCreate} /> :
      <WelcomeOldUser onImport={handleImport} onCreate={handleCreate} isBackUp={isBackUp} onBackUp={handleShowBackUp} />;
  };

  return (
    <MainLayout noHeader contentStyle={styles.flex}>
      {renderContent()}
    </MainLayout>
  );
};

export default Welcome;
