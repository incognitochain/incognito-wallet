import {StyleSheet} from 'react-native';
import {COLORS, FONT, UTILS} from '@src/styles';
import {FontStyle} from '@src/styles/TextStyle';

export const btnStyles = StyleSheet.create({
  button: {
    marginTop: UTILS.heightScale(25),
    marginHorizontal: 4,
    flex: 1,
    backgroundColor: COLORS.green2,
  },
});

export const coinStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  coinContainer: {
    marginTop: 25,
    flex: 1,
  },
  coin: {
    marginBottom: 20,
  },
  coinName: {
    fontFamily: FONT.NAME.medium,
    fontSize: 20,
    color: COLORS.black,
  },
  coinInterest: {
    fontSize: 18,
    color: COLORS.green2,
    fontFamily: FONT.NAME.medium,
    marginBottom: 8,
  },
  coinExtra: {
    fontFamily: FONT.NAME.medium,
    color: COLORS.newGrey,
    fontSize: 18,
  },
  textRight: {
    textAlign: 'right',
  },
  justifyRight: {
    justifyContent: 'flex-end',
  },
  button: {
    backgroundColor: COLORS.green2,
    marginTop: 40,
    marginBottom: 30,
  },
  error: {
    ...FONT.STYLE.normal,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 8,
    color: COLORS.red,
    marginTop: 10
  },
  disabled: {
    opacity: 0.5,
  },
  inputContainer: {
    marginBottom: 8
  },
  rateChange: {
    position: 'absolute',
    backgroundColor: 'white',
    paddingVertical: 15,
    bottom: 0,
    left: 0,
    right: 0,
    marginBottom: 15,
  },
  rateStyle: {
    fontFamily: FONT.NAME.medium,
    color: COLORS.newGrey,
    fontSize: 18,
  },
  smallGray: {
    textAlign: 'right',
    color: COLORS.lightGrey34,
    fontSize: FONT.SIZE.superSmall,
    lineHeight: FONT.SIZE.superSmall + 6,
  },
  regularGray: {
    color: COLORS.lightGrey34,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 8,
  },
  regularDark: {
    ...FONT.STYLE.medium,
    color: COLORS.black,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 8,
  },
  wrapInput: {
    backgroundColor: COLORS.colorGrey4,
    height: 50,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  input: {
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
    fontFamily: FONT.NAME.medium,
    height: '100%'
  },
  symbol: {
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 9,
    fontFamily: FONT.NAME.medium,
  },
  infinite: {
    width: 22,
    height: 10
  },
  rowCenterVertical: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  image: {
    width: 24,
    height: 24
  },
  warning: {
    color: COLORS.orange,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 9,
    fontFamily: FONT.NAME.medium,
  },
});

export const confirmStyle = StyleSheet.create({
  button: {
    marginVertical: UTILS.heightScale(38),
  },
  buttonTitle: {
    fontSize: 20,
    ...FONT.STYLE.medium,
  },
  error: {
    color: COLORS.red,
  },
  bigText: {
    color: COLORS.green2,
    fontSize: 40,
    lineHeight: 55,
    ...FONT.STYLE.bold,
  },
  mainInfo: {
    marginVertical: UTILS.heightScale(38),
  },
  bold: {
    ...FONT.STYLE.bold,
    color: COLORS.black,
  },
  extra: {
    color: COLORS.lightGrey17,
  },
  warning: {
    color: COLORS.orange,
  },
  row: {
    flexDirection: 'row'
  },
});

export const historyStyle = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginBottom: 10,
  },
  button: {
    marginVertical: 50,
  },
  buttonTitle: {
    fontSize: 20,
    marginBottom: 5,
    ...FONT.STYLE.bold,
  },
  error: {
    color: COLORS.red,
  },
  bold: {
    ...FONT.STYLE.bold,
    color: COLORS.black,
  },
  content: {
    fontSize: 18,
    color: COLORS.lightGrey16,
  },
  historyItem: {
    marginBottom: 30,
  },
  historyTitle: {
    paddingTop: 30,
  },
  right: {
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  status: {
  },
  ellipsis: {
    flex: 1,
    marginRight: 25,
  },
});

export const tabStyle = StyleSheet.create({
  title: {
    ...FontStyle.medium,
    color: COLORS.white
  },
  disabledText: {
    ...FontStyle.medium,
    color: COLORS.lightGrey31
  },
  tabEnable: {
    backgroundColor: COLORS.green2
  }
});

export const homeStyle = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: 24
  }
});

export const itemStyle = StyleSheet.create({
  wrapper: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  image: {
    width: 20,
    height: 20,
  },
  wrapImage: {
    justifyContent: 'center',
    marginRight: 12,
    height: FONT.SIZE.medium + 9,
  },
  title: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 9
  },
  subTitle: {
    ...FONT.STYLE.normal,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
    color: COLORS.lightGrey33,
  },
  headerTitle: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
    color: COLORS.lightGrey33,
  },
  greenText: {
    color: COLORS.green2,
  },
  rightText: {
    textAlign: 'right'
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  arrow: {
    marginLeft: 12
  },
  subRow: {
    marginTop: 3,
    marginLeft: 32
  },
  mediumTitle: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 9
  },
  mediumGray: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 9,
    color: COLORS.lightGrey34
  }
});
