import { COLORS, THEME, UTILS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {},
  submitBtn: {
    backgroundColor: COLORS.blue,
    marginTop: 20,
  },
  title: {
    fontSize: THEME.text.largeTitleSize,
    fontWeight: 'bold',
  },
  randomNameField: {
    marginBottom: 20,
  },
  randomNameText: {
    maxWidth: UTILS.deviceWidth() - 130, // 30 px padding, 100px is randomNameChangeBtn's width
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.NORMALIZE(FONT.FONT_SIZES.superMedium),
    color: COLORS.colorGreyBold,
  },
  randomNameChangeBtn: {
    paddingHorizontal: 20,
    width: 100,
  },
  randomNameChangeBtnText: {
    color: COLORS.primary,
  },
  randomNameLabel: {
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.NORMALIZE(FONT.FONT_SIZES.medium),
    fontFamily: FONT.NAME.bold,
    marginBottom: 10,
    color: COLORS.black,
  },
  randomNameValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default style;
