import { StyleSheet } from 'react-native';
import { FONT, COLORS, UTILS } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    paddingVertical: 15,
  },
  extra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  extraTop: {
    marginBottom: 5,
  },
  name: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: '60%',
  },
  leftText: {
    textAlign: 'left',
  },
  rightText: {
    textAlign: 'right',
  },
  boldText: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    color: COLORS.black,
  },
  displayName: {
    maxWidth: '80%',
  },
  text: {
    fontFamily: FONT.NAME.medium,
    color: COLORS.colorGreyBold,
    maxWidth: UTILS.screenWidth() / 2 - 50,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  priceContainer: {
    flexDirection: 'row',
  },
  pSymbol: {
    fontFamily: FONT.NAME.specialRegular,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
    color: COLORS.colorGreyBold,
  },
  pSymbolBold: {
    fontFamily: FONT.NAME.specialRegular,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    color: COLORS.black,
  },
  redText: {
    color: COLORS.red,
  },
  greenText: {
    color: COLORS.green,
  },
  bottomText: {
    fontSize: FONT.SIZE.medium,
    fontFamily: FONT.NAME.medium,
    lineHeight: FONT.SIZE.medium + 4,
  },
  normalText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followText: {
    fontFamily: FONT.NAME.regular,
    color: COLORS.colorGreyBold,
    lineHeight: FONT.SIZE.regular + 3,
    fontSize: FONT.SIZE.regular,
  },
});
