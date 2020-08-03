import { FONT, THEME, COLORS } from '@src/styles';
import { StyleSheet } from 'react-native';
import { isIOS } from '@src/utils/platform';

const style = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: isIOS() ? 30 : 50,
  },
  form: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },
  verifyInfoContainer: {
    marginTop: 10,
  },
  verifyInfoHeader: {
    flexDirection: 'row',
  },
  verifyInfoLabel: {
    fontSize: FONT.SIZE.medium,
    fontFamily: FONT.NAME.medium,
    lineHeight: FONT.SIZE.medium + 4,
    color: COLORS.black,
    flex: 1,
  },
  block: {
    marginTop: 30,
  },
  desc: {
    marginBottom: 10,
  },
  input: {
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
    fontFamily: FONT.NAME.medium,
    color: COLORS.colorGreyBold,
  },
  labelInput: {
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    fontFamily: FONT.NAME.bold,
    color: COLORS.black,
  },
  descriptionInput: {
    marginTop: 30,
  },
  submitBtn: {
    marginVertical: 50,
    borderRadius: 100,
    backgroundColor: COLORS.orange,
    height: 50,
  },
  titleSubmitBtn: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.superMedium,
  },
  submitBtnDisabed: {
    opacity: 0.7,
  },
  title: {
    fontSize: THEME.text.largeTitleSize,
    fontWeight: 'bold',
  },
  balance: {
    textAlign: 'center',
  },
  error: {
    color: COLORS.red,
    fontSize: FONT.SIZE.small,
  },
  showMyAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  showMyAddressLabel: {
    flex: 1,
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 10,
    color: COLORS.black,
  },
  switch: {
    marginBottom: 0,
  },
  descriptionPlaceholder: {},
});

export default style;
