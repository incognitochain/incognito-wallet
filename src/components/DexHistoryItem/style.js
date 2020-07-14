import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  history: {
    paddingVertical: 15,
  },
  historyType: {
    color: COLORS.dark1,
    marginBottom: 5,
    ...FONT.STYLE.bold,
    fontSize: 20,
  },
  shortDesc: {
    color: COLORS.newGrey,
    flex: 1,
    marginRight: 15,
    fontSize: 18,
  },
  icon: {
    marginLeft: 10,
    marginRight: -5,
  },
  successful: {
    color: COLORS.green,
  },
  refunded: {
    color: COLORS.orange,
  },
  unsuccessful: {
    color: COLORS.dark1,
  },
  error: {
    color: COLORS.red,
  },
  shortInfo: {
    flex: 1,
  },
  historyStatus: {
    maxWidth: 145,
  },
  lastItem: {
    borderBottomWidth: 0,
  }
});
