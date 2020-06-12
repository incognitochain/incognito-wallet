import { Platform, Share } from 'react-native';
import clipboard from '@src/services/clipboard';
import { accountSeleclor } from '@src/redux/selectors';
import { ExHandler } from '@src/services/exception';
import storageService from '@src/services/storage';
import React from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { debounce } from 'lodash';
import rnfs from 'react-native-fs';
import SimpleInfo from '@src/components/SimpleInfo';
import LoadingContainer from '@src/components/LoadingContainer';
import { CONSTANT_KEYS } from '@src/constants';
import { compose } from 'recompose';
import { withLayout_2 } from '@src/components/Layout';

const getNameKey = (obj) => {
  const name = Object.keys(obj)[0];
  const key = Object.values(obj)[0];

  return [name, key];
};

const convertToString = (backupData) => {
  return (
    backupData
      ?.map((pair) => {
        const [name, key] = getNameKey(pair);
        return `AccountName: ${name}\nPrivateKey:${key}`;
      })
      ?.join('\n\n') || ''
  );
};

const getBackupData = (accounts) => {
  try {
    const info = [];
    if (accounts instanceof Array) {
      for (let account of accounts) {
        info.push({ [account?.name]: account?.PrivateKey });
      }
    }

    if (info.length) {
      return { backupData: info, backupDataStr: convertToString(info) };
    }
  } catch (e) {
    new ExHandler(e, 'Please try again').showErrorToast();
  }
};

const enhance = (WrappedComponent) => (props) => {
  const accounts = useSelector(accountSeleclor.listAccountSelector);
  const [state, setState] = React.useState({
    backupData: [],
    backupDataStr: '',
  });

  const { backupData, backupDataStr } = state;

  React.useEffect(() => {
    setState({ ...state, ...getBackupData(accounts) });
  }, [accounts]);

  const markBackedUp = () => {
    storageService.setItem(
      CONSTANT_KEYS.IS_BACKEDUP_ACCOUNT,
      JSON.stringify(true),
    );
  };

  const handleSaveFile = async () => {
    const time = moment().format('DD_MM_YYYY_HH_mm');

    const dir =
      Platform.OS === 'android'
        ? rnfs.ExternalDirectoryPath
        : rnfs.DocumentDirectoryPath;
    const path = `${dir}/incognito_${time}.txt`;

    await rnfs.writeFile(path, backupDataStr, 'utf8');

    const shared = await Share.share({
      message: backupDataStr,
      url: path,
      title: 'Backup your accounts',
    });
    const isShared = shared?.action === Share.sharedAction;

    if (isShared) {
      markBackedUp();
    }

    return { path, shared, isShared };
  };

  const handleCopyAll = () => {
    clipboard.set(backupDataStr, { copiedMessage: 'All keys copied' });
    markBackedUp();
  };

  if (backupData?.length === 0) {
    return (
      <SimpleInfo
        text="No account to backkup"
        subtext="Your wallet have no account to backup"
      />
    );
  } else if (backupData?.length > 0) {
    return (
      <WrappedComponent
        {...props}
        onSaveAs={debounce(handleSaveFile, 300)}
        onCopyAll={debounce(handleCopyAll, 300)}
        backupData={backupData}
        getNameKey={getNameKey}
      />
    );
  }

  return <LoadingContainer />;
};

export default compose(
  withLayout_2,
  enhance,
);
