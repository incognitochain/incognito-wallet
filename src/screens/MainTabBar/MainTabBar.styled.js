import {COLORS, FONT} from '@src/styles';
import {StyleSheet} from 'react-native';
import {ScreenWidth} from '@utils/devices';

export const DEFAULT_PADDING = 24;

export const styled = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: DEFAULT_PADDING,
    paddingTop: 10
  },
  wrapBar: {
    width: ScreenWidth / 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...FONT.STYLE.normal,
    fontSize: FONT.SIZE.superSmall,
    lineHeight: FONT.SIZE.superSmall + 6,
    marginTop: 2
  }
});

export const homeStyled = StyleSheet.create({
  wrapHeader: {
    paddingHorizontal: DEFAULT_PADDING,
  },
  header: {
    height: 56,
  },
  headerIcon: {
    marginRight: 16
  },
  wrapBanner: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden'
  },
  mainCategory: {
    flex: 1,
    marginTop: 8,
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  shadow: {
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.colorGrey4,
  },
  mediumBlack: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.small,
    color: COLORS.black,
    lineHeight: FONT.SIZE.regular + 8,
  },
  volText: {
    textAlign: 'right',
    color: COLORS.newGrey,
    alignSelf: 'flex-end',
    width: '100%',
    fontSize: FONT.SIZE.small,
  },
  regularGray: {
    ...FONT.STYLE.normal,
    fontSize: FONT.SIZE.superSmall,
    color: COLORS.lightGrey34,
    lineHeight: FONT.SIZE.superSmall + 3,
  },
  regularBlack: {
    ...FONT.STYLE.normal,
    fontSize: FONT.SIZE.superSmall,
    color: COLORS.black,
    lineHeight: FONT.SIZE.superSmall + 6,
    marginTop: 2,
  },
  rowImg: {
    marginTop: 16,
    alignItems: 'flex-end'
  },
  paddingTopCategory: {
    marginTop: 25
  },
  wrapCategory: {
    paddingVertical: 16,
    marginTop: 8
  },
  category: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentBoxWidth: {
    width: 68,
    alignItems: 'flex-end'
  },
  percentBox: {
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrapPoolBox: {
    marginBottom: 24
  },
  itemBox: {
    flex: 0.5
  },
  tab: {
    marginTop: 15
  },
  tabDisable: {
    color: COLORS.lightGrey35
  },
  right: {
    textAlign: 'right',
    marginRight: 15
  },
  tabHeaderText: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.small,
    color: COLORS.lightGrey36,
    lineHeight: FONT.SIZE.small + 6,
    marginVertical: 16
  },
  notify: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: COLORS.blue5,
    right: 15,
    borderRadius: 4
  },
  notifyText: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.small,
    color: COLORS.black,
    lineHeight: FONT.SIZE.small + 3,
    marginLeft: 13,
  },
  wrapNotify: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 21,
    marginBottom: 13
  },
  mainVolume: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    marginTop: 20
  },
  wrapMainVolume: {
  },
  btnTrade: {
    width: 46,
    height: 21,
    backgroundColor: COLORS.blue5,
    marginLeft: 15,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  labelTrade: {
    color: COLORS.white,
    fontSize: FONT.SIZE.superSmall,
  },
  tabStyled: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    marginRight: 16,
  },
  titleStyled: {
    color: COLORS.black,
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.small,
  },
  tabStyledEnabled: {
    borderBottomColor: COLORS.colorBlue,
    borderBottomWidth: 2,
  }
});

export const moreStyled = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: DEFAULT_PADDING,
    paddingTop: 10,
  },
  wrapBar: {
    width: ScreenWidth / 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...FONT.STYLE.normal,
    fontSize: FONT.SIZE.superSmall,
    lineHeight: FONT.SIZE.superSmall + 6,
    marginTop: 2
  },
  category: {
    justifyContent: 'center',
    alignItems: 'center',
    width: (ScreenWidth - (DEFAULT_PADDING * 2)) / 4,
    marginBottom: 20
  },
  regularBlack: {
    ...FONT.STYLE.normal,
    fontSize: FONT.SIZE.superSmall,
    color: COLORS.black,
    lineHeight: FONT.SIZE.superSmall + 6,
    marginTop: 2,
  },
  wrapCategory: {
    marginTop: 10,
  },
  sectionLabel: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.regular,
    color: COLORS.black,
    marginBottom: 20,
  }
});

