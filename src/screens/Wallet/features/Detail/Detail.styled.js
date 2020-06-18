import { StyleSheet } from 'react-native';
import { FONT, COLORS, UTILS } from '@src/styles';

export const styled = StyleSheet.create({
  container: { flex: 1 },
  btnTrade: {
    backgroundColor: COLORS.colorGrey,
    paddingHorizontal: 18,
    height: 40,
    maxWidth: 80,
  },
  titleBtnTrade: {
    color: COLORS.black,
    fontSize: FONT.SIZE.regular - 1,
    fontFamily: FONT.NAME.medium,
  },
  btnInfo: {
    width: 30,
    alignItems: 'center',
  },
  headerTitleStyle: {
    maxWidth: UTILS.deviceWidth() / 2,
  },
});

export const groupBtnStyled = StyleSheet.create({
  groupButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnStyle: {
    width: '100%',
    maxWidth: '49%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.colorBlue,
  },
  titleStyle: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    color: COLORS.white,
  },
});

export const balanceStyled = StyleSheet.create({
  container: {
    marginBottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 42,
  },
  amount: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superLarge,
    color: COLORS.black,
    maxWidth: '100%',
    lineHeight: FONT.SIZE.superLarge + 4,
    textAlign: 'center',
  },
  amountBasePRV: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    color: COLORS.colorGreyBold,
    lineHeight: FONT.SIZE.medium + 4,
  },
  changePrice: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
  },
  hook: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pSymbol: {
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.specialRegular,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
  },
});

export const historyStyled = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 35,
  },
});
