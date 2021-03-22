import rnfs from 'react-native-fs';
// eslint-disable-next-line react-native/split-platform-components
import { Platform, PermissionsAndroid } from 'react-native';
import moment from 'moment';

const converter = require('json-2-csv');

export const checkWriteStoragePermission = async () => {
  if (
    (Platform.OS === 'android' && Platform.Version < 23) ||
    Platform.OS === 'ios'
  ) {
    return true;
  }

  const write = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );

  if (!write) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);
    return result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted';
  }

  return write;
};

export const exportAndSaveCSVFile = (arr) => {
  return new Promise((resolve, reject) => {
    converter.json2csv(arr, (err, csv) => {
      if (err) {
        reject(err);
      }
      const time = moment().format('DD_MM_YYYY_HH_mm');

      const dir =
        Platform.OS === 'android'
          ? rnfs.ExternalDirectoryPath
          : rnfs.DocumentDirectoryPath;

      if (dir) {
        const path = `${dir}/incognito_${time}.csv`;
        rnfs
          .writeFile(path, csv, 'utf8')
          .then(() => {
            resolve(Platform.OS === 'android' ? `file://${path}` : path);
          })
          .catch((error) => reject(error));
      }
    });
  });
};
