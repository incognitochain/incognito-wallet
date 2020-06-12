import {StyleSheet, Dimensions, Platform} from 'react-native';
import {COLORS, FONT} from '@src/styles';

const screenHeight = Math.round(Dimensions.get('window').height);

export const styled = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    minHeight: screenHeight,
  },
  wrapper: {
    borderRadius: 10,
    justifyContent: 'center',
  },
  extra: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 20,
    position: 'relative',
    zIndex: 1,
  },
  specialBg: {
    backgroundColor: COLORS.dark4,
    width: '100%',
    height: 100,
    left: 0,
    top: -60,
    position: 'absolute',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  bgStake: {
    flex: 1,
    justifyContent: 'center',
    resizeMode: 'center',
  },
  hook: {
    alignItems: 'center',
  },
  desc: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.large,
    lineHeight: FONT.SIZE.large + 6,
    color: COLORS.black,
    marginRight: 5,
  },
  title: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 6,
    color: COLORS.lightGrey1,
  },
  balanceContainer: {
    marginTop: 20,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  balance: {
    fontSize: FONT.SIZE.large + 5,
    lineHeight: FONT.SIZE.large + 10,
    color: COLORS.black,
    textAlign: 'right',
    maxWidth: '100%',
    width: 'auto',
  },
  symbol: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 6,
    color: COLORS.black,
    marginHorizontal: 5,
  },
  btnStake: {
    marginTop: 25,
  },
  arrow: {
    justifyContent: 'center',
  },
  background: {
    // width: '100%',
    // height: '100%',
    resizeMode: 'cover', // or 'stretch'
    position: 'absolute',
    flex: 1,
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },

  overlay: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    flex: 1,
  },
  blockStake: {
    backgroundColor: 'red',
  },
});

export const styledActions = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.9)',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 100,
  },
  wrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnStake: {
    marginTop: 10,
  },
});

export const styledInterestRate = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    bottom: 20,
    right: 18,
  },
  icon: {
    width: 22,
    height: 22,
  },
  desc: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.large,
    color: COLORS.black,
    marginRight: 5,
  },
});
