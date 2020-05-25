import { StyleSheet } from 'react-native';
import { FONT, COLORS } from '@src/styles';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  desc: {
    marginBottom: 10,
  },
  submitBtn: {
    marginTop: 50,
    backgroundColor: COLORS.colorPrimary,
    borderRadius: 100,
    height: 50,
  },
  input: {
    marginBottom: 10,
  },
  text: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    color: COLORS.colorGreyBold,
  },
  boldText: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    color: COLORS.black,
    lineHeight: FONT.SIZE.superMedium + 4,
  },
  form: {
    flex: 1,
  },
  submitBtnTitle: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 3,
  },
});
