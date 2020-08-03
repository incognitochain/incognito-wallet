import {StyleSheet} from 'react-native';
import {COLORS, FONT} from '@src/styles';
import font from '@src/styles/font';
import { ScreenWidth } from '@src/utils/devices';

const style = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    flex: 1,
    paddingBottom: 10,
  },
  text: {
    color: COLORS.lightGrey1,
    lineHeight: 26,
    ...FONT.STYLE.normal,
  },
  title: {
    ...FONT.STYLE.bold,
    fontSize: FONT.SIZE.regular,
    marginTop: 30,
    lineHeight: 26,
  },
  titleHeader: {
    ...FONT.STYLE.bold,
    fontSize: font.SIZE.superMedium,
    marginTop: 30,
    lineHeight: 26,
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
  halfInput: {
    width: (ScreenWidth - 40) / 2 - 15,
  },
});

export default style;
