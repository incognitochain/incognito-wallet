import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

export const styled = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  rowName: {
    alignItems: 'center',
  },
  name: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.medium,
    marginRight: 5,
    lineHeight: FONT.SIZE.superMedium + 9,
    color: COLORS.black,
  },
  nameFollowed: {
    color: COLORS.black,
  },
  subText: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
    color: COLORS.lightGrey33,
    marginTop: 2,
  },
  wrapperFirstSection: {
    flex: 0.7,
  },
  wrapperSecondSection: {
    flex: 0.3,
  },
  wrapperThirdSection: {
    width: 27,
    height: FONT.SIZE.superMedium + 9,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  apy: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.superMedium + 9,
    color: COLORS.black,
    textAlign: 'right',
  },
  rightText: {
    textAlign: 'right',
  },
});
