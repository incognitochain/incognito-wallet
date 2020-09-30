import {COLORS, FONT} from '@src/styles';
import { StyleSheet } from 'react-native';

export const mainStyle = StyleSheet.create({
  dialog: {
    height: 'auto',
    borderRadius: 20,
  },
  dialogContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
  },
  swapSuccess: {
    width: 100,
    height: 100,
    marginTop: 15,
    marginBottom: 20,
    resizeMode: 'contain'
  },
  dialogTitle: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 5,
    ...FONT.STYLE.medium,
  },
  dialogDesc: {
    marginBottom: 5,
    fontSize: 16,
    paddingHorizontal: 30,
    color: COLORS.dark1,
    textAlign: 'center',
    lineHeight: 23,
  },
  dialogButton: {
    color: COLORS.primary,
    ...FONT.STYLE.bold,
    marginTop: 30,
    marginBottom: 20,
  },
  extraInfo: {
    fontSize: 14,
    marginTop: 20,
    color: COLORS.lightGrey9,
    textAlign: 'center',
  },
});
