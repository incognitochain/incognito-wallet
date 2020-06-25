import {StyleSheet} from 'react-native';
import {COLORS, FONT} from '@src/styles';

const style = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
  },
  text: {
    color: COLORS.lightGrey1,
    lineHeight: 20,
    letterSpacing: 0.5
  },
  title: {
    ...FONT.STYLE.bold,
    marginTop: 20,
    lineHeight: 23,
  },
});

export default style;
