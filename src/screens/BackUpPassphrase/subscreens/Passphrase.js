import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import MainLayout from '@components/MainLayout/index';
import Button from '@screens/BackUpPassphrase/components/Button';
import { LoadingContainer, Text, TouchableOpacity, View } from '@components/core';
import { COLORS, FONT, THEME } from '@src/styles';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import { generateNewMnemonic } from '@services/wallet/mnemonicService';
import QrCodeGenerate from '@components/QrCodeGenerate/index';
import clipboard from '@services/clipboard';
import storage from '@services/storage';
import { loadWallet as loadWalletFromStorage } from '@services/wallet/WalletService';
import { getPassphrase } from '@services/wallet/passwordService';

const styles = StyleSheet.create({
  desc: {
    ...THEME.text.mediumText,
    lineHeight: 24,
  },
  qrCodeContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  qrCode: {
    borderWidth: 1,
    borderColor: COLORS.black2,
    backgroundColor: COLORS.black2,
    width: 110,
    alignItems: 'center',
    borderRadius: 5,
  },
  qrCodeContent: {
    margin: 5,
    borderRadius: 5,
    padding: 10,
    backgroundColor: COLORS.white,
  },
  qrCodeText: {
    ...FONT.STYLE.bold,
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 8,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  words: {
    marginTop: 50,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  word: {
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGrey20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    textAlign: 'center',
    marginBottom: 10,
    marginHorizontal: 5,
  },
  index: {
    color: COLORS.newGrey,
  },
});

const Passphrase = () => {
  const navigation = useNavigation();
  const data = useNavigationParam('data');
  const [mnemonic, setMnemonic] = useState('');

  const handleNext = () => {
    navigation.navigate(data.isInit ?
      routeNames.InitVerifyPassphrase :
      routeNames.VerifyPassphrase,
    { data }
    );
  };

  const loadWallet = async () => {
    const walletData = await storage.getItem('Wallet');
    const passphrase = await getPassphrase();
    let wallet;
    if (walletData) {
      wallet = await loadWalletFromStorage(passphrase, 'Wallet');
    }

    if (!wallet) {
      data.mnemonic = generateNewMnemonic();
      data.wallet = wallet;
    } else {
      data.mnemonic = wallet.Mnemonic;
    }

    setMnemonic(data.mnemonic);
  };

  useEffect(() => {
    if (data && data.isInit) {
      loadWallet();
    } else if (data && data.isBackUp) {
      setMnemonic(data.mnemonic);
    } else {
      data.mnemonic = generateNewMnemonic();
      setMnemonic(data.mnemonic);
    }
  }, []);

  const handleCopy = () => {
    clipboard.set(data.mnemonic, { copiedMessage: 'Phrase was copied.' });

    if (data.isBackUp) {
      return navigation.goBack();
    }
  };

  if (!mnemonic) {
    return <LoadingContainer />;
  }

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <MainLayout
      header="Master key phrase"
      scrollable
      onGoBack={data.isInit ? handleBack : undefined}
    >
      <Text style={styles.desc}>
        Save these words in the correct order. Never share this phrase with anyone else.
      </Text>
      <View style={styles.words}>
        {mnemonic.split(' ').map((word, index) => (
          <Text
            key={`${word}-${index}`}
            style={[styles.word]}
          >
            <Text style={[styles.word, styles.index]}>{index + 1} </Text>{word}
          </Text>
        ))}
      </View>
      <View style={styles.qrCodeContainer}>
        <TouchableOpacity onPress={handleCopy} style={styles.qrCode}>
          <View style={styles.qrCodeContent}>
            <QrCodeGenerate value={data.mnemonic} size={80} />
          </View>
          <Text style={styles.qrCodeText}>Copy</Text>
        </TouchableOpacity>
      </View>
      {!data.isBackUp && (
        <Button
          label="I've saved my phrase"
          onPress={handleNext}
        />
      )}
    </MainLayout>
  );
};

export default Passphrase;
