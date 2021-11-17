import { StyleSheet } from 'react-native';
import { FONT, COLORS } from '@src/styles';

export default StyleSheet.create({
  wrapper: {
    maxWidth: '80%'
  },
  title: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 3,
    color: COLORS.lightGrey33
  },
  baseAmount: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.superLarge,
    lineHeight: FONT.SIZE.superLarge + 8,
    color: COLORS.black,
    textAlign: 'center'
  },
  compareAmount: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 3,
    color: COLORS.black1,
    textAlign: 'center'
  },
  loading: {
    marginTop: 15
  }
});
