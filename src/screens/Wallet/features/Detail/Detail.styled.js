import { StyleSheet } from 'react-native';
import { FONT, COLORS, UTILS } from '@src/styles';
import { ScreenWidth } from '@utils/devices';

const maxWidth = UTILS.screenWidth() - 190;

export const styled = StyleSheet.create({
  container: { flex: 1 },
  styledContainerHeaderTitle: {
    maxWidth,
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
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  amount: {
    fontFamily: FONT.NAME.medium,
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
    maxWidth: ScreenWidth
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
