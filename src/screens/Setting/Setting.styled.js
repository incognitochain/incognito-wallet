import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

export const settingStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  extra: {
    flex: 1,
    marginTop: 22,
  },
  textVersion: {
    textAlign: 'center',
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 3,
    color: COLORS.black,
    marginBottom: 25,
  },
  btnBackup: {
    backgroundColor: COLORS.colorGrey,
    height: 40,
    width: 75,
  },
  titleBtnBackup: {
    color: COLORS.black,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 3,
  },
});
