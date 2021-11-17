import { StyleSheet } from 'react-native';
import { FONT, COLORS } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});

export const headerStyled = StyleSheet.create({
  container: {
    height: 45,
  },
  icon: {
    marginRight: 16
  },
  notify: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: COLORS.blue5,
    right: 15,
    borderRadius: 4
  },
});

export const styledBalance = StyleSheet.create({
  container: {
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
    color: COLORS.lightGrey36,
  },
  balance: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.superLarge,
    lineHeight: FONT.SIZE.superLarge + 12,
    color: COLORS.black,
    maxWidth: '85%',
    height: '100%',
    textAlign: 'center'
  },
  pSymbol: {
    fontFamily: FONT.NAME.specialRegular,
    fontSize: FONT.SIZE.superLarge,
    lineHeight: FONT.SIZE.superLarge + 12,
    color: COLORS.black,
    height: '100%',
  },
  balanceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
  },
  wrapBalance: {
    minHeight: FONT.SIZE.superLarge + 12,
  },
  iconHide: {
    marginLeft: 5
  },
  btnHideBalance: {
    position: 'absolute',
    right: -15,
    top: -15,
    width: 50,
    height: 50,
  },
});

export const groupButtonStyled = StyleSheet.create({
  container: {
    marginTop: 24
  },
  tooltip: {
    backgroundColor: COLORS.black,
    borderRadius: 11,
    marginBottom: 20,
  },
  triangleStyle: {
    bottom: -30,
    left: '48%',
    borderBottomColor: COLORS.black,
  },
  btnClose: {
    position: 'absolute',
    top: 5,
    right: 0,
    width: 32,
    height: 32,
    zIndex: 1,
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
  wrapHook: {
    padding: 20,
    paddingBottom: 0,
  },
});

export const tokenStyled = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  wrapFirst: {
    flex: 1,
    paddingRight: 10
  },
  wrapSecond: {
    flex: 1,
    paddingRight: 10
  },
  wrapThird: {
    flex: 1,
    paddingRight: 10
  },
  rowHeight: {
    height: FONT.SIZE.regular + 8,
  },
  blackText: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.regular + 8,
    textAlign: 'left',
    color: COLORS.black
  },
  grayText: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.regular + 8,
    color: COLORS.lightGrey36
  },
  centerVertical: {
    justifyContent: 'center'
  },
  icon: {
    width: 12,
    height: 12
  },
  btnTrade: {
    backgroundColor: COLORS.blue5,
    height: 32,
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4
  },
  labelTrade: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.small,
    color: COLORS.white
  },
  headerLabel: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.regular,
    color: COLORS.lightGrey36,
  },
  wrapHeader: {
    marginTop: 5,
    marginBottom: 10
  }
});

export const styledAddToken = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    position: 'absolute',
    bottom: 0,
    left: -25,
    backgroundColor: COLORS.white,
    borderTopRightRadius: 8,
  },
  title: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    color: COLORS.black,
  },
});
