import {StyleSheet} from 'react-native';
import {COLORS, FONT} from '@src/styles';

const style = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
  },
  text: {
    color: COLORS.lightGrey1,
    fontFamily: FONT.NAME.specialMedium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
    marginBottom: 22,
  },
  title: {
    fontFamily: FONT.NAME.specialBold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    color: COLORS.black,
    marginBottom: 5,
    marginTop: 20
  },
});

export default style;
