import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

export default StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 12,
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
    marginTop: 20,
  },
  memoContainer: {
    // marginTop: 10,
  },
  memoText: {
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.NORMALIZE(FONT.FONT_SIZES.regular + 4),
    color: COLORS.colorGreyBold,
  },
  warning: {
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.NORMALIZE(FONT.FONT_SIZES.regular + 4),
    color: COLORS.colorGreyBold,
    textAlign: 'center',
    marginBottom: 15,
  },
});
