import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  dialog: {
    height: 'auto',
    borderRadius: 20,
  },
  dialogContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
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
    fontSize: 26,
    marginTop: 30,
    marginBottom: 15,
    ...FONT.STYLE.medium,
    textAlign: 'center',
  },
  dialogDesc: {
    fontSize: 18,
    paddingHorizontal: 30,
    color: COLORS.dark1,
    textAlign: 'center',
  },
  dialogButton: {
    color: COLORS.primary,
    ...FONT.STYLE.bold,
    marginTop: 30,
    marginBottom: 20,
  },
  extraInfo: {
    fontSize: 16,
    marginTop: 20,
    color: COLORS.lightGrey16,
    textAlign: 'center',
  },
  button: {
    marginTop: 30,
  },
});
