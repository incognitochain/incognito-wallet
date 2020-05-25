import { FONT, COLORS, DECOR } from '@src/styles';
import { StyleSheet } from 'react-native';
import { isIOS } from '@src/utils/platform';

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: DECOR.borderRadiusBorder,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowTop: {
    marginBottom: isIOS() ? 10 : 5,
  },
  itemContainer: {
    paddingVertical: 15,
  },
  amountText: {
    flex: 1,
    textAlign: 'right',
    color: COLORS.lightGrey1,
  },
  typeText: {
    flex: 1,
    color: COLORS.black,
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
  },
  statusText: {
    flex: 1,
    fontSize: FONT.SIZE.small,
    textAlign: 'right',
  },
  timeText: {
    flex: 1,
    textAlign: 'right',
    color: COLORS.lightGrey1,
  },
  noHistoryContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 30,
  },
  noHistoryText: {
    ...FONT.STYLE.medium,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  noHistoryActionButton: {
    width: 200,
  },
  divider: {
    marginBottom: 15,
  },
  title: {
    flex: 1,
    color: COLORS.black,
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
  },
  desc: {
    flex: 1,
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
  },
  leftText: {
    textAlign: 'left',
  },
  righText: {
    textAlign: 'right',
  },
});

export default style;
