import { Header } from '@src/components';
import { LoadingContainer, Text, Button, ScrollViewBorder } from '@src/components/core';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import CopiableText from '@src/components/CopiableText';
import { BtnCopy, BtnQRCode } from '@src/components/Button';
import { Text4 } from '@src/components/core/Text';
import IconCopy from '@src/components/Icons/icon.copy';
import srcQrCodeLight from '@src/assets/images/icons/qr_code_light.png';
import { Wallet } from 'incognito-chain-web-js/build/wallet';
import { useNavigation } from 'react-navigation-hooks';
import { ExHandler } from '@src/services/exception';
import { configsWallet } from '@src/services/wallet/WalletService';
import { getPassphrase } from '@src/services/wallet/passwordService';
import routeNames from '@src/router/routeNames';
import { FONT } from '@src/styles';
import { withLayout_2 } from '@src/components/Layout';
import clipboard from '@src/services/clipboard';
import uniqBy from 'lodash/uniqBy';
import isEqual from 'lodash/isEqual';
import { getStorageLoadWalletError } from '@models/storageError';

const styled = StyleSheet.create({
  scrollview: {
    flex: 1,
    // paddingTop: 27,
    paddingBottom: 100,
  },
  accountItemContainer: {
    marginBottom: 30,
    marginHorizontal: 10,
  },
  accountItemHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    ...FONT.TEXT.label,
    lineHeight: FONT.SIZE.medium + 4,
    flex: 1,
  },
  desc: {
    ...FONT.TEXT.desc,
    lineHeight: FONT.SIZE.regular + 4,
    alignSelf: 'flex-start',
  },
  titleGroup: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    flex: 1,
    marginTop: 5,
    marginBottom: 20,
  },
  topGroup: {
    flex: 1,
  },
  copyAllButton: {
    flex: 1,
    marginTop: 30,
    marginBottom: 50,
  },
  qrCode: {
    marginRight: 15,
  },
});

const Item = React.memo(({ label, value }) => {
  const navigation = useNavigation();
  if (!value) {
    return null;
  }
  const onNavigateToQrPage = (label, value) => {
    navigation.navigate(routeNames.ExportAccountModal, {
      params: {
        value,
        label,
      },
    });
  };
  return (
    <CopiableText
      text={value}
      copiedMessage={`"${label}" private key was copied`}
      style={styled.accountItemContainer}
    >
      <View style={styled.accountItemHeader}>
        <Text style={styled.title}>{label}</Text>
        <BtnQRCode
          style={styled.qrCode}
          onPress={() => onNavigateToQrPage(label, value)}
          source={srcQrCodeLight}
        />
        <IconCopy />
      </View>
      <Text4 style={styled.desc}>{value}</Text4>
    </CopiableText>
  );
});

const Standby = () => {
  const [loading, setLoading] = React.useState(false);
  const [masterKeys, setListMasterKeys] = React.useState([]);
  const [masterLess, setListMasterless] = React.useState([]);
  const [error, setError] = React.useState([]);
  const loadListWallet = async () => {
    try {
      await setLoading(true);
      let wallet = new Wallet();
      await configsWallet(wallet);
      const passphrase = await getPassphrase();
      const list = await wallet.getListStorageBackup(passphrase);
      let masterLesses = list.filter((wallet) => !!wallet.isMasterless);
      let masterlessAccounts = [];
      masterLesses.map((w) => {
        return (masterlessAccounts = masterlessAccounts.concat(
          w?.accounts || [],
        ));
      });
      masterlessAccounts = uniqBy(masterlessAccounts, 'privateKey');
      masterlessAccounts = masterlessAccounts.map((account, index) =>
        isEqual(account?.accountName, 'Anon')
          ? { ...account, accountName: `${account?.accountName}-${index}` }
          : account,
      );
      const masterKeys = list
        .filter((wallet) => !wallet.isMasterless)
        .map((w) => ({ ...w, key: w?.mnemonic }));
      setListMasterless({ accounts: masterlessAccounts });
      setListMasterKeys(masterKeys);
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      await setLoading(false);
    }
  };
  const handleCopyAll = () => {
    let backupDataStr = '';
    if (masterKeys.length > 0) {
      backupDataStr += '------MASTER KEYS------\n\n';
      backupDataStr +=
        masterKeys
          ?.map(({ name, mnemonic }) => {
            return `Name: ${name}\nPhrase: ${mnemonic}`;
          })
          ?.join('\n\n') || '';
    }
    if (masterLess?.accounts?.length > 0) {
      backupDataStr += '\n\n------MASTERLESS------\n\n';
      backupDataStr +=
        masterLess?.accounts
          ?.map(({ accountName, privateKey }) => {
            return `AccountName: ${accountName}\nPrivateKey: ${privateKey}`;
          })
          ?.join('\n\n') || '';
    }
    clipboard.set(backupDataStr, { copiedMessage: 'All keys copied' });
  };
  const handleCopyError = async () => {
    clipboard.set(JSON.stringify(error), {
      copiedMessage: 'Copied',
      errorMessage: 'Copy Fail',
    });
  };
  const handleGetError = async () => {
    const error = await getStorageLoadWalletError();
    setError(error);
  };
  React.useEffect(() => {
    loadListWallet();
    handleGetError();
  }, []);
  return (
    <>
      <Header title="Restore private keys" rightHeader={<BtnCopy onPress={handleCopyError} />} />
      <ScrollViewBorder style={styled.scrollview}>
        {loading && <LoadingContainer />}
        {masterKeys.length > 0 && (
          <View>
            <Text style={styled.titleGroup}>Master keys</Text>
            {masterKeys.map(({ mnemonic, name }) => (
              <Item label={name} value={mnemonic} key={mnemonic} />
            ))}
          </View>
        )}
        {masterLess?.accounts?.length > 0 && (
          <View style={styled.topGroup}>
            <Text style={styled.titleGroup}>Masterless</Text>
            {masterLess?.accounts?.map(({ accountName, privateKey }) => (
              <Item label={accountName} value={privateKey} key={privateKey} />
            ))}
          </View>
        )}
        <View>
          <Text style={styled.title}>Restore all keys</Text>
          <Button
            buttonStyle={[styled.copyAllButton]}
            title="Copy all keys"
            onPress={handleCopyAll}
          />
        </View>
      </ScrollViewBorder>
    </>
  );
};

Standby.propTypes = {};

export default withLayout_2(React.memo(Standby));
