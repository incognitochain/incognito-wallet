import { StyleSheet } from 'react-native';
import { COLORS, FONT, UTILS } from '@src/styles';
import { isAndroid } from '@utils/platform';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  extra: {
    alignItems: 'center',
  },
  titleStyled: {
    textTransform: 'none',
  },
  text: {
    fontFamily: FONT.NAME.regular,
    lineHeight: FONT.SIZE.regular + 9,
    fontSize: FONT.SIZE.regular,
    color: COLORS.colorGreyBold,
    textAlign: 'center',
  },
  boldText: {
    fontFamily: FONT.NAME.bold,
    color: COLORS.black,
  },
  smallText: {
    fontSize: 13,
    lineHeight: 15,
    marginTop: 5,
    color: COLORS.orange,
    fontFamily: FONT.NAME.bold,
  },
  errorIcon: {
    color: COLORS.orange,
    fontSize: 60,
  },
  hook: {
    alignItems: 'center',
    marginBottom: 30,
  },
  questionIcon: {
    marginBottom: 10,
  },
  qrCode: {
    marginVertical: 30,
  },
  clockIcon: {
    width: 40,
    height: 40,
  },
  title: {
    color: COLORS.black,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 7,
  },
  scrollview: {
    paddingTop: 42,
  },
  countdown: {
    paddingHorizontal: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 42,
  },
  errorText: {
    fontFamily: FONT.NAME.medium,
    lineHeight: FONT.SIZE.regular + 5,
    fontSize: FONT.SIZE.regular,
    color: COLORS.colorGreyBold,
    textAlign: 'center',
    marginTop: 15,
  },
  btnRetry: {
    width: '100%',
    marginTop: 50,
  },
  titleBtnRetry: {
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 3,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  textContent: {
    fontFamily: FONT.NAME.medium,
    lineHeight: FONT.SIZE.regular + 3,
    fontSize: FONT.SIZE.regular,
    color: COLORS.white,
    textAlign: 'center',
  },
  centerRaw: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnInfo: {
    marginTop: 10
  },
  input: {
    fontFamily: FONT.NAME.bold,
    fontSize: 26,
    height: isAndroid() ? 52 : 'auto',
    padding: 0,
    flex: 1,
    marginRight: 15,
    marginTop: 20,
    marginBottom: isAndroid() ? -UTILS.heightScale(16) : 10,
    textAlign: 'center'
  },

  disconnectButton: {
    fontFamily: FONT.NAME.bold,
    width: '50%',
    backgroundColor: 'red',
    marginTop: 2,
  },

  wrapConnect: {
    minWidth: 80,
    maxWidth: 120,
  },

  btnConnect: {
    backgroundColor: COLORS.colorGrey,
    height: 40,
    paddingHorizontal: 15,
    width: '100%',
  },
  connectStyle: {
    fontFamily: FONT.NAME.medium,
    fontSize: 15,
    lineHeight: 19,
    color: COLORS.black,
    marginRight: 5,
  },
  connectHook: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnShield: {
    marginTop: 40,
    backgroundColor: COLORS.black,
  },
  wrapMessage: {
    alignSelf: 'center',
    marginTop: 10
  },
  shieldMessage: {
    fontSize: 13,
    lineHeight: 15,
    marginTop: 5,
    color: COLORS.orange,
    fontFamily: FONT.NAME.bold,
    textAlign: 'center'
  },
  selectedBtn: {
    backgroundColor: '#EFEFEF',
  },
  unSelectBtn: {
    borderColor: COLORS.colorGreyLight,
  },
  optionBtn: {
    flex: 1,
    height: 45,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 0,
    justifyContent: 'center'
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectBox: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  textSelectBox: {
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.specialMedium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.medium + 4,
    marginLeft: 10,
  },
});
