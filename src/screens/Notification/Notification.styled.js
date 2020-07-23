import { StyleSheet } from 'react-native';
import { COLORS, FONT, UTILS } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatlist: {
    flex: 1,
  },
  padding25: {
    paddingHorizontal: 25,
    maxHeight: UTILS.screenHeight() / 2,
  },
  notification: {
    flexDirection: 'row',
    flex: 1,
    paddingVertical: 10,
  },
  lastChild: {
    borderBottomColor: 'transparent',
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    color: COLORS.black,
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 9,
  },
  desc: {
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 9,
  },
  time: {
    color: COLORS.lightGrey1,
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.superSmall,
    lineHeight: FONT.SIZE.superSmall + 6,
    marginRight: 15,
  },
  hook: {
    backgroundColor: 'transparent',
  },
  icon: {
    marginRight: 15,
    marginTop: 10,
  },
  notifyRead: {
    backgroundColor: COLORS.lightGrey4,
  },
  account: {
    width: 10,
  },
  arrow: {
    width: 10,
    height: 15,
    marginLeft: 2,
    backgroundColor: 'transparent',
  },
});
