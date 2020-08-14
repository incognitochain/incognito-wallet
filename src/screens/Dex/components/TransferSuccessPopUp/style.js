import {COLORS, FONT, SPACING} from '@src/styles';
import { StyleSheet } from 'react-native';

export const mainStyle = StyleSheet.create({
  dialog: {
    height: 'auto',
    borderRadius: 10,
  },
  dialogContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
  },
  dialogButton: {
    color: COLORS.primary,
    ...FONT.STYLE.bold,
    marginTop: 30,
    marginBottom: 20,
  },
  dialogTitle: {
    fontSize: 20,
    marginTop: 10,
    marginBottom: 20,
    ...FONT.STYLE.medium,
  },
  desc: {
    fontSize: 14,
    color: COLORS.lightGrey9,
    width: '100%',
    textAlign: 'center',
    marginBottom: 50,
    paddingHorizontal: 10,
  },
  transferSuccess: {
    width: 50,
    height: 50,
    marginTop: 10,
    resizeMode: 'contain'
  },
  transferInfo: {
    textAlign: 'left',
    width: '100%',
  },
  fee: {
    marginTop: 5,
    fontSize: 16,
  },
  infoTitle: {
    color: COLORS.lightGrey9,
  },
  transferSuccessButton: {
    marginVertical: 30,
    marginBottom: 20,
    width: '100%',
  },
  textRight: {
    textAlign: 'right',
    marginLeft: 'auto',
  },
  twoColumns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountName: {
    maxWidth: 150,
  },
  amount: {
    maxWidth: 120,
  },
});
