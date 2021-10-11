import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingBottom: 50,
  },
});

export const portfolioItemStyled = StyleSheet.create({
  container: {
    paddingVertical: 16,
    borderBottomColor: COLORS.colorGrey4,
    borderBottomWidth: 1
  },
  hookContainer: {
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  hookLabel: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 3,
    color: COLORS.lightGrey17,
  },
  hookValue: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 3,
    color: COLORS.lightGrey31,
  },
  extraContainer: {
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  extraLabel: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 9,
    color: COLORS.black,
  },
  btnSmall: {
    height: 28,
    width: 89,
    marginLeft: 5,
  },
  titleSmall: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.small - 1,
    lineHeight: FONT.SIZE.small + 2,
  },
  withdrawBtn: {
    height: 28,
    width: 50,
  },
  withdrawing: {
    height: 28,
    width: 85,
    backgroundColor: COLORS.lightGrey32
  }
});
