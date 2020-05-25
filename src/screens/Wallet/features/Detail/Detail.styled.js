import { StyleSheet } from 'react-native';
import { FONT, COLORS } from '@src/styles';

export const styled = StyleSheet.create({
  container: { flex: 1 },
  btnTrade: {
    backgroundColor: COLORS.colorGrey,
    paddingHorizontal: 18,
    height: 40,
  },
  titleBtnTrade: {
    color: COLORS.black,
    fontSize: FONT.NORMALIZE(FONT.FONT_SIZES.regular - 1),
    fontFamily: FONT.NAME.medium,
  },
  scrollview: {
    flex: 1,
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
    maxWidth: '80%',
    lineHeight: FONT.NORMALIZE(FONT.FONT_SIZES.superLarge + 4),
  },
  amountBasePRV: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    color: COLORS.colorGreyBold,
    lineHeight: FONT.NORMALIZE(FONT.FONT_SIZES.medium + 4),
  },
  changePrice: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.NORMALIZE(FONT.FONT_SIZES.medium + 4),
  },
  hook: {
    flexDirection: 'row',
    marginTop: 10,
  },
  pSymbol: {
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.specialRegular,
    fontSize: FONT.SIZE.medium,
  },
});

export const historyStyled = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 35,
  },
});
