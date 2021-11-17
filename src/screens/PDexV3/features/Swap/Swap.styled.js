import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

export const styled = StyleSheet.create({
  container: { flex: 1 },
  scrollview: { flex: 1 },
  btnRefresh: {
    marginRight: 12,
  },
  btnTrade: {
    marginBottom: 40,
    borderRadius: 8,
    marginTop: 24,
  },
});

export const tabsStyled = StyleSheet.create({
  tabBtn: {
    height: 32,
    backgroundColor: 'transparent',
    borderRadius: 0,
    textAlign: 'left',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  tabBtnDisabled: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  tabTitleStyled: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 3,
    color: COLORS.black,
  },
  tabTitleDisabledStyled: {
    color: COLORS.colorGrey3,
  },
  styledTabList: {
    maxWidth: 80,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
});

export const inputGroupStyled = StyleSheet.create({
  selectPercentAmountContainer: {
    marginVertical: 30,
  },
  rightHeaderSell: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceStr: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.superSmall,
    lineHeight: FONT.SIZE.superSmall + 3,
    color: COLORS.colorGrey3,
  },
  btnStyle: {
    height: 20,
    marginLeft: 15,
    borderRadius: 4,
    paddingHorizontal: 5,
  },
  titleStyle: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superSmall,
    lineHeight: FONT.SIZE.superSmall + 3,
  },
  inputGroups: {
    marginTop: 24,
  },
  toggleArrow: {
    marginTop: 40,
  },
});
