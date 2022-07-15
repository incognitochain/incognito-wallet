import { FONT, COLORS, DECOR, UTILS } from '@src/styles';
import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
  },
  loadingContainer: {
    marginVertical: 15,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: DECOR.borderRadiusBorder,
  },
  row: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowTop: {
    marginBottom: 10,
  },
  itemContainer: {
    paddingVertical: 12,
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
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 8,
    marginBottom: 4
  },
  text: {
    ...FONT.STYLE.medium,
    maxWidth: UTILS.screenWidth() / 2 - 50,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 4,
  },
  desc: {
    ...FONT.STYLE.normal,
    maxWidth: UTILS.screenWidth() / 2 - 50,
    color: COLORS.lightGrey36,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardAmountContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.gray1,
    borderRadius: 100,
    marginRight: 12,
  },
  rewardAmountText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: 'bold',
    marginRight: 3
  },
});

export default style;
