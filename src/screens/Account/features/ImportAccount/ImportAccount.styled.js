import { COLORS, THEME, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionText: {
    lineHeight: 24,
    ...THEME.text.mediumText,
  },
  actions: {
    marginTop: 50,
  },
  action: {
    marginVertical: 0,
    marginBottom: 30,
  },
  submitBtn: {
    marginVertical: 50,
  },
  title: {
    fontSize: THEME.text.largeTitleSize,
    fontWeight: 'bold',
  },
  randomNameText: {
    flex: 1,
    fontFamily: FONT.NAME.specialMedium,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    color: COLORS.colorGreyBold,
  },
  randomNameChangeBtn: {},
  randomNameChangeBtnText: {
    color: COLORS.black,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
  },
  randomNameLabel: {
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    fontFamily: FONT.NAME.bold,
    marginBottom: 10,
    color: COLORS.black,
  },
  randomNameValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default style;
