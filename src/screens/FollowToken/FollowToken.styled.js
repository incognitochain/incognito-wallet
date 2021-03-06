import { StyleSheet } from 'react-native';
import { FONT, COLORS } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    paddingTop: 27,
  },
  text: {
    fontFamily: FONT.NAME.medium,
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
    marginBottom: 40,
    marginTop: 15,
  },
  listToken: {
    flex: 1,
  },
  scrollview: {
    flex: 1,
  },
});
