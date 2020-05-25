import { StyleSheet } from 'react-native';
import { FONT, COLORS, UTILS } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {},
  text: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
    color: COLORS.colorGreyBold,
  },
  boldText: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 6,
    color: COLORS.black,
  },
  addManually: {
    marginBottom: 30
  },
  listToken: {
    flex: 1,
  },
  scrollview: {
    flex: 1,
  },
});
