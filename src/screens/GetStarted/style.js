import { StyleSheet } from 'react-native';
import { COLORS, DECOR, FONT } from '@src/styles';

export default StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  getStartedBlock: {
    marginTop: 30,
    justifyContent: 'center',
    width: '100%',
  },
  getStartedBtn: {
    marginVertical: 30,
  },
  title: {
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 5,
    color: COLORS.black,
    fontFamily: FONT.NAME.bold,
    marginBottom: 30,
  },
  importKeyBlock: {
    height: 130,
  },
  centerText: {
    textAlign: 'center',
  },
  importBtn: {
    color: COLORS.blue,
    marginVertical: 20,
  },
  errorMsg: {
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.medium,
  },
  retryBtn: {
    marginTop: 30,
  },
  loadingContainer: {
    justifyContent: 'flex-end',
    width: '100%',
    minHeight: 20,
  },
  bar: {
    width: '100%',
    height: 5,
    backgroundColor: COLORS.lightGrey6,
    borderRadius: DECOR.borderRadiusBorder,
  },
  barHighlight: {
    position: 'relative',
    left: 0,
    width: 100,
    height: 5,
    backgroundColor: COLORS.primary,
    borderRadius: DECOR.borderRadiusBorder,
  },
});
