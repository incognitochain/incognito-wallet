import { StyleSheet } from 'react-native';
import { FONT, COLORS, UTILS } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  groupButtonContainer: {
    marginTop: 50,
    marginBottom: 35,
  },
  groupButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnStyle: {
    width: '100%',
    maxWidth: '49%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    padding: 13,
  },
  titleStyle: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
  },
  themeBtnStyle: {
    backgroundColor: COLORS.white,
  },
  themeBtnTitleStyle: {
    color: COLORS.black,
  },
});

export const styledHook = StyleSheet.create({
  container: {},
  title: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.medium,
    color: COLORS.white,
    marginBottom: 5,
  },
  desc: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.small,
    color: COLORS.white,
  },
});

export const styledBalance = StyleSheet.create({
  container: {
    marginTop: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    color: COLORS.colorGreyBold,
    marginTop: 10,
  },
  balance: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superLarge,
    lineHeight: FONT.NORMALIZE(FONT.FONT_SIZES.superLarge + 4),
    color: COLORS.black,
    maxWidth: '85%',
  },
  pSymbol: {
    fontFamily: FONT.NAME.specialRegular,
    fontSize: FONT.SIZE.veryLarge,
    lineHeight: FONT.NORMALIZE(FONT.FONT_SIZES.veryLarge + 4),
    color: COLORS.black,
  },
  balanceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
  },
});

export const styledAddToken = StyleSheet.create({
  container: {
    marginTop: 50,
    marginBottom: 30,
  },
  title: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    color: COLORS.black,
  },
});

export const styledFollow = StyleSheet.create({
  container: {},
  token: {},
});

export const extraStyled = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
  },
});

export const styledToken = StyleSheet.create({
  lastChild: {
    marginBottom: 0,
  },
});

export const rightHeaderStyled = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnExportKey: {
    marginRight: 15,
  },
});
