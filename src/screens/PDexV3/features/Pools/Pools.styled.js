import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

export const styled = StyleSheet.create({
  container: {},
});

export const headStyled = StyleSheet.create({
  headContainer: {
    justifyContent: 'space-between',
    marginTop: 30,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  titleText: {
    color: COLORS.black,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 3,
    fontFamily: FONT.NAME.bold,
  },
  searchText: {
    color: COLORS.newGrey,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 3,
    fontFamily: FONT.NAME.medium,
  },
  btnSearch: {
    backgroundColor: COLORS.lightGrey19,
    justifyContent: 'center',
    alignItems: 'center',
    width: '40%',
    height: 32,
    borderRadius: 16,
  },
});

export const poolsListHeaderFollowingStyled = StyleSheet.create({
  text: {
    color: COLORS.newGrey,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 3,
    fontFamily: FONT.NAME.medium,
  },
  centerText: {
    textAlign: 'center',
  },
  rightText: {
    textAlign: 'right',
  },
  wrapperFirstSection: {
    flex: 0.7,
  },
  wrapperSecondSection: {
    flex: 0.3,
  },
  wrapperThirdSection: {
    flex: 0.3,
  },
});

export const poolsListFollowingStyled = StyleSheet.create({
  flatList: {
    paddingBottom: 100,
  },
});

export const footerStyled = StyleSheet.create({
  text: {
    color: COLORS.black,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 3,
    fontFamily: FONT.NAME.medium,
  },
});
