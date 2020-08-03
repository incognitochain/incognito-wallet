import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';
import { isIOS } from '@src/utils/platform';

export default StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: isIOS() ? 70 : 100,
  },
  mainContainer: {
    flex: 1,
  },
  feeText: {
    textAlign: 'center',
    marginVertical: 3,
    fontSize: 14,
  },
  form: {
    marginTop: 30,
    width: '100%',
  },
  submitBtn: {
    marginTop: 50,
    backgroundColor: COLORS.colorBlue,
  },
  memoContainer: {},
  memoText: {
    fontSize: FONT.SIZE.small + 1,
    lineHeight: FONT.SIZE.small + 3,
    color: COLORS.colorGreyBold,
    textAlign: 'left',
  },
  warning: {
    fontSize: FONT.SIZE.small + 1,
    lineHeight: FONT.SIZE.small + 3,
    color: COLORS.colorGreyBold,
    textAlign: 'left',
  },
  estimateFee: {
    marginTop: 10,
  },
});
