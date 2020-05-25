import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  extra: {
    alignItems: 'center',
    flex: 1,
  },
  titleStyled: {
    textTransform: 'none',
  },
  text: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular - 1,
    color: COLORS.colorGreyBold,
    textAlign: 'center',
  },
  boldText: {
    fontFamily: FONT.NAME.bold,
    color: COLORS.black,
  },
  errorIcon: {
    color: COLORS.orange,
    fontSize: 60,
  },
  hook: {
    alignItems: 'center',
    marginBottom: 50,
  },
  questionIcon: {
    marginBottom: 10,
  },
  qrCode: {
    marginVertical: 30,
  },
  clockIcon: {
    width: 40,
    height: 40,
  },
  title: {
    color: COLORS.black,
    fontSize: FONT.SIZE.superMedium,
  },
  scrollview: {
    marginTop: 42,
  },
  countdown: {
    paddingHorizontal: 10,
  },
});
