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
    maxWidth: '100%',
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
  guide: {
    marginTop: 20,
  },
  hook: {
    marginHorizontal: 25,
  },
});

export const styledHook = StyleSheet.create({
  btnClose: {
    position: 'absolute',
    top: 5,
    right: 0,
    width: 32,
    height: 32,
    zIndex: 1,
    // backgroundColor: 'red',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 3,
    color: COLORS.white,
    marginBottom: 5,
  },
  desc: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.small + 1,
    lineHeight: FONT.SIZE.small + 6,
    color: COLORS.white,
  },
  container: {
    padding: 20,
    paddingBottom: 0,
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
    lineHeight: FONT.SIZE.superLarge + 6,
    color: COLORS.black,
    maxWidth: '85%',
    height: '100%',
  },
  pSymbol: {
    fontFamily: FONT.NAME.specialRegular,
    fontSize: FONT.SIZE.veryLarge,
    lineHeight: FONT.SIZE.veryLarge + 6,
    color: COLORS.black,
    height: '100%',
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
  token: {
    paddingHorizontal: 25,
  },
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
