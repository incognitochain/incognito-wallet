import { StyleSheet } from 'react-native';
import { FONT, COLORS } from '@src/styles';

export const styledForm = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    flex: 1,
  },
  submitBtn: {
    marginVertical: 50,
  },
  submitBtnUnShield: {
    backgroundColor: COLORS.orange,
  },
  warningText: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.small - 2,
    lineHeight: FONT.SIZE.small + 4,
    color: COLORS.colorGreyBold,
    marginTop: 10,
  },
  amount: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
    color: COLORS.colorGreyBold,
    maxWidth: '50%',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 42,
  },
  errorText: {
    fontFamily: FONT.NAME.medium,
    lineHeight: FONT.SIZE.regular + 5,
    fontSize: FONT.SIZE.regular,
    color: COLORS.colorGreyBold,
    textAlign: 'center',
    marginTop: 15,
  },
  btnRetry: {
    width: '100%',
    marginTop: 50,
  },
  titleBtnRetry: {
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 3,
  },
});

