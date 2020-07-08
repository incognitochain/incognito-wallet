import {StyleSheet} from 'react-native';
import {COLORS, FONT} from '@src/styles';

const style = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
  },
  text: {
    color: COLORS.lightGrey1,
    lineHeight: 26,
    ...FONT.STYLE.normal,
  },
  textLine: {
    color: COLORS.lightGrey1,
    lineHeight: 26,
    width: '90%',
    ...FONT.STYLE.normal,
  },
  title: {
    ...FONT.STYLE.bold,
    marginTop: 30,
    fontSize: FONT.FONT_SIZES.medium
  },
  bold: {
    ...FONT.STYLE.bold,
  },
  semiBold: {
    ...FONT.STYLE.bold,
    color: COLORS.lightGrey1,
  },
  marginTop: {
    marginTop: 25,
  },
});

export default style;
