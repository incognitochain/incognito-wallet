import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  recentHistory: {
    marginTop: 15,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  header: {
    borderBottomWidth: 1,
    borderColor: COLORS.lightGrey5,
    paddingHorizontal: 15,
  },
  title: {
    paddingVertical: 15,
    fontSize: 20,
    ...FONT.STYLE.medium,
  },
  viewHistoryText: {
    textAlign: 'center',
    paddingVertical: 5,
    ...FONT.STYLE.medium,
  },
  history: {
    marginHorizontal: 15,
  },
});
