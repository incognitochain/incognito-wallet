import { COLORS } from '@src/styles';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  tabContainer: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: 40
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey5,
  },
  tabItemActive: {
    backgroundColor: COLORS.white
  },
  tabContent: {
    flex: 1,
  },
  tabItemText: {
    textAlign: 'center',
    color: COLORS.lightGrey1
  },
  tabItemTextActive: {
    color: COLORS.dark1
  },
});
